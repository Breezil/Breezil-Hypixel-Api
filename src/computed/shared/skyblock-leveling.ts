export interface XpLevel {
  readonly level: number;
  readonly xpCurrent: number;
  readonly xpForNext: number;
  readonly progress: number;
  readonly totalXp: number;
  readonly maxed: boolean;
}

export type SkillType =
  | "farming"
  | "mining"
  | "combat"
  | "foraging"
  | "fishing"
  | "enchanting"
  | "alchemy"
  | "taming"
  | "carpentry"
  | "runecrafting"
  | "social"
  | "hunting";

const DEFAULT_LEVELING_XP: Record<number, number> = {
  1: 50,
  2: 125,
  3: 200,
  4: 300,
  5: 500,
  6: 750,
  7: 1000,
  8: 1500,
  9: 2000,
  10: 3500,
  11: 5000,
  12: 7500,
  13: 10000,
  14: 15000,
  15: 20000,
  16: 30000,
  17: 50000,
  18: 75000,
  19: 100000,
  20: 200000,
  21: 300000,
  22: 400000,
  23: 500000,
  24: 600000,
  25: 700000,
  26: 800000,
  27: 900000,
  28: 1000000,
  29: 1100000,
  30: 1200000,
  31: 1300000,
  32: 1400000,
  33: 1500000,
  34: 1600000,
  35: 1700000,
  36: 1800000,
  37: 1900000,
  38: 2000000,
  39: 2100000,
  40: 2200000,
  41: 2300000,
  42: 2400000,
  43: 2500000,
  44: 2600000,
  45: 2750000,
  46: 2900000,
  47: 3100000,
  48: 3400000,
  49: 3700000,
  50: 4000000,
  51: 4300000,
  52: 4600000,
  53: 4900000,
  54: 5200000,
  55: 5500000,
  56: 5800000,
  57: 6100000,
  58: 6400000,
  59: 6700000,
  60: 7000000,
};

const RUNECRAFTING_XP: Record<number, number> = {
  1: 50,
  2: 100,
  3: 125,
  4: 160,
  5: 200,
  6: 250,
  7: 315,
  8: 400,
  9: 500,
  10: 625,
  11: 785,
  12: 1000,
  13: 1250,
  14: 1600,
  15: 2000,
  16: 2465,
  17: 3125,
  18: 4000,
  19: 5000,
  20: 6200,
  21: 7800,
  22: 9800,
  23: 12200,
  24: 15300,
  25: 19050,
};

const SOCIAL_XP: Record<number, number> = {
  1: 50,
  2: 100,
  3: 150,
  4: 250,
  5: 500,
  6: 750,
  7: 1000,
  8: 1250,
  9: 1500,
  10: 2000,
  11: 2500,
  12: 3000,
  13: 3750,
  14: 4500,
  15: 6000,
  16: 8000,
  17: 10000,
  18: 12500,
  19: 15000,
  20: 20000,
  21: 25000,
  22: 30000,
  23: 35000,
  24: 40000,
  25: 50000,
};

const DUNGEONEERING_XP: Record<number, number> = {
  1: 50,
  2: 75,
  3: 110,
  4: 160,
  5: 230,
  6: 330,
  7: 470,
  8: 670,
  9: 950,
  10: 1340,
  11: 1890,
  12: 2665,
  13: 3760,
  14: 5260,
  15: 7380,
  16: 10300,
  17: 14400,
  18: 20000,
  19: 27600,
  20: 38000,
  21: 52500,
  22: 71500,
  23: 97000,
  24: 132000,
  25: 180000,
  26: 243000,
  27: 328000,
  28: 445000,
  29: 600000,
  30: 800000,
  31: 1065000,
  32: 1410000,
  33: 1900000,
  34: 2500000,
  35: 3300000,
  36: 4300000,
  37: 5600000,
  38: 7200000,
  39: 9200000,
  40: 12000000,
  41: 15000000,
  42: 19000000,
  43: 24000000,
  44: 30000000,
  45: 38000000,
  46: 48000000,
  47: 60000000,
  48: 75000000,
  49: 93000000,
  50: 116250000,
  51: 200000000,
};

const GARDEN_XP: Record<number, number> = {
  1: 0,
  2: 70,
  3: 70,
  4: 140,
  5: 240,
  6: 600,
  7: 1500,
  8: 2000,
  9: 2500,
  10: 3000,
  11: 10000,
  12: 10000,
  13: 10000,
  14: 10000,
  15: 10000,
};

