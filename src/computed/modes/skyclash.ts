import type {
  SkyClashModeStats,
  SkyClashStats,
} from "@breezil/hypixel-parsers";
import {
  neededForNextWholeRatio,
  perGame,
  percent,
  ratio,
} from "../shared/ratio";

const SKYCLASH_MODES = ["solo", "doubles", "team_war", "mega"] as const;

export interface SkyClashModeComputed {
  readonly kdr: number;
  readonly wlr: number;
}

export interface SkyClashComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly kadr: number;
  readonly winLossRatio: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly bowAccuracy: number;
  readonly quitRate: number;
  readonly bowKillShare: number;
  readonly meleeKillShare: number;
  readonly voidKillShare: number;
  readonly killsPerGame: number;
  readonly mobKillEfficiency: number;
  readonly assistsPerGame: number;
  readonly masteredKitsCount: number;
  readonly modes: Readonly<Record<string, SkyClashModeComputed>>;
}

function computeMode(stats: SkyClashModeStats): SkyClashModeComputed {
  return {
    kdr: ratio(stats.kills, stats.deaths),
    wlr: ratio(stats.wins, stats.losses),
  };
}

function computeModes(
  raw: SkyClashStats,
): Readonly<Record<string, SkyClashModeComputed>> {
  const modes: Record<string, SkyClashModeComputed> = {};
  for (const name of SKYCLASH_MODES) {
    const stats = raw.modes[name];
    if (stats) {
      modes[name] = computeMode(stats);
    }
  }
  return modes;
}

export function computeSkyClash(raw: SkyClashStats): SkyClashComputed {
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    kadr: ratio(raw.kills + raw.assists, raw.deaths),
    winLossRatio: ratio(raw.wins, raw.losses),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, raw.losses),
    winRate: ratio(raw.wins, raw.gamesPlayed),
    bowAccuracy: ratio(raw.bowHits, raw.bowShots),
    quitRate: ratio(raw.quits, raw.gamesPlayed),
    bowKillShare: percent(raw.bowKills, raw.kills),
    meleeKillShare: percent(raw.meleeKills, raw.kills),
    voidKillShare: percent(raw.voidKills, raw.kills),
    killsPerGame: perGame(raw.kills, raw.gamesPlayed),
    mobKillEfficiency: ratio(raw.mobsKilled, raw.mobsSpawned),
    assistsPerGame: perGame(raw.assists, raw.gamesPlayed),
    masteredKitsCount: Object.values(raw.kitMastery).filter(
      (kit) => kit.master > 0,
    ).length,
    modes: computeModes(raw),
  };
}

