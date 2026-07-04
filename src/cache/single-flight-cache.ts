interface CacheEntry {
  value: unknown;
  expiry: number;
}

export class SingleFlightCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(
    private readonly now: () => number,
    private readonly maxEntries?: number,
  ) {}

  public async resolve<T>(
    key: string,
    successTtlMs: number,
    fetcher: () => Promise<T | null>,
    negativeTtlMs?: number,
  ): Promise<T | null> {
    const hit = this.cache.get(key);
    if (hit !== undefined) {
      if (hit.expiry > this.now()) {
        this.touch(key, hit);
        return hit.value as T | null;
      }
      this.cache.delete(key);
    }
    const pending = this.inflight.get(key);
    if (pending !== undefined) {
      return pending as Promise<T | null>;
    }
    const promise = (async (): Promise<T | null> => {
      const value = await fetcher();
      if (value !== null) {
        this.set(key, value, successTtlMs);
      } else if (negativeTtlMs !== undefined) {
        this.set(key, null, negativeTtlMs);
      }
      return value;
    })();
    this.inflight.set(key, promise);
    try {
      return await promise;
    } finally {
      this.inflight.delete(key);
    }
  }

  public set(key: string, value: unknown, ttlMs: number): void {
    this.cache.delete(key);
    this.cache.set(key, { value, expiry: this.now() + ttlMs });
    this.evict();
  }

  public clear(): void {
    this.cache.clear();
  }

  private touch(key: string, entry: CacheEntry): void {
    this.cache.delete(key);
    this.cache.set(key, entry);
  }

  private evict(): void {
    if (this.maxEntries === undefined) {
      return;
    }
    while (this.cache.size > this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      this.cache.delete(oldest);
    }
  }
}

