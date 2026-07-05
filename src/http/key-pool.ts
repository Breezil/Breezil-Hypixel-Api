import { RateLimitGate } from "./rate-limit-gate";

export interface KeyDiagnostics {
  readonly key: string;
  readonly remaining: number | null;
  readonly limit: number | null;
  readonly resetAt: number | null;
}

export class KeyPool {
  private readonly gates = new Map<string, RateLimitGate>();
  private index = 0;

  constructor(private readonly now: () => number) {}

  select(keys: readonly string[]): { key: string; gate: RateLimitGate } | null {
    this.sync(keys);
    if (this.gates.size === 0) {
      return null;
    }
    const flat = [...this.gates.keys()];
    this.index = this.index % flat.length;
    const key = flat[this.index];
    this.index = (this.index + 1) % flat.length;
    return { key, gate: this.gates.get(key)! };
  }

  diagnostics(): KeyDiagnostics[] {
    const result: KeyDiagnostics[] = [];
    for (const [key, gate] of this.gates) {
      result.push({
        key,
        remaining: gate.remaining,
        limit: gate.limit,
        resetAt: gate.resetAt,
      });
    }
    return result;
  }

  hasKeys(): boolean {
    return this.gates.size > 0;
  }

  private sync(keys: readonly string[]): void {
    const keySet = new Set(keys);
    for (const k of this.gates.keys()) {
      if (!keySet.has(k)) {
        this.gates.delete(k);
      }
    }
    for (const k of keys) {
      if (!this.gates.has(k)) {
        this.gates.set(k, new RateLimitGate(this.now));
      }
    }
    if (this.index >= keys.length) {
      this.index = 0;
    }
  }
}

