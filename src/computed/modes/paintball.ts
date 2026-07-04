import type { PaintballStats } from "@breezil/hypixel-parsers";

import { neededForNextWholeRatio, percent, ratio } from "../shared/ratio";
import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { argMax, sum } from "../shared/aggregate";

export interface PaintballComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly shotsPerKill: number;
  readonly killAccuracyPercent: number;
  readonly perksTotalLevel: number;
  readonly killsPerWin: number;
  readonly totalMapVotes: number;
  readonly favoriteMap: string;
  readonly weeklyKills: number;
  readonly monthlyKills: number;
  readonly killStreaksPerWin: number;
}

export function computePaintball(raw: PaintballStats): PaintballComputed {
  const votes: readonly (readonly [string, number])[] = Object.entries(
    raw.mapVotes,
  );
  const now = new Date();
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    shotsPerKill: ratio(raw.shotsFired, raw.kills),
    killAccuracyPercent: percent(raw.kills, raw.shotsFired),
    perksTotalLevel: sum(Object.values(raw.perks)),
    killsPerWin: ratio(raw.kills, raw.wins),
    totalMapVotes: sum(votes.map(([, count]) => count)),
    favoriteMap: argMax(votes, 0) ?? "",
    weeklyKills: weeklyValue(raw.weekly.killsA, raw.weekly.killsB, now),
    monthlyKills: monthlyValue(raw.monthly.killsA, raw.monthly.killsB, now),
    killStreaksPerWin: ratio(raw.killstreaks, raw.wins),
  };
}

