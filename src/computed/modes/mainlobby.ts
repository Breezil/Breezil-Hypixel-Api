import type { MainLobbyStats } from "@breezil/hypixel-parsers";

import { sum } from "../shared/aggregate";
import { percent, ratio } from "../shared/ratio";

export interface MainLobbyComputed {
  readonly totalFishingCatches: number;
  readonly treasureCatchRate: number;
  readonly junkCatchRate: number;
  readonly lavaCatchShare: number;
  readonly totalOrbsCollected: number;
  readonly zonesDiscoveredCount: number;
  readonly relicsCollectedCount: number;
  readonly specialFishCaughtCount: number;
  readonly totalFishingEnchantLevels: number;
  readonly becomeRabbitTotalEaten: number;
  readonly treasureToJunkRatio: number;
  readonly uniqueFishSpeciesCaught: number;
}

const EMPTY: Readonly<Record<string, number>> = {};

function countTrue(record: Readonly<Record<string, boolean>>): number {
  return Object.values(record).filter(Boolean).length;
}

function countPositive(record: Readonly<Record<string, number>>): number {
  return Object.values(record).filter((value) => value > 0).length;
}

export function computeMainLobby(raw: MainLobbyStats): MainLobbyComputed {
  const permanent = raw.fishing.stats.permanent;
  const water = permanent?.counts.water ?? EMPTY;
  const lava = permanent?.counts.lava ?? EMPTY;
  const ice = permanent?.counts.ice ?? EMPTY;
  const totalFishingCatches = sum(water) + sum(lava) + sum(ice);
  const categoryTotal = (category: string): number =>
    (water[category] ?? 0) + (lava[category] ?? 0) + (ice[category] ?? 0);
  const totalJunk = categoryTotal("junk");
  const totalTreasure = categoryTotal("treasure");

  let totalFishingEnchantLevels = 0;
  for (const enchant of Object.values(raw.fishing.enchants)) {
    totalFishingEnchantLevels += enchant.level;
  }

  return {
    totalFishingCatches,
    treasureCatchRate: ratio(totalTreasure, totalFishingCatches),
    junkCatchRate: ratio(totalJunk, totalFishingCatches),
    lavaCatchShare: percent(sum(lava), totalFishingCatches),
    totalOrbsCollected: sum(raw.fishing.orbs.counts),
    zonesDiscoveredCount: countTrue(raw.discoveredZones),
    relicsCollectedCount: countTrue(raw.relics),
    specialFishCaughtCount: countTrue(raw.fishing.specialFish),
    totalFishingEnchantLevels,
    becomeRabbitTotalEaten: sum(raw.becomeRabbit.eaten),
    treasureToJunkRatio: ratio(totalTreasure, totalJunk),
    uniqueFishSpeciesCaught: countPositive(permanent?.individual.fish ?? EMPTY),
  };
}

