import type {
  ArenaBrawlModeStats,
  ArenaBrawlStats,
} from "@breezil/hypixel-parsers";

import { argMax, minPositive, sum } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface ArenaBrawlModeComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly damagePerGame: number;
  readonly healPerGame: number;
  readonly damagePerKill: number;
  readonly winShare: number;
}

export interface ArenaBrawlComputed {
  readonly modes: Readonly<Record<string, ArenaBrawlModeComputed>>;
  readonly totalKills: number;
  readonly totalDeaths: number;
  readonly totalLosses: number;
  readonly totalGames: number;
  readonly overallKdr: number;
  readonly killsForNextKdr: number;
  readonly overallWlr: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly bestWinStreak: number;
  readonly totalUpgradeLevel: number;
  readonly latestRating: number;
  readonly bestLadderPosition: number;
  readonly mostPlayedMode: string | null;
}

function computeMode(
  mode: ArenaBrawlModeStats,
  totalWins: number,
): ArenaBrawlModeComputed {
  return {
    kdr: ratio(mode.kills, mode.deaths),
    killsForNextKdr: neededForNextWholeRatio(mode.kills, mode.deaths),
    wlr: ratio(mode.wins, mode.losses),
    winsForNextWlr: neededForNextWholeRatio(mode.wins, mode.losses),
    winRate: ratio(mode.wins, mode.games),
    damagePerGame: perGame(mode.damage, mode.games),
    healPerGame: perGame(mode.healed, mode.games),
    damagePerKill: ratio(mode.damage, mode.kills),
    winShare: percent(mode.wins, totalWins),
  };
}

function latestRating(raw: ArenaBrawlStats): number {
  let latest: { readonly order: number; readonly rating: number } | null = null;
  for (const [date, entry] of Object.entries(raw.datedRatings)) {
    const [month, year] = date.split("_").map(Number);
    const order = year * 100 + month;
    if (latest === null || order > latest.order) {
      latest = { order, rating: entry.rating };
    }
  }
  return latest?.rating ?? 0;
}

function bestLadderPosition(raw: ArenaBrawlStats): number {
  return minPositive(
    Object.values(raw.datedRatings).map((entry) => entry.position),
  );
}

export function computeArenaBrawl(raw: ArenaBrawlStats): ArenaBrawlComputed {
  const all = Object.values(raw.modes);
  const totalKills = sum(all.map((mode) => mode.kills));
  const totalDeaths = sum(all.map((mode) => mode.deaths));
  const totalLosses = sum(all.map((mode) => mode.losses));
  const totalGames = sum(all.map((mode) => mode.games));

  const modes: Record<string, ArenaBrawlModeComputed> = {};
  for (const [id, mode] of Object.entries(raw.modes)) {
    modes[id] = computeMode(mode, raw.wins);
  }

  return {
    modes,
    totalKills,
    totalDeaths,
    totalLosses,
    totalGames,
    overallKdr: ratio(totalKills, totalDeaths),
    killsForNextKdr: neededForNextWholeRatio(totalKills, totalDeaths),
    overallWlr: ratio(raw.wins, totalLosses),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, totalLosses),
    winRate: ratio(raw.wins, totalGames),
    killsPerGame: perGame(totalKills, totalGames),
    bestWinStreak: Math.max(0, ...all.map((mode) => mode.winStreak)),
    totalUpgradeLevel:
      raw.upgrades.cooldown +
      raw.upgrades.damage +
      raw.upgrades.energy +
      raw.upgrades.health,
    latestRating: latestRating(raw),
    bestLadderPosition: bestLadderPosition(raw),
    mostPlayedMode: argMax(
      Object.entries(raw.modes).map(([id, mode]) => [id, mode.games] as const),
      0,
    ),
  };
}

