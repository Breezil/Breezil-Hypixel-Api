import type {
  TrueCombatModeStats,
  TrueCombatStats,
} from "@breezil/hypixel-parsers";
import {
  neededForNextWholeRatio,
  perGame,
  percent,
  ratio,
} from "../shared/ratio";

export interface TrueCombatModeComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killShare: number;
}

export interface TrueCombatComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly arrowAccuracy: number;
  readonly averageSurvivors: number;
  readonly skullsPerGame: number;
  readonly goldenSkullConversionRate: number;
  readonly giantZombieRareLootRate: number;
  readonly totalCrazyWallsKills: number;
  readonly kitsUnlockedCount: number;
  readonly modes: Readonly<Record<string, TrueCombatModeComputed>>;
}

function computeMode(
  stats: TrueCombatModeStats,
  totalKills: number,
): TrueCombatModeComputed {
  return {
    kdr: ratio(stats.kills, stats.deaths),
    wlr: ratio(stats.wins, stats.losses),
    winRate: ratio(stats.wins, stats.games),
    killShare: percent(stats.kills, totalKills),
  };
}

export function computeTrueCombat(raw: TrueCombatStats): TrueCombatComputed {
  const modeEntries = Object.entries(raw.crazyWalls);
  const totalCrazyWallsKills = modeEntries.reduce(
    (total, [, mode]) => total + mode.kills,
    0,
  );
  const modes: Record<string, TrueCombatModeComputed> = {};
  for (const [name, stats] of modeEntries) {
    modes[name] = computeMode(stats, totalCrazyWallsKills);
  }
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    wlr: ratio(raw.wins, raw.losses),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, raw.losses),
    winRate: ratio(raw.wins, raw.games),
    killsPerGame: perGame(raw.kills, raw.games),
    arrowAccuracy: ratio(raw.arrowsHit, raw.arrowsShot),
    averageSurvivors: perGame(raw.survivedPlayers, raw.games),
    skullsPerGame: perGame(raw.skullsGathered, raw.games),
    goldenSkullConversionRate: ratio(raw.goldenSkulls, raw.skullsGathered),
    giantZombieRareLootRate: ratio(
      raw.giantZombieLegendaries + raw.giantZombieRares,
      raw.giantZombie,
    ),
    totalCrazyWallsKills,
    kitsUnlockedCount: Object.keys(raw.kits).length,
    modes,
  };
}

