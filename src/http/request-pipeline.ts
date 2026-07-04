import type { ExternalRequester, HttpRequester } from "./requester";
import { SingleFlightCache } from "../cache/single-flight-cache";
import type { HypixelApiConfigSource } from "../config";
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
  | { readonly done: false };

export class RequestPipeline implements HttpRequester, ExternalRequester {
  private readonly cache: SingleFlightCache;
  private readonly limiter = new Semaphore(MAX_CONCURRENT_REQUESTS);
  private readonly gate: RateLimitGate;

  constructor(
    private readonly getConfig: HypixelApiConfigSource,
    now: () => number = () => Date.now(),
  ) {
    this.cache = new SingleFlightCache(now, MAX_CACHE_ENTRIES);
    this.gate = new RateLimitGate(now);
  }

  public hasApiKey(): boolean {
    return this.getConfig().apiKey.trim().length > 0;
  }

  public async request<T = Record<string, unknown>>(
    endpoint: string,
  ): Promise<T | null> {
    const key = this.getConfig().apiKey.trim();
    if (key.length === 0) {
      return null;
    }
    const body = await this.cached<Record<string, unknown>>(endpoint, () =>
      this.fetchJson(
        `${HYPIXEL_BASE_URL}${endpoint}`,
        { headers: { "API-Key": key } },
        this.gate,
      ),
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
    init?: RequestInit,
    gate?: RateLimitGate,
  ): Promise<T | null> {
    return this.limiter.run(async () => {
      for (let attempt = 0; attempt < FETCH_ATTEMPTS; attempt += 1) {
        const outcome = await tryFetch<T>(url, init, gate);
        if (outcome.done) {
          return outcome.value;
        }
      }
      return null;
    });
  }
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
    return { done: false };
  }
  if (res.status === 429) {
    return (await shouldRetryAfterRateLimit(res, gate))
      ? { done: false }
      : { done: true, value: null };
  }
  if (!res.ok) {
    return { done: true, value: null };
  }
  if (gate !== undefined) {
    gate.update(res.headers);
  }
  const body = await withDeadline(res.json() as Promise<T>);
  return body === null ? { done: false } : { done: true, value: body };
}

// A per-player cooldown won't clear by retrying; a rate-limit will after its reset.
async function shouldRetryAfterRateLimit(
  res: Response,
  gate: RateLimitGate | undefined,
): Promise<boolean> {
  if (gate === undefined || (await isPlayerCooldown(res))) {
    return false;
  }
  gate.penalize(res.headers);
  return true;
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

// AbortController is ignored by the packaged runtime, so race a timer instead.
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

