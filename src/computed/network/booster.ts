import { type StaticBooster } from "@breezil/hypixel-parsers";

import { gameById, type GameInfo } from "../shared/games";
import { percent } from "../shared/ratio";

export interface BoosterComputed {
  readonly game: GameInfo;
  readonly isExpired: boolean;
  readonly isActive: boolean;
  readonly isStacked: boolean;
  readonly stackedCount: number;
  readonly consumedLength: number;
  readonly remainingPercent: number;
}

export function computeBooster(raw: StaticBooster): BoosterComputed {
  // The API flips `length` negative once a booster expires.
  const isExpired = raw.length < 0;
  const stackedCount = Array.isArray(raw.stacked) ? raw.stacked.length : 0;
  const isStacked = Array.isArray(raw.stacked)
    ? stackedCount > 0
    : raw.stacked === true;
  const remaining = Math.max(raw.length, 0);
  return {
    game: gameById(raw.gameType),
    isExpired,
    isActive: raw.length > 0 && raw.length < raw.originalLength,
    isStacked,
    stackedCount,
    consumedLength: raw.originalLength - remaining,
    remainingPercent: percent(remaining, raw.originalLength),
  };
}

