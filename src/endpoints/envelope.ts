import { bool, obj } from "@breezil/hypixel-parsers";

export interface Timestamped<T> {
  readonly lastUpdatedAt: Date | null;
  readonly value: T;
}

export interface BoosterState {
  readonly decrementing: boolean;
}

export function parseBoosterState(
  envelope: Record<string, unknown>,
): BoosterState {
  return { decrementing: bool(obj(envelope, "boosterState"), "decrementing") };
}

