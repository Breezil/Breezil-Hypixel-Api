import { sleep } from "./sleep";

const FALLBACK_WAIT_MS = 1000;
const DEFAULT_PENALTY_MS = 5000;
const RESET_SLACK_MS = 10;

export class RateLimitGate {
  private _limit: number | null = null;
  private _remaining: number | null = null;
  private _resetAt: number | null = null;

  get limit(): number | null {
    return this._limit;
  }
  get remaining(): number | null {
    return this._remaining;
  }
  get resetAt(): number | null {
    return this._resetAt;
  }

  constructor(private readonly now: () => number) {}

  public async acquire(): Promise<void> {
    for (;;) {
      const now = this.now();
      if (this._resetAt !== null && now >= this._resetAt) {
        this._remaining = this._limit;
        this._resetAt = null;
      }
      if (this._remaining === null || this._remaining > 0) {
        if (this._remaining !== null) {
          this._remaining -= 1;
        }
        return;
      }
      const wait =
        this._resetAt === null ? FALLBACK_WAIT_MS : this._resetAt - now;
      await sleep(Math.max(0, wait) + RESET_SLACK_MS);
    }
  }

  public update(headers: Headers): void {
    const limit = readNumber(headers, "ratelimit-limit");
    const remaining = readNumber(headers, "ratelimit-remaining");
    const resetSeconds = readNumber(headers, "ratelimit-reset");
    if (limit !== null) {
      this._limit = limit;
    }
    if (remaining !== null) {
      this._remaining = remaining;
    }
    if (resetSeconds !== null) {
      this._resetAt = this.now() + resetSeconds * 1000;
    }
  }

  public penalize(headers: Headers): void {
    this._remaining = 0;
    const resetSeconds =
      readNumber(headers, "ratelimit-reset") ??
      readNumber(headers, "retry-after");
    this._resetAt =
      this.now() +
      (resetSeconds === null ? DEFAULT_PENALTY_MS : resetSeconds * 1000);
  }
}

function readNumber(headers: Headers, name: string): number | null {
  const raw = headers.get(name) ?? headers.get(`x-${name}`);
  if (raw === null) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

