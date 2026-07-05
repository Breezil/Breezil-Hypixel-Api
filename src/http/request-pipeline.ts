import { parseKeyList, type HypixelApiConfigSource } from "../config";
import type { ExternalRequester, HttpRequester } from "./requester";
import { SingleFlightCache } from "../cache/single-flight-cache";
import { KeyPool, type KeyDiagnostics } from "./key-pool";
import { RateLimitGate } from "./rate-limit-gate";
import { Semaphore } from "./semaphore";
import { sleep } from "./sleep";

const HYPIXEL_BASE_URL = "https://api.hypixel.net/v2";
const MAX_CONCURRENT_REQUESTS = 16;
const MAX_CACHE_ENTRIES = 1000;
const FETCH_ATTEMPTS = 4;
const FETCH_TIMEOUT_MS = 5000;

type FetchOutcome<T> =
  | { readonly done: true; readonly value: T | null }
  | { readonly done: false; readonly gatePenalized: boolean };

export class RequestPipeline implements HttpRequester, ExternalRequester {
  private readonly cache: SingleFlightCache;
  private readonly limiter = new Semaphore(MAX_CONCURRENT_REQUESTS);
  private readonly keyPool: KeyPool;

  constructor(
    private readonly getConfig: HypixelApiConfigSource,
    now: () => number = () => Date.now(),
  ) {
    this.cache = new SingleFlightCache(now, MAX_CACHE_ENTRIES);
    this.keyPool = new KeyPool(now);
  }

  public hasApiKey(): boolean {
    const keys = parseKeyList(this.getConfig().apiKey);
    return keys.length > 0;
  }

  public async request<T = Record<string, unknown>>(
    endpoint: string,
  ): Promise<T | null> {
    const keys = parseKeyList(this.getConfig().apiKey);
    if (keys.length === 0) {
      return null;
    }
    const body = await this.cached<Record<string, unknown>>(endpoint, () =>
      this.fetchJson(`${HYPIXEL_BASE_URL}${endpoint}`, keys),
    );
    if (body === null || body.success === false) {
      return null;
    }
    return body as T;
  }

  public requestExternal<T>(cacheKey: string, url: string): Promise<T | null> {
    return this.cached<T>(cacheKey, () => this.fetchJson<T>(url));
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public keyDiagnostics(): KeyDiagnostics[] {
    const keys = parseKeyList(this.getConfig().apiKey);
    if (keys.length > 0) {
      this.keyPool.select(keys);
    }
    return this.keyPool.diagnostics();
  }

  private cached<T>(
    key: string,
    fetcher: () => Promise<T | null>,
  ): Promise<T | null> {
    return this.cache.resolve(
      key,
      this.getConfig().cacheTtlSeconds * 1000,
      fetcher,
    );
  }

  private fetchJson<T = Record<string, unknown>>(
    url: string,
    keys?: readonly string[],
  ): Promise<T | null> {
    return this.limiter.run(async () => {
      if (keys === undefined) {
        return retryLoop<T>(() => tryFetch<T>(url, undefined, undefined));
      }
      return retryWithKeys<T>(url, keys, this.keyPool);
    });
  }
}

async function retryWithKeys<T>(
  url: string,
  keys: readonly string[],
  pool: KeyPool,
): Promise<T | null> {
  let timeoutCount = 0;
  for (let attempt = 0; attempt < FETCH_ATTEMPTS; attempt += 1) {
    const entry = pool.select(keys);
    if (entry === null) {
      return null;
    }
    const init: RequestInit = { headers: { "API-Key": entry.key } };
    const outcome = await tryFetch<T>(url, init, entry.gate);
    if (outcome.done) {
      return outcome.value;
    }
    if (outcome.gatePenalized) {
      timeoutCount = 0;
    } else {
      timeoutCount += 1;
      if (timeoutCount >= 2) {
        return null;
      }
    }
  }
  return null;
}

async function retryLoop<T>(
  attempt: () => Promise<FetchOutcome<T>>,
): Promise<T | null> {
  for (let i = 0; i < FETCH_ATTEMPTS; i += 1) {
    const outcome = await attempt();
    if (outcome.done) {
      return outcome.value;
    }
  }
  return null;
}

async function tryFetch<T>(
  url: string,
  init: RequestInit | undefined,
  gate: RateLimitGate | undefined,
): Promise<FetchOutcome<T>> {
  if (gate !== undefined) {
    await gate.acquire();
  }
  const res = await withDeadline(fetch(url, init));
  if (res === null) {
    return { done: false, gatePenalized: false };
  }
  if (res.status === 429) {
    return handleRateLimit<T>(res, gate);
  }
  if (!res.ok) {
    return { done: true, value: null };
  }
  if (gate !== undefined) {
    gate.update(res.headers);
  }
  const body = await withDeadline(res.json() as Promise<T>);
  return body === null
    ? { done: false, gatePenalized: false }
    : { done: true, value: body };
}

async function handleRateLimit<T>(
  res: Response,
  gate: RateLimitGate | undefined,
): Promise<FetchOutcome<T>> {
  if (gate === undefined || (await isPlayerCooldown(res))) {
    return { done: true, value: null };
  }
  gate.penalize(res.headers);
  return { done: false, gatePenalized: true };
}

async function isPlayerCooldown(res: Response): Promise<boolean> {
  try {
    const body = (await res.json()) as { cause?: unknown };
    return (
      typeof body.cause === "string" && body.cause.includes("too recently")
    );
  } catch {
    return false;
  }
}

async function withDeadline<T>(promise: Promise<T>): Promise<T | null> {
  const settled = await Promise.race([
    promise.then(
      (value) => ({ value }),
      () => ({ value: null }),
    ),
    sleep(FETCH_TIMEOUT_MS).then(() => ({ value: null })),
  ]);
  return settled.value;
}

