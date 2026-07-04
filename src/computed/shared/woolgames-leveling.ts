import { round2 } from "./ratio";

export interface WoolGamesLevel {
  readonly exactLevel: number;
  readonly level: number;
}

const WOOLGAMES_MIN_EXP = [0, 1000, 3000, 6000, 10000, 15000];
const WOOLGAMES_BASE_LEVEL = WOOLGAMES_MIN_EXP.length;
const WOOLGAMES_BASE_EXP = WOOLGAMES_MIN_EXP[WOOLGAMES_MIN_EXP.length - 1];
const WOOLGAMES_XP_PER_LEVEL = 5000;
const WOOLGAMES_EXP_TO_LEVEL_100 = 490000;

function woolGamesExactLevel(exp: number): number {
  if (exp < WOOLGAMES_BASE_EXP)
    return WOOLGAMES_MIN_EXP.findIndex((threshold) => exp < threshold);
  const theoretical =
    (exp - WOOLGAMES_BASE_EXP) / WOOLGAMES_XP_PER_LEVEL + WOOLGAMES_BASE_LEVEL;
  if (theoretical > 100)
    return 100 + woolGamesExactLevel(exp - WOOLGAMES_EXP_TO_LEVEL_100);
  return theoretical;
}

export function woolGamesLevel(exp: number): WoolGamesLevel {
  const exactLevel = round2(woolGamesExactLevel(exp));
  return { exactLevel, level: Math.floor(exactLevel) };
}

function woolGamesExpForLevel(level: number): number {
  if (level > 100)
    return WOOLGAMES_EXP_TO_LEVEL_100 + woolGamesExpForLevel(level - 100);
  if (level <= WOOLGAMES_BASE_LEVEL)
    return WOOLGAMES_MIN_EXP[Math.max(level - 1, 0)];
  return (
    WOOLGAMES_BASE_EXP + (level - WOOLGAMES_BASE_LEVEL) * WOOLGAMES_XP_PER_LEVEL
  );
}

export function woolGamesXpForNextLevel(exp: number): number {
  const nextLevel = Math.floor(woolGamesExactLevel(exp)) + 1;
  return Math.max(0, woolGamesExpForLevel(nextLevel) - exp);
}

