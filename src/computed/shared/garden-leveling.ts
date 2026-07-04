import { levelByXp, type XpLevel } from "./skyblock-leveling";

export type CropType =
  | "wheat"
  | "carrot"
  | "sugarCane"
  | "potato"
  | "pumpkin"
  | "melon"
  | "cactus"
  | "cocoaBeans"
  | "mushroom"
  | "netherWart"
  | "moonFlower"
  | "sunFlower"
  | "wildRose";

const CROP_MILESTONE_CAP = 46;

const WHEAT_CURVE: readonly number[] = [
  30, 50, 80, 200, 350, 700, 1500, 2500, 3500, 5000, 6500, 8000, 10000, 20000,
  35000, 50000, 75000, 100000, 175000, 250000, 375000, 400000, 450000, 650000,
  800000,
];

const CARROT_CURVE: readonly number[] = [
  100, 150, 250, 500, 1000, 2000, 4500, 9000, 12000, 15000, 20000, 25000, 35000,
  70000, 120000, 180000, 250000, 350000, 600000, 850000, 1100000, 1400000,
  1800000, 2200000, 2600000,
];

const MOONFLOWER_CURVE: readonly number[] = [
  ...WHEAT_CURVE.slice(0, 4),
  700,
  ...WHEAT_CURVE.slice(5),
];

function milestoneTable(
  curve: readonly number[],
  scale = 1,
): Record<number, number> {
  const table: Record<number, number> = {};
  for (let level = 1; level <= CROP_MILESTONE_CAP; level++) {
    table[level] = curve[Math.min(level, curve.length) - 1] * scale;
  }
  return table;
}

const WHEAT_XP = milestoneTable(WHEAT_CURVE);
const CARROT_XP = milestoneTable(CARROT_CURVE);
const SUGAR_CANE_XP = milestoneTable(WHEAT_CURVE, 2);
const COCOA_BEANS_XP = milestoneTable(WHEAT_CURVE, 3);
const MELON_XP = milestoneTable(WHEAT_CURVE, 5);
const MOONFLOWER_XP = milestoneTable(MOONFLOWER_CURVE);

const CROP_TABLES: Record<CropType, Record<number, number>> = {
  wheat: WHEAT_XP,
  carrot: CARROT_XP,
  sugarCane: SUGAR_CANE_XP,
  potato: CARROT_XP,
  pumpkin: WHEAT_XP,
  melon: MELON_XP,
  cactus: SUGAR_CANE_XP,
  cocoaBeans: COCOA_BEANS_XP,
  mushroom: WHEAT_XP,
  netherWart: COCOA_BEANS_XP,
  moonFlower: MOONFLOWER_XP,
  sunFlower: WHEAT_XP,
  wildRose: SUGAR_CANE_XP,
};

export function cropMilestoneLevel(crop: CropType, xp: number): XpLevel {
  return levelByXp(xp, CROP_TABLES[crop], CROP_MILESTONE_CAP, false);
}

