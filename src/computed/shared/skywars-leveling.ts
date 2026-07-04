export interface SkyWarsLevel {
  readonly level: number;
  readonly currentXp: number;
  readonly required: number;
  readonly totalXp: number;
}

const SKYWARS_XP_TO_NEXT_LEVEL = [
  0, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500,
  3000, 3500, 4000, 4500,
];

const SKYWARS_TOTAL_XP = SKYWARS_XP_TO_NEXT_LEVEL.map((_, index) =>
  SKYWARS_XP_TO_NEXT_LEVEL.slice(0, index + 1).reduce((acc, xp) => acc + xp, 0),
);

const SKYWARS_CONSTANT_LEVELING_XP = SKYWARS_XP_TO_NEXT_LEVEL.reduce(
  (acc, xp) => acc + xp,
  0,
);
const SKYWARS_CONSTANT_XP_TO_NEXT_LEVEL = 5000;
const SKYWARS_LEVEL_MAX = 10000;

function skywarsLevelNumber(xp: number): number {
  if (xp >= SKYWARS_CONSTANT_LEVELING_XP) {
    const level =
      Math.floor(
        (xp - SKYWARS_CONSTANT_LEVELING_XP) / SKYWARS_CONSTANT_XP_TO_NEXT_LEVEL,
      ) + SKYWARS_XP_TO_NEXT_LEVEL.length;
    return Math.min(level, SKYWARS_LEVEL_MAX);
  }
  return SKYWARS_TOTAL_XP.findIndex((x) => x > xp);
}

export function skywarsLevel(experience: number): SkyWarsLevel {
  const level = skywarsLevelNumber(experience);
  let currentXp = experience;

  if (experience >= SKYWARS_CONSTANT_LEVELING_XP) {
    currentXp -= SKYWARS_CONSTANT_LEVELING_XP;
    currentXp %= SKYWARS_CONSTANT_XP_TO_NEXT_LEVEL;
    return {
      level,
      currentXp,
      required:
        level >= SKYWARS_LEVEL_MAX ? 0 : SKYWARS_CONSTANT_XP_TO_NEXT_LEVEL,
      totalXp: experience,
    };
  }

  for (const element of SKYWARS_XP_TO_NEXT_LEVEL) {
    if (currentXp < element) break;
    currentXp -= element;
  }

  const required =
    SKYWARS_XP_TO_NEXT_LEVEL[
      SKYWARS_TOTAL_XP.findIndex((x) => x > experience)
    ] || 0;
  return { level, currentXp, required, totalXp: experience };
}

