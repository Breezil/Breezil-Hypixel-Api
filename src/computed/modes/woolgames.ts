import type {
  CaptureTheWoolStats,
  SheepWarsStats,
  WoolGamesStats,
  WoolWarsClassStats,
  WoolWarsStats,
} from "@breezil/hypixel-parsers";

import { woolGamesLevel, woolGamesXpForNextLevel } from "../shared/leveling";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface WoolWarsClassComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly placeBreakRatio: number;
  readonly usageShare: number;
}

export interface WoolWarsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly placeBreakRatio: number;
  readonly losses: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly assistsPerGame: number;
  readonly classes: Readonly<Record<string, WoolWarsClassComputed>>;
}

export interface SheepWarsKillShare {
  readonly void: number;
  readonly bow: number;
  readonly explosive: number;
  readonly melee: number;
}

export interface SheepWarsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly damagePerGame: number;
  readonly killShareByMethod: SheepWarsKillShare;
}

export interface CaptureTheWoolComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly kdrWithWool: number;
  readonly woolholderKdr: number;
  readonly woolCaptureStolenRatio: number;
  readonly winRate: number;
  readonly goldNet: number;
  readonly goldPerGame: number;
}

export interface WoolGamesComputed {
  readonly level: number;
  readonly exactLevel: number;
  readonly levelProgressPercent: number;
  readonly xpForNextLevel: number;
  readonly woolWars: WoolWarsComputed;
  readonly sheepWars: SheepWarsComputed;
  readonly captureTheWool: CaptureTheWoolComputed;
}

function computeWoolWarsClass(
  stats: WoolWarsClassStats,
  overallGames: number,
): WoolWarsClassComputed {
  return {
    kdr: ratio(stats.kills, stats.deaths),
    killsForNextKdr: neededForNextWholeRatio(stats.kills, stats.deaths),
    placeBreakRatio: ratio(stats.woolPlaced, stats.blocksBroken),
    usageShare: percent(stats.gamesPlayed, overallGames),
  };
}

function computeWoolWars(woolWars: WoolWarsStats): WoolWarsComputed {
  const stats = woolWars.stats;
  const classes: Record<string, WoolWarsClassComputed> = {};
  for (const [name, cls] of Object.entries(woolWars.classes)) {
    classes[name] = computeWoolWarsClass(cls, stats.gamesPlayed);
  }
  const losses = Math.max(0, stats.gamesPlayed - stats.wins);
  return {
    kdr: ratio(stats.kills, stats.deaths),
    killsForNextKdr: neededForNextWholeRatio(stats.kills, stats.deaths),
    placeBreakRatio: ratio(stats.woolPlaced, stats.blocksBroken),
    losses,
    wlr: ratio(stats.wins, losses),
    winRate: ratio(stats.wins, stats.gamesPlayed),
    killsPerGame: perGame(stats.kills, stats.gamesPlayed),
    assistsPerGame: perGame(stats.assists, stats.gamesPlayed),
    classes,
  };
}

function computeSheepWars(sheepWars: SheepWarsStats): SheepWarsComputed {
  const stats = sheepWars.stats;
  return {
    kdr: ratio(stats.kills, stats.deaths),
    killsForNextKdr: neededForNextWholeRatio(stats.kills, stats.deaths),
    wlr: ratio(stats.wins, stats.losses),
    winRate: ratio(stats.wins, stats.gamesPlayed),
    killsPerGame: perGame(stats.kills, stats.gamesPlayed),
    damagePerGame: perGame(stats.damageDealt, stats.gamesPlayed),
    killShareByMethod: {
      void: percent(stats.killsVoid, stats.kills),
      bow: percent(stats.killsBow, stats.kills),
      explosive: percent(stats.killsExplosive, stats.kills),
      melee: percent(stats.killsMelee, stats.kills),
    },
  };
}

function computeCaptureTheWool(
  captureTheWool: CaptureTheWoolStats,
): CaptureTheWoolComputed {
  const stats = captureTheWool.stats;
  const games =
    stats.participatedWins + stats.participatedLosses + stats.participatedDraws;
  return {
    kdr: ratio(stats.kills, stats.deaths),
    killsForNextKdr: neededForNextWholeRatio(stats.kills, stats.deaths),
    kdrWithWool: ratio(stats.killsWithWool, stats.deathsWithWool),
    woolholderKdr: ratio(stats.killsOnWoolholder, stats.deathsToWoolholder),
    woolCaptureStolenRatio: ratio(stats.woolsCaptured, stats.woolsStolen),
    winRate: ratio(stats.participatedWins, games),
    goldNet: stats.goldEarned + stats.goldSpent,
    goldPerGame: perGame(stats.goldEarned, games),
  };
}

export function computeWoolGames(raw: WoolGamesStats): WoolGamesComputed {
  const { level, exactLevel } = woolGamesLevel(raw.progression.experience);
  return {
    level,
    exactLevel,
    levelProgressPercent: percent(exactLevel - level, 1),
    xpForNextLevel: woolGamesXpForNextLevel(raw.progression.experience),
    woolWars: computeWoolWars(raw.woolWars),
    sheepWars: computeSheepWars(raw.sheepWars),
    captureTheWool: computeCaptureTheWool(raw.captureTheWool),
  };
}