const SLAYER_XP: Record<string, Record<number, number>> = {
  zombie: {
    1: 5,
    2: 15,
    3: 200,
    4: 1000,
    5: 5000,
    6: 20000,
    7: 100000,
    8: 400000,
    9: 1000000,
  },
  spider: {
    1: 5,
    2: 25,
    3: 200,
    4: 1000,
    5: 5000,
    6: 20000,
    7: 100000,
    8: 400000,
    9: 1000000,
  },
  wolf: {
    1: 10,
    2: 30,
    3: 250,
    4: 1500,
    5: 5000,
    6: 20000,
    7: 100000,
    8: 400000,
    9: 1000000,
  },
  enderman: {
    1: 10,
    2: 30,
    3: 250,
    4: 1500,
    5: 5000,
    6: 20000,
    7: 100000,
    8: 400000,
    9: 1000000,
  },
  blaze: {
    1: 10,
    2: 30,
    3: 250,
    4: 1500,
    5: 5000,
    6: 20000,
    7: 100000,
    8: 400000,
    9: 1000000,
  },
  vampire: { 1: 20, 2: 75, 3: 240, 4: 840, 5: 2400 },
};

const SKILL_TABLES: Record<SkillType, Record<number, number>> = {
  farming: DEFAULT_LEVELING_XP,
  mining: DEFAULT_LEVELING_XP,
  combat: DEFAULT_LEVELING_XP,
  foraging: DEFAULT_LEVELING_XP,
  fishing: DEFAULT_LEVELING_XP,
  enchanting: DEFAULT_LEVELING_XP,
  alchemy: DEFAULT_LEVELING_XP,
  taming: DEFAULT_LEVELING_XP,
  carpentry: DEFAULT_LEVELING_XP,
  runecrafting: RUNECRAFTING_XP,
  social: SOCIAL_XP,
  hunting: DEFAULT_LEVELING_XP,
};

const SKILL_CAPS: Record<SkillType, number> = {
  farming: 50,
  mining: 60,
  combat: 60,
  foraging: 50,
  fishing: 50,
  enchanting: 60,
  alchemy: 50,
  taming: 50,
  carpentry: 50,
  runecrafting: 25,
  social: 25,
  hunting: Math.max(...Object.keys(DEFAULT_LEVELING_XP).map(Number)),
};

export function levelByXp(
  rawXp: number,
  xpTable: Record<number, number>,
  levelCap: number,
  isInfinite: boolean,
): XpLevel {
  const xp = typeof rawXp !== "number" || Number.isNaN(rawXp) ? 0 : rawXp;
  const values = Object.values(xpTable);
  const maxExperience = values[values.length - 1] || 0;

  let uncappedLevel = 0;
  let currentXp = xp;
  let xpRemaining = xp;

  while (xpTable[uncappedLevel + 1] <= xpRemaining) {
    uncappedLevel++;
    xpRemaining -= xpTable[uncappedLevel];
    if (uncappedLevel <= levelCap) {
      currentXp = xpRemaining;
    }
  }

  if (isInfinite) {
    uncappedLevel += Math.floor(xpRemaining / maxExperience);
    xpRemaining %= maxExperience;
    currentXp = xpRemaining;
  }

  const maxLevel = isInfinite ? Math.max(uncappedLevel, levelCap) : levelCap;
  const level = isInfinite ? uncappedLevel : Math.min(levelCap, uncappedLevel);

  let xpForNext: number;
  if (level < maxLevel) {
    xpForNext = Math.ceil(xpTable[level + 1] ?? maxExperience);
  } else if (isInfinite) {
    xpForNext = maxExperience;
  } else {
    xpForNext = Infinity;
  }

  const progress =
    level >= maxLevel && !isInfinite
      ? 0
      : Math.max(0, Math.min(currentXp / xpForNext, 1));
  const maxed = level >= maxLevel;

  return {
    level,
    xpCurrent: currentXp,
    xpForNext,
    progress,
    totalXp: xp,
    maxed,
  };
}

export function skillLevel(xp: number, type: SkillType, cap?: number): XpLevel {
  return levelByXp(xp, SKILL_TABLES[type], cap ?? SKILL_CAPS[type], false);
}

export function dungeonLevel(xp: number): XpLevel {
  return levelByXp(xp, DUNGEONEERING_XP, 50, true);
}

export function gardenLevel(xp: number): XpLevel {
  return levelByXp(xp, GARDEN_XP, 15, false);
}

