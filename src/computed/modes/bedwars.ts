import {
  type BedWarsStats,
  type BedWarsMode,
  type BedWarsKillsDeaths,
  type BedWarsCombatBreakdown,
  type BedWarsPracticeMode,
} from "@breezil/hypixel-parsers";
import {
  bedwarsStar,
  bedwarsPrestige,
  bedwarsXpToNextLevel,
  type BedwarsPrestige,
  BEDWARS_PRESTIGES,
  BEDWARS_PRESTIGE_CYCLE_XP,
} from "../shared/leveling";
import {
  round2,
  ratio,
  percent,
  perGame,
  neededForNextWholeRatio,
} from "../shared/ratio";

type BedWarsDamageType = keyof BedWarsCombatBreakdown;

export type BedWarsKillRatios = Readonly<
  Record<BedWarsDamageType, { readonly ratio: number }>
>;

export type BedWarsFinalRatios = Readonly<
  Record<BedWarsDamageType, { readonly ratio: number; readonly share: number }>
>;

export interface BedWarsBedRatios {
  readonly ratio: number;
}

export interface BedWarsModeComputed {
  readonly winLossRatio: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly finalKillsPerGame: number;
  readonly bedsBrokenPerGame: number;
  readonly resourcesPerGame: number;
  readonly ironPerGame: number;
  readonly goldPerGame: number;
  readonly diamondPerGame: number;
  readonly emeraldPerGame: number;
  readonly itemsPurchasedPerGame: number;
  readonly finalKillParticipation: number;
  readonly finalsForNextFkdr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly bedsForNextBblr: number;
  readonly beds: BedWarsBedRatios;
  readonly kills: BedWarsKillRatios;
  readonly finals: BedWarsFinalRatios;
}

export interface BedWarsPracticeModeComputed {
  readonly attempts: number;
  readonly successfulRatio: number;
}

export interface BedWarsPracticeComputed {
  readonly bridging: BedWarsPracticeModeComputed;
  readonly fireballJumping: BedWarsPracticeModeComputed;
  readonly mlg: BedWarsPracticeModeComputed;
  readonly pearlClutching: BedWarsPracticeModeComputed;
}

export type BedWarsSubmode =
  | "solo"
  | "doubles"
  | "threes"
  | "fours"
  | "fourVsFour"
  | "castle";

export interface BedWarsComputed {
  readonly level: number;
  readonly prestige: BedwarsPrestige;
  readonly xpToNextLevel: number;
  readonly starsToNextPrestige: number;
  readonly xpForNextPrestige: number;
  readonly index: number;
  readonly finalsPerStar: number;
  readonly winsPerStar: number;
  readonly legendaryChestRate: number;
  readonly practice: BedWarsPracticeComputed;
  readonly overall: BedWarsModeComputed;
  readonly perMode: Readonly<Record<BedWarsSubmode, BedWarsModeComputed>>;
}

function mapBreakdown<T>(
  breakdown: BedWarsCombatBreakdown,
  project: (entry: BedWarsKillsDeaths) => T,
): Readonly<Record<BedWarsDamageType, T>> {
  const result = {} as Record<BedWarsDamageType, T>;
  for (const type of Object.keys(breakdown) as BedWarsDamageType[]) {
    result[type] = project(breakdown[type]);
  }
  return result;
}

function computeMode(mode: BedWarsMode): BedWarsModeComputed {
  const games = mode.gamesPlayed;
  const totalFinals = mode.finals.total;
  return {
    winLossRatio: ratio(mode.wins, mode.losses),
    winRate: ratio(mode.wins, games),
    killsPerGame: perGame(mode.kills.total.kills, games),
    finalKillsPerGame: perGame(totalFinals.kills, games),
    bedsBrokenPerGame: perGame(mode.beds.broken, games),
    resourcesPerGame: perGame(mode.resources.total, games),
    ironPerGame: perGame(mode.resources.iron, games),
    goldPerGame: perGame(mode.resources.gold, games),
    diamondPerGame: perGame(mode.resources.diamond, games),
    emeraldPerGame: perGame(mode.resources.emerald, games),
    itemsPurchasedPerGame: perGame(mode.resources.itemsPurchased, games),
    finalKillParticipation: ratio(
      totalFinals.kills,
      totalFinals.kills + totalFinals.deaths,
    ),
    finalsForNextFkdr: neededForNextWholeRatio(
      totalFinals.kills,
      totalFinals.deaths,
    ),
    killsForNextKdr: neededForNextWholeRatio(
      mode.kills.total.kills,
      mode.kills.total.deaths,
    ),
    winsForNextWlr: neededForNextWholeRatio(mode.wins, mode.losses),
    bedsForNextBblr: neededForNextWholeRatio(mode.beds.broken, mode.beds.lost),
    beds: { ratio: ratio(mode.beds.broken, mode.beds.lost) },
    kills: mapBreakdown(mode.kills, (entry) => ({
      ratio: ratio(entry.kills, entry.deaths),
    })),
    finals: mapBreakdown(mode.finals, (entry) => ({
      ratio: ratio(entry.kills, entry.deaths),
      share: percent(entry.kills, totalFinals.kills),
    })),
  };
}

function computePracticeMode(
  mode: BedWarsPracticeMode,
): BedWarsPracticeModeComputed {
  return {
    attempts: mode.successfulAttempts + mode.failedAttempts,
    successfulRatio: ratio(mode.successfulAttempts, mode.failedAttempts),
  };
}

function bedwarsStarsToNextPrestige(star: number): number {
  const next = BEDWARS_PRESTIGES.find((entry) => entry.level > star);
  return next ? round2(next.level - star) : 0;
}

export function computeBedWars(raw: BedWarsStats): BedWarsComputed {
  const level = bedwarsStar(raw.experience);
  const overallFinals = raw.overall.finals.total;
  const fkdr = ratio(overallFinals.kills, overallFinals.deaths);
  return {
    level,
    prestige: bedwarsPrestige(level),
    xpToNextLevel: bedwarsXpToNextLevel(raw.experience),
    starsToNextPrestige: bedwarsStarsToNextPrestige(level),
    xpForNextPrestige:
      BEDWARS_PRESTIGE_CYCLE_XP - (raw.experience % BEDWARS_PRESTIGE_CYCLE_XP),
    index: round2(level * fkdr * fkdr),
    finalsPerStar: ratio(overallFinals.kills, level),
    winsPerStar: ratio(raw.overall.wins, level),
    legendaryChestRate: ratio(
      raw.boxes.openedLegendaries,
      raw.boxes.openedChests,
    ),
    practice: {
      bridging: computePracticeMode(raw.practice.bridging),
      fireballJumping: computePracticeMode(raw.practice.fireballJumping),
      mlg: computePracticeMode(raw.practice.mlg),
      pearlClutching: computePracticeMode(raw.practice.pearlClutching),
    },
    overall: computeMode(raw.overall),
    perMode: {
      solo: computeMode(raw.solo),
      doubles: computeMode(raw.doubles),
      threes: computeMode(raw.threes),
      fours: computeMode(raw.fours),
      fourVsFour: computeMode(raw.fourVsFour),
      castle: computeMode(raw.castle),
    },
  };
}

