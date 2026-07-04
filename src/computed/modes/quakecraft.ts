import type {
  QuakecraftModeStats,
  QuakecraftStats,
} from "@breezil/hypixel-parsers";

import { neededForNextWholeRatio, percent, ratio } from "../shared/ratio";

export interface QuakecraftComputed {
  readonly kdr: number;
  readonly soloKdr: number;
  readonly teamsKdr: number;
  readonly killsForNextKdr: number;
  readonly soloKillsForNextKdr: number;
  readonly teamsKillsForNextKdr: number;
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly killStreaks: number;
  readonly distanceTraveled: number;
  readonly shotsFired: number;
  readonly headShots: number;
  readonly shotAccuracy: number;
  readonly headshotRate: number;
  readonly headshotsPerKill: number;
  readonly killsPerWin: number;
  readonly distancePerKill: number;
  readonly soloKillShare: number;
  readonly deathmatchKillShare: number;
}

function modeKdr(mode: QuakecraftModeStats): number {
  return ratio(mode.kills, mode.deaths);
}

export function computeQuakecraft(raw: QuakecraftStats): QuakecraftComputed {
  const { solo, teams } = raw;
  const kills = solo.kills + teams.kills;
  const deaths = solo.deaths + teams.deaths;
  const wins = solo.wins + teams.wins;
  const killStreaks = solo.killstreaks + teams.killstreaks;
  const distanceTraveled = solo.distanceTravelled + teams.distanceTravelled;
  const shotsFired = solo.shotsFired + teams.shotsFired;
  const headShots = solo.headshots + teams.headshots;
  return {
    kdr: ratio(kills, deaths),
    soloKdr: modeKdr(solo),
    teamsKdr: modeKdr(teams),
    killsForNextKdr: neededForNextWholeRatio(kills, deaths),
    soloKillsForNextKdr: neededForNextWholeRatio(solo.kills, solo.deaths),
    teamsKillsForNextKdr: neededForNextWholeRatio(teams.kills, teams.deaths),
    kills,
    deaths,
    wins,
    killStreaks,
    distanceTraveled,
    shotsFired,
    headShots,
    shotAccuracy: ratio(kills, shotsFired),
    headshotRate: ratio(headShots, shotsFired),
    headshotsPerKill: ratio(headShots, kills),
    killsPerWin: ratio(kills, wins),
    distancePerKill: ratio(distanceTraveled, kills),
    soloKillShare: percent(solo.kills, kills),
    deathmatchKillShare: percent(raw.killsDeathmatch, kills),
  };
}

