import type { BlitzCombatStats, BlitzStats } from "@breezil/hypixel-parsers";

import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { argMax } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface BlitzKitComputed {
  readonly losses: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly bowAccuracy: number;
}

export interface BlitzComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly bowAccuracy: number;
  readonly damageRatio: number;
  readonly avgGameDuration: number;
  readonly damagePerGame: number;
  readonly chestsPerGame: number;
  readonly potionsPerGame: number;
  readonly tauntKillRate: number;
  readonly soloWinShare: number;
  readonly teamWinShare: number;
  readonly monthlyKills: number;
  readonly weeklyKills: number;
  readonly mostPlayedKit: string | null;
  readonly kits: Readonly<Record<string, BlitzKitComputed>>;
}

function computeKit(kit: BlitzCombatStats): BlitzKitComputed {
  const losses = Math.max(0, kit.gamesPlayed - kit.wins);
  return {
    losses,
    wlr: ratio(kit.wins, losses),
    winRate: ratio(kit.wins, kit.gamesPlayed),
    killsPerGame: perGame(kit.kills, kit.gamesPlayed),
    bowAccuracy: ratio(kit.arrowsHit, kit.arrowsFired),
  };
}

export function computeBlitz(raw: BlitzStats): BlitzComputed {
  const kits: Record<string, BlitzKitComputed> = {};
  for (const [id, kit] of Object.entries(raw.kits)) {
    kits[id] = computeKit(kit);
  }
  const now = new Date();
  const modeWins = raw.winsSoloNormal + raw.winsSoloChaos + raw.winsTeamsNormal;
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    bowAccuracy: ratio(raw.arrowsHit, raw.arrowsFired),
    damageRatio: ratio(raw.damage, raw.damageTaken),
    avgGameDuration: perGame(raw.timePlayed, raw.gamesPlayed),
    damagePerGame: perGame(raw.damage, raw.gamesPlayed),
    chestsPerGame: perGame(raw.chestsOpened, raw.gamesPlayed),
    potionsPerGame: perGame(raw.potionsDrunk, raw.gamesPlayed),
    tauntKillRate: ratio(raw.tauntKills, raw.kills),
    soloWinShare: percent(raw.winsSoloNormal + raw.winsSoloChaos, modeWins),
    teamWinShare: percent(raw.winsTeamsNormal, modeWins),
    monthlyKills: monthlyValue(raw.monthlyKillsA, raw.monthlyKillsB, now),
    weeklyKills: weeklyValue(raw.weeklyKillsA, raw.weeklyKillsB, now),
    mostPlayedKit: argMax(
      Object.entries(raw.kits).map(
        ([id, kit]) => [id, kit.gamesPlayed] as const,
      ),
      0,
    ),
    kits,
  };
}

