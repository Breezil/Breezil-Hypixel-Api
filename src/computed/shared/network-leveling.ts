import { round2 } from "./ratio";

export interface LevelProgress {
  readonly level: number;
  readonly totalXp: number;
  readonly currentXp: number;
  readonly xpToNext: number;
  readonly remainingXp: number;
  readonly percent: number;
  readonly percentRemaining: number;
}

const BASE_XP = 10_000;
const GROWTH_XP = 2_500;

function playerLevel(exp: number): number {
  const reversePqPrefix = -(BASE_XP - 0.5 * GROWTH_XP) / GROWTH_XP;
  const level =
    1 +
    reversePqPrefix +
    Math.sqrt(reversePqPrefix ** 2 + (2 / GROWTH_XP) * exp);
  return round2(level);
}

function xpToNextLevel(xp: number): number {
  if (xp < BASE_XP) return BASE_XP;
  return GROWTH_XP * Math.floor(playerLevel(xp)) + 2 * GROWTH_XP;
}

export function levelStartXp(level: number): number {
  const priorLevels = level - 1;
  return (
    (GROWTH_XP / 2) * priorLevels ** 2 + (BASE_XP - GROWTH_XP / 2) * priorLevels
  );
}

export function networkLevel(networkExp: number): LevelProgress {
  const xpToNext = xpToNextLevel(networkExp);
  const currentXp =
    networkExp - levelStartXp(Math.floor(playerLevel(networkExp))) - GROWTH_XP;
  const percent = round2((currentXp / xpToNext) * 100);
  return {
    level: playerLevel(networkExp),
    totalXp: networkExp,
    currentXp,
    xpToNext,
    remainingXp: xpToNext - currentXp,
    percent,
    percentRemaining: round2(100 - percent),
  };
}

