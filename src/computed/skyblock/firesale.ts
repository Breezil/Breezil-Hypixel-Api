import { type SkyBlockFireSale } from "@breezil/hypixel-parsers";

import { percent } from "../shared/ratio";

export interface FireSaleComputed {
  readonly hasStarted: boolean;
  readonly hasEnded: boolean;
  readonly isActive: boolean;
  readonly timeUntilStartMs: number;
  readonly timeUntilEndMs: number;
  readonly durationMs: number;
  readonly elapsedPercent: number;
  readonly totalStockValue: number;
}

export function computeFireSale(raw: SkyBlockFireSale): FireSaleComputed {
  const now = Date.now();
  const untilStart = raw.startTimestamp - now;
  const untilEnd = raw.endTimestamp - now;
  const hasStarted = untilStart <= 0;
  const hasEnded = untilEnd <= 0;
  const durationMs = Math.max(raw.endTimestamp - raw.startTimestamp, 0);
  const elapsed = Math.min(Math.max(now - raw.startTimestamp, 0), durationMs);
  return {
    hasStarted,
    hasEnded,
    isActive: hasStarted && !hasEnded,
    timeUntilStartMs: Math.max(untilStart, 0),
    timeUntilEndMs: Math.max(untilEnd, 0),
    durationMs,
    elapsedPercent: percent(elapsed, durationMs),
    totalStockValue: raw.amount * raw.price,
  };
}

