import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { argMax } from "../shared/aggregate";
import type {
  CopsAndCrimsGamemodeStats,
  CopsAndCrimsStats,
} from "@breezil/hypixel-parsers";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface CopsAndCrimsRecord {
  readonly losses: number;
  readonly KDR: number;
  readonly killsForNextKdr: number;
  readonly WLR: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
}

export interface CopsAndCrimsGunComputed {
  readonly headshotRatio: number;
}

export interface CopsAndCrimsOverallComputed extends CopsAndCrimsRecord {
  readonly criminalKillShare: number;
  readonly shotsFiredPerKill: number;
  readonly bombsDefusedPerGame: number;
  readonly bombsPlantedPerGame: number;
  readonly roundWinsPerGame: number;
  readonly assistsPerGame: number;
}

export interface CopsAndCrimsComputed {
  readonly weeklyKills: number;
  readonly monthlyKills: number;
  readonly favoriteMap: string;
  readonly overall: CopsAndCrimsOverallComputed;
  readonly deathmatch: CopsAndCrimsRecord;
  readonly gungame: CopsAndCrimsRecord;
  readonly guns: Readonly<Record<string, CopsAndCrimsGunComputed>>;
}

const HEADSHOT_GUNS = [
  "smg",
  "rifle",
  "carbine",
  "magnum",
  "shotgun",
  "sniper",
  "scopedRifle",
  "autoShotgun",
  "bullpup",
  "handgun",
  "pistol",
] as const;

function buildRecord(
  kills: number,
  deaths: number,
  wins: number,
  gamePlays: number,
): CopsAndCrimsRecord {
  const losses = gamePlays - wins;
  return {
    losses,
    KDR: ratio(kills, deaths),
    killsForNextKdr: neededForNextWholeRatio(kills, deaths),
    WLR: ratio(wins, losses),
    winsForNextWlr: neededForNextWholeRatio(wins, losses),
    winRate: ratio(wins, gamePlays),
  };
}

function modeRecord(mode: CopsAndCrimsGamemodeStats): CopsAndCrimsRecord {
  return buildRecord(mode.kills, mode.deaths, mode.wins, mode.gamePlays);
}

function gunRatios(
  guns: CopsAndCrimsStats["guns"],
): Record<string, CopsAndCrimsGunComputed> {
  const result: Record<string, CopsAndCrimsGunComputed> = {};
  for (const key of HEADSHOT_GUNS) {
    const gun = guns[key];
    result[key] = { headshotRatio: ratio(gun.headshots, gun.kills) };
  }
  return result;
}

export function computeCopsAndCrims(
  raw: CopsAndCrimsStats,
): CopsAndCrimsComputed {
  const now = new Date();
  return {
    weeklyKills: weeklyValue(raw.weeklyKillsA, raw.weeklyKillsB, now),
    monthlyKills: monthlyValue(raw.monthlyKillsA, raw.monthlyKillsB, now),
    favoriteMap: argMax(Object.entries(raw.winsByMap), 0) ?? "",
    overall: {
      ...buildRecord(raw.kills, raw.deaths, raw.wins, raw.gamePlays),
      criminalKillShare: percent(
        raw.criminalKills,
        raw.criminalKills + raw.copKills,
      ),
      shotsFiredPerKill: ratio(raw.shotsFired, raw.kills),
      bombsDefusedPerGame: perGame(raw.bombsDefused, raw.gamePlays),
      bombsPlantedPerGame: perGame(raw.bombsPlanted, raw.gamePlays),
      roundWinsPerGame: perGame(raw.roundWins, raw.gamePlays),
      assistsPerGame: perGame(raw.assists, raw.gamePlays),
    },
    deathmatch: modeRecord(raw.deathmatch),
    gungame: modeRecord(raw.gungame),
    guns: gunRatios(raw.guns),
  };
}

