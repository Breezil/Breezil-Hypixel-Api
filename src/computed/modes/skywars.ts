import { skywarsLevel, type SkyWarsLevel } from "../shared/leveling";
import { monthlyValue, weeklyValue } from "../shared/oscillation";
import {
  type SkyWarsStats,
  type SkyWarsModeStats,
} from "@breezil/hypixel-parsers";
import {
  ratio,
  percent,
  perGame,
  neededForNextWholeRatio,
} from "../shared/ratio";

export interface SkyWarsKillShare {
  readonly melee: number;
  readonly void: number;
  readonly bow: number;
  readonly mob: number;
  readonly fall: number;
}

export interface SkyWarsModeComputed {
  readonly winLossRatio: number;
  readonly winRate: number;
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly killsPerGame: number;
  readonly assistsPerGame: number;
  readonly bowAccuracy: number;
  readonly avgGameLength: number;
  readonly quitRate: number;
  readonly survivalEfficiency: number;
  readonly headsPerGame: number;
  readonly killShare: SkyWarsKillShare;
}

export type SkyWarsSubmode =
  | "solo"
  | "teams"
  | "mega"
  | "mini"
  | "ranked"
  | "lab";

export interface SkyWarsComputed {
  readonly level: SkyWarsLevel;
  readonly xpForNextLevel: number;
  readonly levelFormatted: string;
  readonly weeklyKills: number;
  readonly monthlyKills: number;
  readonly lootBoxesTotal: number;
  readonly headsPerGame: number;
  readonly soulWellLegendaryRate: number;
  readonly soulWellRareRate: number;
  readonly soulsGatheredPerGame: number;
  readonly overall: SkyWarsModeComputed;
  readonly perMode: Readonly<Record<SkyWarsSubmode, SkyWarsModeComputed>>;
}

function computeMode(mode: SkyWarsModeStats): SkyWarsModeComputed {
  const games = mode.gamesPlayed;
  const totalKills = mode.kills.total;
  return {
    winLossRatio: ratio(mode.wins, mode.losses),
    winRate: ratio(mode.wins, games),
    kdr: ratio(totalKills, mode.deaths),
    killsForNextKdr: neededForNextWholeRatio(totalKills, mode.deaths),
    winsForNextWlr: neededForNextWholeRatio(mode.wins, mode.losses),
    killsPerGame: perGame(totalKills, games),
    assistsPerGame: perGame(mode.assists, games),
    bowAccuracy: ratio(mode.arrowsHit, mode.arrowsShot),
    avgGameLength: ratio(mode.timePlayed, games),
    quitRate: ratio(mode.quits, games),
    survivalEfficiency: ratio(mode.survivedPlayers, games),
    headsPerGame: perGame(mode.heads.total, games),
    killShare: {
      melee: percent(mode.kills.melee, totalKills),
      void: percent(mode.kills.void, totalKills),
      bow: percent(mode.kills.bow, totalKills),
      mob: percent(mode.kills.mob, totalKills),
      fall: percent(mode.fallKills, totalKills),
    },
  };
}

function cleanLevelFormatted(formatted: string): string {
  return formatted
    .replace(/§l/g, "**")
    .replace(/§r/g, "")
    .replace(/§[0-9a-f]/g, "");
}

export function computeSkyWars(raw: SkyWarsStats): SkyWarsComputed {
  const now = new Date();
  const level = skywarsLevel(raw.experience);
  return {
    level,
    xpForNextLevel: Math.max(0, level.required - level.currentXp),
    levelFormatted: cleanLevelFormatted(raw.levelFormatted),
    weeklyKills: weeklyValue(raw.weeklyKillsA, raw.weeklyKillsB, now),
    monthlyKills: monthlyValue(raw.monthlyKillsA, raw.monthlyKillsB, now),
    lootBoxesTotal:
      raw.halloweenBoxes +
      raw.christmasBoxes +
      raw.lunarBoxes +
      raw.easterBoxes,
    headsPerGame: ratio(raw.headsCollected, raw.overall.gamesPlayed),
    soulWellLegendaryRate: ratio(raw.soulWellLegendaries, raw.soulWell),
    soulWellRareRate: ratio(raw.soulWellRares, raw.soulWell),
    soulsGatheredPerGame: ratio(raw.soulsGathered, raw.overall.gamesPlayed),
    overall: computeMode(raw.overall),
    perMode: {
      solo: computeMode(raw.solo),
      teams: computeMode(raw.teams),
      mega: computeMode(raw.mega),
      mini: computeMode(raw.mini),
      ranked: computeMode(raw.ranked),
      lab: computeMode(raw.lab),
    },
  };
}

