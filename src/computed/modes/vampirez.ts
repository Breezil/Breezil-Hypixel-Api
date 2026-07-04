import type { VampireZStats } from "@breezil/hypixel-parsers";

import { neededForNextWholeRatio, percent, ratio } from "../shared/ratio";
import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { sum } from "../shared/aggregate";

export interface VampireZRoleComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly killsPerWin: number;
}

export interface VampireZPeriodWinsComputed {
  readonly human: number;
  readonly vampire: number;
}

export interface VampireZComputed {
  readonly human: VampireZRoleComputed;
  readonly vampire: VampireZRoleComputed;
  readonly kills: number;
  readonly deaths: number;
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wins: number;
  readonly killsPerWin: number;
  readonly vampireKillShare: number;
  readonly humanWinShare: number;
  readonly zombieKillsPerWin: number;
  readonly totalPerkLevels: number;
  readonly totalMapVotes: number;
  readonly bestVampireKills: number;
  readonly monthlyWins: VampireZPeriodWinsComputed;
  readonly weeklyWins: VampireZPeriodWinsComputed;
}

export function computeVampireZ(raw: VampireZStats): VampireZComputed {
  const kills = raw.human.kills + raw.vampire.kills;
  const deaths = raw.human.deaths + raw.vampire.deaths;
  const wins = raw.human.wins + raw.vampire.wins;
  const now = new Date();
  return {
    human: {
      kdr: ratio(raw.human.kills, raw.human.deaths),
      killsForNextKdr: neededForNextWholeRatio(
        raw.human.kills,
        raw.human.deaths,
      ),
      killsPerWin: ratio(raw.human.kills, raw.human.wins),
    },
    vampire: {
      kdr: ratio(raw.vampire.kills, raw.vampire.deaths),
      killsForNextKdr: neededForNextWholeRatio(
        raw.vampire.kills,
        raw.vampire.deaths,
      ),
      killsPerWin: ratio(raw.vampire.kills, raw.vampire.wins),
    },
    kills,
    deaths,
    kdr: ratio(kills, deaths),
    killsForNextKdr: neededForNextWholeRatio(kills, deaths),
    wins,
    killsPerWin: ratio(kills, wins),
    vampireKillShare: percent(raw.vampire.kills, kills),
    humanWinShare: percent(raw.human.wins, wins),
    zombieKillsPerWin: ratio(raw.zombieKills, wins),
    totalPerkLevels: sum(Object.values(raw.perks)),
    totalMapVotes: sum(Object.values(raw.votes)),
    bestVampireKills: Math.max(
      raw.mostVampireKills,
      raw.mostVampireKillsLegacy,
    ),
    monthlyWins: {
      human: monthlyValue(raw.monthly.humanWinsA, raw.monthly.humanWinsB, now),
      vampire: monthlyValue(
        raw.monthly.vampireWinsA,
        raw.monthly.vampireWinsB,
        now,
      ),
    },
    weeklyWins: {
      human: weeklyValue(raw.weekly.humanWinsA, raw.weekly.humanWinsB, now),
      vampire: weeklyValue(
        raw.weekly.vampireWinsA,
        raw.weekly.vampireWinsB,
        now,
      ),
    },
  };
}