export interface SlayerLevel {
  readonly level: number;
  readonly xp: number;
  readonly xpForNext: number;
  readonly progress: number;
  readonly maxLevel: number;
  readonly maxed: boolean;
}

function slayerLevelAt(
  table: Record<number, number>,
  level: number,
  xp: number,
): SlayerLevel {
  const maxLevel = Object.keys(table).length;
  const xpForNext = table[level + 1] ?? 0;
  return {
    level,
    xp,
    xpForNext,
    progress: xpForNext === 0 ? 0 : Math.min(xp / xpForNext, 1),
    maxLevel,
    maxed: level >= maxLevel,
  };
}

export function slayerLevel(type: string, xp: number): SlayerLevel {
  const table = SLAYER_XP[type];
  if (table === undefined) {
    return {
      level: 0,
      xp: 0,
      xpForNext: 0,
      progress: 0,
      maxLevel: 0,
      maxed: false,
    };
  }

  const reversed = Object.entries(table).reverse();
  for (const [level, requiredXp] of reversed) {
    if (xp >= requiredXp) {
      return slayerLevelAt(table, Number.parseInt(level, 10), xp);
    }
  }

  return slayerLevelAt(table, 0, xp);
}

export interface PetLevel {
  readonly level: number;
  readonly xpCurrent: number;
  readonly xpForMax: number;
  readonly progress: number;
  readonly maxed: boolean;
}

const PET_RARITY_OFFSET: Record<string, number> = {
  COMMON: 0,
  UNCOMMON: 6,
  RARE: 11,
  EPIC: 16,
  LEGENDARY: 20,
  MYTHIC: 20,
  DIVINE: 0,
  SPECIAL: 0,
  VERY_SPECIAL: 0,
  UNKNOWN: 0,
};

const PET_LEVELS: readonly number[] = [
  100, 110, 120, 130, 145, 160, 175, 190, 210, 230, 250, 275, 300, 330, 360,
  400, 440, 490, 540, 600, 660, 730, 800, 880, 960, 1050, 1150, 1260, 1380,
  1510, 1650, 1800, 1960, 2130, 2310, 2500, 2700, 2920, 3160, 3420, 3700, 4000,
  4350, 4750, 5200, 5700, 6300, 7000, 7800, 8700, 9700, 10800, 12000, 13300,
  14700, 16200, 17800, 19500, 21300, 23200, 25200, 27400, 29800, 32400, 35200,
  38200, 41400, 44800, 48400, 52200, 56200, 60400, 64800, 69400, 74200, 79200,
  84700, 90700, 97200, 104200, 111700, 119700, 128200, 137200, 146700, 156700,
  167700, 179700, 192700, 206700, 221700, 237700, 254700, 272700, 291700,
  311700, 333700, 357700, 383700, 411700, 441700, 476700, 516700, 561700,
  611700, 666700, 726700, 791700, 861700, 936700, 1016700, 1101700, 1191700,
  1286700, 1386700, 1496700, 1616700, 1746700, 1886700,
];

const GOLDEN_DRAGON_MAX_LEVEL = 200;
const GOLDEN_DRAGON_PET_LEVELS: readonly number[] = [
  0,
  5555,
  ...new Array<number>(98).fill(1886700),
];

export function petLevel(xp: number, rarity: string, type?: string): PetLevel {
  const rarityOffset = type === "BINGO" ? 0 : (PET_RARITY_OFFSET[rarity] ?? 0);
  const maxLevel = type === "GOLDEN_DRAGON" ? GOLDEN_DRAGON_MAX_LEVEL : 100;

  const base = PET_LEVELS.slice(rarityOffset, rarityOffset + maxLevel - 1);
  const levels =
    type === "GOLDEN_DRAGON" ? base.concat(GOLDEN_DRAGON_PET_LEVELS) : base;

  let level = 1;
  let xpForMax = 0;
  let xpCurrent = 0;
  for (let i = 0; i < maxLevel - 1; i++) {
    xpForMax += levels[i] || 0;
    if (xpForMax <= xp) {
      level++;
      xpCurrent = xp - xpForMax;
    }
  }

  const xpForNext = levels[level - 1] ?? null;
  let progress = 0;
  if (xpForNext !== null) {
    const fraction = xpCurrent / xpForNext;
    progress = Number.isNaN(fraction) ? 0 : fraction;
  }

  return { level, xpCurrent, xpForMax, progress, maxed: maxLevel === level };
}

