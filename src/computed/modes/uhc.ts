import type { UHCModeStats, UHCStats } from "@breezil/hypixel-parsers";

import { neededForNextWholeRatio, percent, ratio } from "../shared/ratio";
import { argMax } from "../shared/aggregate";

export interface UHCModeComputed {
  readonly KDR: number;
  readonly killsForNextKdr: number;
  readonly winShare: number;
}

export interface UHCTotals {
  readonly kills: number;
  readonly wins: number;
  readonly deaths: number;
  readonly headsEaten: number;
  readonly ultimatesCrafted: number;
  readonly extraUltimatesCrafted: number;
}

export interface UHCComputed extends UHCTotals {
  readonly starLevel: number;
  readonly starTitle: string;
  readonly KDR: number;
  readonly killsForNextKdr: number;
  readonly scoreForNextStar: number;
  readonly killsPerWin: number;
  readonly headsPerWin: number;
  readonly extraUltimateRatio: number;
  readonly modes: Readonly<Record<string, UHCModeComputed>>;
  readonly totalsIncludingVanillaDoubles: UHCTotals;
  readonly favoriteMode: string;
  readonly perksUnlocked: number;
  readonly mostUsedKit: string;
}

const SCORING_MODES = [
  "solo",
  "team",
  "redVsBlue",
  "noDiamonds",
  "brawl",
  "soloBrawl",
  "duoBrawl",
] as const;

const ALL_MODES = [...SCORING_MODES, "vanillaDoubles"] as const;

const STAR_SCORE_THRESHOLDS = [
  0,
  1,
  6,
  21,
  46,
  96,
  171,
  271,
  521,
  1021,
  1321,
  1621,
  1921,
  2221,
  2521,
  Infinity,
].map((threshold) => threshold * 10);

const STAR_TITLES = [
  "Recruit",
  "Initiate",
  "Soldier",
  "Sergeant",
  "Knight",
  "Captain",
  "Centurion",
  "Gladiator",
  "Warlord",
  "Champion",
] as const;

function starLevel(kills: number, wins: number): number {
  const score = kills + wins * 10;
  return STAR_SCORE_THRESHOLDS.findIndex((threshold) => threshold > score);
}

function scoreForNextStar(kills: number, wins: number, level: number): number {
  const nextThreshold = STAR_SCORE_THRESHOLDS[level];
  return Number.isFinite(nextThreshold)
    ? nextThreshold - (kills + wins * 10)
    : 0;
}

function starTitle(level: number): string {
  return STAR_TITLES[Math.min(Math.max(level, 1), STAR_TITLES.length) - 1];
}

function sumModes(modes: readonly UHCModeStats[]): UHCTotals {
  return modes.reduce<UHCTotals>(
    (acc, mode) => ({
      kills: acc.kills + mode.kills,
      wins: acc.wins + mode.wins,
      deaths: acc.deaths + mode.deaths,
      headsEaten: acc.headsEaten + mode.headsEaten,
      ultimatesCrafted: acc.ultimatesCrafted + mode.ultimatesCrafted,
      extraUltimatesCrafted:
        acc.extraUltimatesCrafted + mode.extraUltimatesCrafted,
    }),
    {
      kills: 0,
      wins: 0,
      deaths: 0,
      headsEaten: 0,
      ultimatesCrafted: 0,
      extraUltimatesCrafted: 0,
    },
  );
}

function favoriteMode(raw: UHCStats): string {
  const scores = ALL_MODES.map((key) => {
    const mode = raw[key];
    return [key, mode.kills + mode.wins + mode.deaths] as const;
  });
  return argMax(scores, -1) ?? "";
}

export function computeUHC(raw: UHCStats): UHCComputed {
  const totals = sumModes(SCORING_MODES.map((key) => raw[key]));
  const modes: Record<string, UHCModeComputed> = {};
  for (const key of SCORING_MODES) {
    const mode = raw[key];
    modes[key] = {
      KDR: ratio(mode.kills, mode.deaths),
      killsForNextKdr: neededForNextWholeRatio(mode.kills, mode.deaths),
      winShare: percent(mode.wins, totals.wins),
    };
  }
  const star = starLevel(totals.kills, totals.wins);
  return {
    starLevel: star,
    starTitle: starTitle(star),
    ...totals,
    KDR: ratio(totals.kills, totals.deaths),
    killsForNextKdr: neededForNextWholeRatio(totals.kills, totals.deaths),
    scoreForNextStar: scoreForNextStar(totals.kills, totals.wins, star),
    killsPerWin: ratio(totals.kills, totals.wins),
    headsPerWin: ratio(totals.headsEaten, totals.wins),
    extraUltimateRatio: ratio(
      totals.extraUltimatesCrafted,
      totals.ultimatesCrafted,
    ),
    modes,
    totalsIncludingVanillaDoubles: sumModes(ALL_MODES.map((key) => raw[key])),
    favoriteMode: favoriteMode(raw),
    perksUnlocked: Object.keys(raw.perks).length,
    mostUsedKit: argMax(raw.kits, -1) ?? "",
  };
}

