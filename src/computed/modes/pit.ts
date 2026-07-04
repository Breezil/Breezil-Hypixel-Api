import type { PitStats } from "@breezil/hypixel-parsers";

import {
  pitProgress,
  pitXpForNextLevel,
  pitXpForNextPrestige,
} from "../shared/leveling";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface PitComputed {
  readonly level: number;
  readonly prestige: number;
  readonly xpForNextLevel: number;
  readonly xpForNextPrestige: number;
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly kda: number;
  readonly playtimeSeconds: number;
  readonly damageRatio: number;
  readonly meleeAccuracy: number;
  readonly meleeDamageRatio: number;
  readonly bowAccuracy: number;
  readonly bowDamageRatio: number;
  readonly killsPerGame: number;
  readonly killsPerHour: number;
  readonly xpPerHour: number;
  readonly goldPerHour: number;
  readonly meleeDamageShare: number;
  readonly contractCompletionRate: number;
  readonly avgGameLengthMinutes: number;
  readonly damagePerKill: number;
  readonly launchedTotal: number;
}

export function computePit(raw: PitStats): PitComputed {
  const { profile, combat } = raw;
  const progress = pitProgress(profile.xp, profile.prestiges);
  const hoursPlayed = combat.playtimeMinutes / 60;
  return {
    level: progress.level,
    prestige: progress.prestige,
    xpForNextLevel: pitXpForNextLevel(profile.xp, profile.prestiges),
    xpForNextPrestige: pitXpForNextPrestige(profile.xp, profile.prestiges),
    kdr: ratio(combat.kills, combat.deaths),
    killsForNextKdr: neededForNextWholeRatio(combat.kills, combat.deaths),
    kda: ratio(combat.kills + combat.assists, combat.deaths),
    playtimeSeconds: combat.playtimeMinutes * 60,
    damageRatio: ratio(combat.damageDealt, combat.damageReceived),
    meleeAccuracy: ratio(combat.swordHits, combat.leftClicks),
    meleeDamageRatio: ratio(
      combat.meleeDamageDealt,
      combat.meleeDamageReceived,
    ),
    bowAccuracy: ratio(combat.arrowHits, combat.arrowsFired),
    bowDamageRatio: ratio(combat.bowDamageDealt, combat.bowDamageReceived),
    killsPerGame: perGame(combat.kills, combat.joins),
    killsPerHour: ratio(combat.kills, hoursPlayed),
    xpPerHour: ratio(profile.xp, hoursPlayed),
    goldPerHour: ratio(combat.cashEarned, hoursPlayed),
    meleeDamageShare: percent(
      combat.meleeDamageDealt,
      combat.meleeDamageDealt + combat.bowDamageDealt,
    ),
    contractCompletionRate: ratio(
      combat.contractsCompleted,
      combat.contractsStarted,
    ),
    avgGameLengthMinutes: perGame(combat.playtimeMinutes, combat.joins),
    damagePerKill: ratio(combat.damageDealt, combat.kills),
    launchedTotal:
      combat.launchedByLaunchers +
      combat.launchedByAngelSpawn +
      combat.launchedByDemonSpawn,
  };
}

