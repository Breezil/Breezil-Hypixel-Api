import type {
  MegaWallsActivityStats,
  MegaWallsClassBreakdown,
  MegaWallsKitStats,
  MegaWallsStats,
} from "@breezil/hypixel-parsers";

import { argMax } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface MegaWallsClassComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly kda: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
}

export interface MegaWallsRatioSet {
  readonly kdr: number;
  readonly wlr: number;
  readonly fkdr: number;
}

export interface MegaWallsModesComputed {
  readonly standard: MegaWallsRatioSet;
  readonly faceOff: MegaWallsRatioSet;
  readonly gvg: MegaWallsRatioSet;
}

export interface MegaWallsComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly fkdr: number;
  readonly finalKills: number;
  readonly finalDeaths: number;
  readonly finalAssists: number;
  readonly witherDamage: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly finalKillsPerGame: number;
  readonly kda: number;
  readonly meleeKillShare: number;
  readonly blockPlaceBreakRatio: number;
  readonly witherDamagePerGame: number;
  readonly finalsForNextFkdr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly favoriteKit: string;
  readonly modes: MegaWallsModesComputed;
  readonly byKit: Readonly<Record<string, MegaWallsRatioSet>>;
  readonly byClass: Readonly<Record<string, MegaWallsClassComputed>>;
}

type MegaWallsRatioMode = "overall" | "standard" | "faceOff" | "gvg";

function ratioSet(
  stats: MegaWallsActivityStats,
  mode: MegaWallsRatioMode,
): MegaWallsRatioSet {
  return {
    kdr: ratio(stats.kills[mode], stats.deaths[mode]),
    wlr: ratio(stats.wins[mode], stats.losses[mode]),
    fkdr: ratio(stats.finalKills[mode], stats.finalDeaths[mode]),
  };
}

function classRatios(klass: MegaWallsClassBreakdown): MegaWallsClassComputed {
  return {
    kdr: ratio(klass.kills, klass.deaths),
    wlr: ratio(klass.wins, klass.losses),
    winRate: ratio(klass.wins, klass.wins + klass.losses),
    kda: ratio(klass.kills + klass.assists, klass.deaths),
    killsForNextKdr: neededForNextWholeRatio(klass.kills, klass.deaths),
    winsForNextWlr: neededForNextWholeRatio(klass.wins, klass.losses),
  };
}

function byClassRatios(
  byClass: Readonly<Record<string, MegaWallsClassBreakdown>>,
): Readonly<Record<string, MegaWallsClassComputed>> {
  const result: Record<string, MegaWallsClassComputed> = {};
  for (const [name, klass] of Object.entries(byClass)) {
    result[name] = classRatios(klass);
  }
  return result;
}

function byKitRatios(
  kits: Readonly<Record<string, MegaWallsKitStats>>,
): Readonly<Record<string, MegaWallsRatioSet>> {
  const result: Record<string, MegaWallsRatioSet> = {};
  for (const [name, kit] of Object.entries(kits)) {
    result[name] = ratioSet(kit.stats, "overall");
  }
  return result;
}

function favoriteKit(
  kits: Readonly<Record<string, MegaWallsKitStats>>,
): string {
  const gamesByKit = Object.entries(kits).map(
    ([name, kit]) => [name, kit.stats.gamesPlayed.overall] as const,
  );
  return argMax(gamesByKit, 0) ?? "";
}

export function computeMegaWalls(raw: MegaWallsStats): MegaWallsComputed {
  const s = raw.stats;
  const kills = s.kills.overall;
  const deaths = s.deaths.overall;
  const wins = s.wins.overall;
  const losses = s.losses.overall;
  const assists = s.assists.overall;
  const games = s.gamesPlayed.overall;
  const finalKills = s.finalKills.overall + raw.finalKillsLegacy;
  const finalDeaths = s.finalDeaths.overall + raw.finalDeathsLegacy;
  const finalAssists = s.finalAssists.overall + raw.finalAssistsLegacy;
  const witherDamage = s.witherDamage.overall + raw.witherDamageLegacy;
  return {
    kdr: ratio(kills, deaths),
    wlr: ratio(wins, losses),
    fkdr: ratio(finalKills, finalDeaths),
    finalKills,
    finalDeaths,
    finalAssists,
    witherDamage,
    winRate: ratio(wins, wins + losses),
    killsPerGame: perGame(kills, games),
    finalKillsPerGame: perGame(finalKills, games),
    kda: ratio(kills + assists, deaths),
    meleeKillShare: percent(s.kills.melee.overall, kills),
    blockPlaceBreakRatio: ratio(s.blocksPlaced.overall, s.blocksBroken.overall),
    witherDamagePerGame: perGame(witherDamage, games),
    finalsForNextFkdr: neededForNextWholeRatio(finalKills, finalDeaths),
    killsForNextKdr: neededForNextWholeRatio(kills, deaths),
    winsForNextWlr: neededForNextWholeRatio(wins, losses),
    favoriteKit: favoriteKit(raw.kits),
    modes: {
      standard: ratioSet(s, "standard"),
      faceOff: ratioSet(s, "faceOff"),
      gvg: ratioSet(s, "gvg"),
    },
    byKit: byKitRatios(raw.kits),
    byClass: byClassRatios(raw.byClass),
  };
}

