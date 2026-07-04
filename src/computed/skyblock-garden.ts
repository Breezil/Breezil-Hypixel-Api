import { type SkyBlockGarden } from "@breezil/hypixel-parsers";

import { cropMilestoneLevel, type CropType } from "./shared/garden-leveling";
import { gardenLevel, type XpLevel } from "./shared/skyblock-leveling";
import { percent, ratio } from "./shared/ratio";
import { sum } from "./shared/aggregate";

export interface GardenComputed {
  readonly level: XpLevel;
  readonly cropMilestones: Record<CropType, XpLevel>;
  readonly totalCropMilestoneLevel: number;
  readonly averageCropMilestoneLevel: number;
  readonly maxedCropCount: number;
  readonly highestCrop: CropType | null;
  readonly totalCropsCollected: number;
  readonly totalCropUpgradeLevel: number;
  readonly averageCropUpgrade: number;
  readonly unlockedPlotCount: number;
  readonly unlockedBarnSkinCount: number;
  readonly greenhouseSlotCount: number;
  readonly totalVisits: number;
  readonly activeVisitorCount: number;
  readonly visitorCompletionShare: number;
  readonly uniqueVisitorShare: number;
  readonly completionsPerUniqueVisitor: number;
  readonly composterUpgradeLevelTotal: number;
}

const CROP_TYPES: readonly CropType[] = [
  "wheat",
  "carrot",
  "sugarCane",
  "potato",
  "pumpkin",
  "melon",
  "cactus",
  "cocoaBeans",
  "mushroom",
  "netherWart",
  "moonFlower",
  "sunFlower",
  "wildRose",
];

export function computeGarden(raw: SkyBlockGarden): GardenComputed {
  const cropMilestones = {} as Record<CropType, XpLevel>;
  let totalCropMilestoneLevel = 0;
  let maxedCropCount = 0;
  let highestCrop: CropType | null = null;
  let highestLevel = -1;

  for (const crop of CROP_TYPES) {
    const milestone = cropMilestoneLevel(crop, raw.cropMilestones[crop]);
    cropMilestones[crop] = milestone;
    totalCropMilestoneLevel += milestone.level;
    if (milestone.maxed) {
      maxedCropCount++;
    }
    if (milestone.level > highestLevel) {
      highestLevel = milestone.level;
      highestCrop = crop;
    }
  }

  const totalVisits = sum(raw.visitors.visited);
  const totalCropUpgradeLevel = sum(
    CROP_TYPES.map((crop) => raw.cropUpgrades[crop]),
  );
  const upgrades = raw.composter.upgrades;

  return {
    level: gardenLevel(raw.gardenExperience),
    cropMilestones,
    totalCropMilestoneLevel,
    averageCropMilestoneLevel: ratio(
      totalCropMilestoneLevel,
      CROP_TYPES.length,
    ),
    maxedCropCount,
    highestCrop,
    totalCropsCollected: sum(
      CROP_TYPES.map((crop) => raw.cropMilestones[crop]),
    ),
    totalCropUpgradeLevel,
    averageCropUpgrade: ratio(totalCropUpgradeLevel, CROP_TYPES.length),
    unlockedPlotCount: raw.unlockedPlots.length,
    unlockedBarnSkinCount: raw.unlockedBarnSkins.length,
    greenhouseSlotCount: raw.greenhouseSlots.length,
    totalVisits,
    activeVisitorCount: raw.currentVisitors.length,
    visitorCompletionShare: percent(raw.visitors.totalCompleted, totalVisits),
    uniqueVisitorShare: percent(
      raw.visitors.uniqueNpcsServed,
      raw.visitors.totalCompleted,
    ),
    completionsPerUniqueVisitor: ratio(
      raw.visitors.totalCompleted,
      raw.visitors.uniqueNpcsServed,
    ),
    composterUpgradeLevelTotal:
      upgrades.speed +
      upgrades.multiDrop +
      upgrades.fuelCap +
      upgrades.organicMatterCap +
      upgrades.costReduction,
  };
}

