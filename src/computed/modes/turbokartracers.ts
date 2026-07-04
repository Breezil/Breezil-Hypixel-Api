import type {
  TurboKartRacersPeriodStats,
  TurboKartRacersStats,
} from "@breezil/hypixel-parsers";

import { argMax, minPositive, sum } from "../shared/aggregate";
import { monthBucket, weekBucket } from "../shared/oscillation";
import { percent, perGame, ratio } from "../shared/ratio";

export interface TurboKartRacersPeriodComputed {
  readonly boxPickups: number;
  readonly goldTrophies: number;
  readonly silverTrophies: number;
  readonly bronzeTrophies: number;
  readonly totalTrophies: number;
}

export interface TurboKartRacersComputed {
  readonly totalPlays: number;
  readonly winRate: number;
  readonly totalTrophies: number;
  readonly trophiesPerPlay: number;
  readonly goldTrophyShare: number;
  readonly lapsPerPlay: number;
  readonly boxPickupsPerLap: number;
  readonly coinsPickedUpPerGame: number;
  readonly netBananaHits: number;
  readonly bananaHitRatio: number;
  readonly blueTorpedoHitsPerPlay: number;
  readonly mostPlayedMap: string | null;
  readonly bestMonthlyPosition: number;
  readonly averageMonthlyPoints: number;
  readonly monthly: TurboKartRacersPeriodComputed;
  readonly weekly: TurboKartRacersPeriodComputed;
}

function totalPlays(raw: TurboKartRacersStats): number {
  return sum(Object.values(raw.maps).map((map) => map.plays));
}

function bestMonthlyPosition(raw: TurboKartRacersStats): number {
  return minPositive(
    Object.values(raw.monthlyPoints).map((month) => month.position),
  );
}

function averageMonthlyPoints(raw: TurboKartRacersStats): number {
  const months = Object.values(raw.monthlyPoints);
  return ratio(sum(months.map((month) => month.points)), months.length);
}

function computePeriod(
  period: TurboKartRacersPeriodStats,
): TurboKartRacersPeriodComputed {
  return {
    boxPickups: period.boxPickups,
    goldTrophies: period.goldTrophies,
    silverTrophies: period.silverTrophies,
    bronzeTrophies: period.bronzeTrophies,
    totalTrophies:
      period.goldTrophies + period.silverTrophies + period.bronzeTrophies,
  };
}

export function computeTurboKartRacers(
  raw: TurboKartRacersStats,
): TurboKartRacersComputed {
  const plays = totalPlays(raw);
  const trophies = raw.goldTrophies + raw.silverTrophies + raw.bronzeTrophies;
  const now = new Date();
  return {
    totalPlays: plays,
    winRate: ratio(raw.wins, plays),
    totalTrophies: trophies,
    trophiesPerPlay: ratio(trophies, plays),
    goldTrophyShare: percent(raw.goldTrophies, trophies),
    lapsPerPlay: ratio(raw.completedLaps, plays),
    boxPickupsPerLap: ratio(raw.boxPickups, raw.completedLaps),
    coinsPickedUpPerGame: perGame(raw.coinsPickedUp, plays),
    netBananaHits: raw.bananaHitsSent - raw.bananaHitsReceived,
    bananaHitRatio: ratio(raw.bananaHitsSent, raw.bananaHitsReceived),
    blueTorpedoHitsPerPlay: ratio(raw.blueTorpedoHits, plays),
    mostPlayedMap: argMax(
      Object.entries(raw.maps).map(([id, map]) => [id, map.plays] as const),
      0,
    ),
    bestMonthlyPosition: bestMonthlyPosition(raw),
    averageMonthlyPoints: averageMonthlyPoints(raw),
    monthly: computePeriod(
      monthBucket(now) === "a" ? raw.periods.monthlyA : raw.periods.monthlyB,
    ),
    weekly: computePeriod(
      weekBucket(now) === "a" ? raw.periods.weeklyA : raw.periods.weeklyB,
    ),
  };
}

