import type {
  WarlordsClassStats,
  WarlordsStats,
} from "@breezil/hypixel-parsers";

import { argMax } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface WarlordsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly classWlr: Readonly<Record<string, number>>;
  readonly classWinsForNextWlr: Readonly<Record<string, number>>;
  readonly winRate: number;
  readonly kda: number;
  readonly assistRate: number;
  readonly killsPerGame: number;
  readonly mvpRate: number;
  readonly teamColorWinShare: number;
  readonly damageToHealingRatio: number;
  readonly damagePerGame: number;
  readonly healingPerGame: number;
  readonly damagePreventedPerGame: number;
  readonly mostPlayedClass: string;
  readonly flagEfficiency: number;
  readonly avgDominationScore: number;
}

function perClass(
  classes: Readonly<Record<string, WarlordsClassStats>>,
  compute: (stats: WarlordsClassStats) => number,
): Readonly<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const [name, stats] of Object.entries(classes)) {
    result[name] = compute(stats);
  }
  return result;
}

function mostPlayedClass(
  classes: Readonly<Record<string, WarlordsClassStats>>,
): string {
  const playsByClass = Object.entries(classes).map(
    ([name, stats]) => [name, stats.gamesPlayed] as const,
  );
  return argMax(playsByClass, -1) ?? "";
}

export function computeWarlords(raw: WarlordsStats): WarlordsComputed {
  const games = raw.wins + raw.losses;
  const ctf = raw.modes.captureTheFlag;
  const domination = raw.modes.domination;
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    wlr: ratio(raw.wins, raw.losses),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, raw.losses),
    classWlr: perClass(raw.classes, (stats) => ratio(stats.wins, stats.losses)),
    classWinsForNextWlr: perClass(raw.classes, (stats) =>
      neededForNextWholeRatio(stats.wins, stats.losses),
    ),
    winRate: ratio(raw.wins, games),
    kda: ratio(raw.kills + raw.assists, raw.deaths),
    assistRate: ratio(raw.assists, raw.kills + raw.assists),
    killsPerGame: perGame(raw.kills, games),
    mvpRate: perGame(raw.mvpCount, games),
    teamColorWinShare: percent(raw.winsBlu, raw.winsBlu + raw.winsRed),
    damageToHealingRatio: ratio(raw.damage, raw.healing),
    damagePerGame: perGame(raw.damage, games),
    healingPerGame: perGame(raw.healing, games),
    damagePreventedPerGame: perGame(raw.damagePrevented, games),
    mostPlayedClass: mostPlayedClass(raw.classes),
    flagEfficiency: ratio(
      ctf.flagConquerSelf,
      ctf.flagConquerSelf + ctf.flagReturns,
    ),
    avgDominationScore: ratio(domination.totalScore, domination.wins),
  };
}

