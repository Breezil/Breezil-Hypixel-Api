import { type StaticWatchdogStats } from "@breezil/hypixel-parsers";

import { percent, ratio } from "../shared/ratio";

const MINUTES_PER_DAY = 1440;

export interface WatchdogComputed {
  readonly totalBans: number;
  readonly dailyBans: number;
  readonly watchdogTotalSharePercent: number;
  readonly staffTotalSharePercent: number;
  readonly watchdogDailySharePercent: number;
  readonly staffDailySharePercent: number;
  readonly staffToWatchdogRatio: number;
  readonly staffToWatchdogDailyRatio: number;
  readonly watchdogBansPerMinute: number;
  readonly staffBansPerMinute: number;
  readonly projectedWatchdogDaily: number;
}

export function computeWatchdog(raw: StaticWatchdogStats): WatchdogComputed {
  const totalBans = raw.watchdogTotal + raw.staffTotal;
  const dailyBans = raw.watchdogDaily + raw.staffDaily;
  return {
    totalBans,
    dailyBans,
    watchdogTotalSharePercent: percent(raw.watchdogTotal, totalBans),
    staffTotalSharePercent: percent(raw.staffTotal, totalBans),
    watchdogDailySharePercent: percent(raw.watchdogDaily, dailyBans),
    staffDailySharePercent: percent(raw.staffDaily, dailyBans),
    staffToWatchdogRatio: ratio(raw.staffTotal, raw.watchdogTotal),
    staffToWatchdogDailyRatio: ratio(raw.staffDaily, raw.watchdogDaily),
    watchdogBansPerMinute: ratio(raw.watchdogDaily, MINUTES_PER_DAY),
    staffBansPerMinute: ratio(raw.staffDaily, MINUTES_PER_DAY),
    projectedWatchdogDaily: raw.watchdogLastMinute * MINUTES_PER_DAY,
  };
}

