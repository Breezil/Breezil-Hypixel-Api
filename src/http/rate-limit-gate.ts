import { sleep } from "./sleep";

const FALLBACK_WAIT_MS = 1000;
const DEFAULT_PENALTY_MS = 5000;
const RESET_SLACK_MS = 10;

export class RateLimitGate {
  private limit: number | null = null;
  private remaining: number | null = null;
  private resetAt: number | null = null;

  constructor(private readonly now: () => number) {}

  public async acquire(): Promise<void> {
    for (;;) {
      const now = this.now();
      if (this.resetAt !== null && now >= this.resetAt) {
        this.remaining = this.limit;
        this.resetAt = null;
      }
      if (this.remaining === null || this.remaining > 0) {
        if (this.remaining !== null) {
          this.remaining -= 1;
        }
        return;
      }
      const wait =
        this.resetAt === null ? FALLBACK_WAIT_MS : this.resetAt - now;
      await sleep(Math.max(0, wait) + RESET_SLACK_MS);
    }
  }

  public update(headers: Headers): void {
    const limit = readNumber(headers, "ratelimit-limit");
    const remaining = readNumber(headers, "ratelimit-remaining");
    const resetSeconds = readNumber(headers, "ratelimit-reset");
    if (limit !== null) {
      this.limit = limit;
    }
    if (remaining !== null) {
      this.remaining = remaining;
    }
    if (resetSeconds !== null) {
      this.resetAt = this.now() + resetSeconds * 1000;
    }
  }

  public penalize(headers: Headers): void {
    this.remaining = 0;
    const resetSeconds =
      readNumber(headers, "ratelimit-reset") ??
      readNumber(headers, "retry-after");
    this.resetAt =
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

