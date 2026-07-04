import {
  type SkyBlockDungeonMode,
  type SkyBlockMember,
} from "@breezil/hypixel-parsers";

import { percent, ratio, round2 } from "./shared/ratio";
import { argMax, sum } from "./shared/aggregate";
import {
  dungeonLevel,
  petLevel,
  skillLevel,
  slayerLevel,
  type PetLevel,
  type SkillType,
  type SlayerLevel,
  type XpLevel,
} from "./shared/skyblock-leveling";

export interface SkyBlockSlayerComputed extends SlayerLevel {
  readonly totalBossKills: number;
  readonly bossAccuracy: number;
}

export interface SkyBlockPetComputed {
  readonly type: string;
  readonly tier: string;
  readonly active: boolean;
  readonly level: PetLevel;
}

export interface SkyBlockMemberComputed {
  readonly skills: Record<SkillType, XpLevel>;
  readonly averageSkillLevel: number;
  readonly nonCosmeticAverageSkillLevel: number;
  readonly totalSkillXp: number;
  readonly maxedSkillCount: number;
  readonly farmingLevelCap: number;
  readonly tamingLevelCap: number;
  readonly slayers: Record<string, SkyBlockSlayerComputed>;
  readonly totalSlayerXp: number;
  readonly activeSlayerQuestElapsedMs: number | null;
  readonly catacombs: XpLevel;
  readonly masterCatacombs: XpLevel;
  readonly catacombsBestRunScores: Record<string, readonly number[]>;
  readonly masterCatacombsBestRunScores: Record<string, readonly number[]>;
  readonly dungeonClasses: Record<string, XpLevel>;
  readonly classAverage: number;
  readonly classXpShare: Record<string, number>;
  readonly dominantClass: string | null;
  readonly mostPlayedFloor: string | null;
  readonly secretsPerRun: number;
  readonly treasureChestCountByRun: Record<string, number>;
  readonly pets: readonly SkyBlockPetComputed[];
  readonly activePet: SkyBlockPetComputed | null;
  readonly petCount: number;
  readonly petScore: number;
  readonly maxedPetCount: number;
  readonly topSlayer: string | null;
  readonly skyblockLevel: number;
}

const SKILL_TYPES: readonly SkillType[] = [
  "farming",
  "mining",
  "combat",
  "foraging",
  "fishing",
  "enchanting",
  "alchemy",
  "taming",
  "carpentry",
  "runecrafting",
  "social",
  "hunting",
];

const AVERAGE_SKILLS: readonly SkillType[] = [
  "farming",
  "mining",
  "combat",
  "foraging",
  "fishing",
  "enchanting",
  "alchemy",
  "taming",
  "carpentry",
  "runecrafting",
  "social",
];

const NON_COSMETIC_SKILLS: readonly SkillType[] = [
  "farming",
  "mining",
  "combat",
  "foraging",
  "fishing",
  "enchanting",
  "alchemy",
  "taming",
  "carpentry",
];

const DUNGEON_CLASSES: readonly string[] = [
  "healer",
  "mage",
  "berserk",
  "archer",
  "tank",
];

const PET_RARITY_INDEX: Record<string, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  MYTHIC: 6,
  DIVINE: 7,
  SUPREME: 8,
  SPECIAL: 9,
  VERY_SPECIAL: 10,
  ADMIN: 11,
};

// Rift-only pet; SkyCrypt/reborn exclude it from the pet score.
const PET_SCORE_EXCLUDED_TYPES: ReadonlySet<string> = new Set([
  "FRACTURED_MONTEZUMA_SOUL",
]);

const BASE_FARMING_CAP = 50;
const BASE_TAMING_CAP = 50;
const XP_PER_SKYBLOCK_LEVEL = 100;

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return round2(sum(values) / values.length);
}

function computeSkills(
  raw: SkyBlockMember,
  farmingCap: number,
  tamingCap: number,
): Record<SkillType, XpLevel> {
  const caps: Partial<Record<SkillType, number>> = {
    farming: farmingCap,
    taming: tamingCap,
  };
  const skills = {} as Record<SkillType, XpLevel>;
  for (const type of SKILL_TYPES) {
    skills[type] = skillLevel(raw.skillExperience[type], type, caps[type]);
  }
  return skills;
}

function skillAverage(
  skills: Record<SkillType, XpLevel>,
  types: readonly SkillType[],
): number {
  return average(types.map((type) => skills[type].level));
}

function computeSlayers(
  bosses: SkyBlockMember["slayers"]["bosses"],
): Record<string, SkyBlockSlayerComputed> {
  const result: Record<string, SkyBlockSlayerComputed> = {};
  for (const [name, boss] of Object.entries(bosses)) {
    const kills =
      boss.bossKillsTier0 +
      boss.bossKillsTier1 +
      boss.bossKillsTier2 +
      boss.bossKillsTier3 +
      boss.bossKillsTier4;
    const attempts =
      boss.bossAttemptsTier0 +
      boss.bossAttemptsTier1 +
      boss.bossAttemptsTier2 +
      boss.bossAttemptsTier3 +
      boss.bossAttemptsTier4;
    result[name] = {
      ...slayerLevel(name, boss.xp),
      totalBossKills: kills,
      bossAccuracy: ratio(kills, attempts),
    };
  }
  return result;
}

function computeDungeonClasses(
  classExperience: SkyBlockMember["dungeons"]["classExperience"],
): Record<string, XpLevel> {
  const result: Record<string, XpLevel> = {};
  for (const name of DUNGEON_CLASSES) {
    result[name] = dungeonLevel(classExperience[name]?.experience ?? 0);
  }
  return result;
}

function computeClassXpShare(
  classExperience: SkyBlockMember["dungeons"]["classExperience"],
): Record<string, number> {
  const total = sum(
    DUNGEON_CLASSES.map((name) => classExperience[name]?.experience ?? 0),
  );
  const result: Record<string, number> = {};
  for (const name of DUNGEON_CLASSES) {
    result[name] = percent(classExperience[name]?.experience ?? 0, total);
  }
  return result;
}

function computeBestRunScores(
  mode: SkyBlockDungeonMode,
): Record<string, readonly number[]> {
  const result: Record<string, readonly number[]> = {};
  for (const [floor, runs] of Object.entries(mode.bestRuns)) {
    result[floor] = runs.map(
      (run) =>
        run.scoreExploration + run.scoreSpeed + run.scoreSkill + run.scoreBonus,
    );
  }
  return result;
}

function computeTreasureChestCounts(
  treasures: SkyBlockMember["dungeons"]["treasures"],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const run of treasures.runs) {
    result[run.runId] = 0;
  }
  for (const chest of treasures.chests) {
    result[chest.runId] = (result[chest.runId] ?? 0) + 1;
  }
  return result;
}

function computePets(
  pets: SkyBlockMember["pets"]["pets"],
): readonly SkyBlockPetComputed[] {
  return pets.map((pet) => ({
    type: pet.type,
    tier: pet.tier,
    active: pet.active,
    level: petLevel(pet.experience, pet.tier, pet.type),
  }));
}

function computePetScore(pets: readonly SkyBlockPetComputed[]): number {
  const highestRarity = new Map<string, number>();
  const maxedTypes = new Set<string>();
  for (const pet of pets) {
    if (pet.type === "UNKNOWN" || PET_SCORE_EXCLUDED_TYPES.has(pet.type)) {
      continue;
    }
    const index = PET_RARITY_INDEX[pet.tier];
    if (index === undefined) {
      continue;
    }
    if (index > (highestRarity.get(pet.type) ?? 0)) {
      highestRarity.set(pet.type, index);
    }
    if (pet.level.maxed) {
      maxedTypes.add(pet.type);
    }
  }
  return sum([...highestRarity.values()]) + maxedTypes.size;
}

export function computeSkyBlockMember(
  raw: SkyBlockMember,
): SkyBlockMemberComputed {
  const farmingLevelCap =
    BASE_FARMING_CAP + raw.jacobContests.perks.farmingLevelCap;
  const tamingLevelCap = BASE_TAMING_CAP + raw.pets.sacrificedPetTypes.length;
  const skills = computeSkills(raw, farmingLevelCap, tamingLevelCap);
  const dungeonClasses = computeDungeonClasses(raw.dungeons.classExperience);
  const pets = computePets(raw.pets.pets);
  const activeQuest = raw.slayers.activeQuest;

  const tierCompletions = raw.dungeons.catacombs.tierCompletions;
  const floorCompletions = Object.entries(tierCompletions).filter(
    ([floor]) => floor !== "total",
  );

  return {
    skills,
    averageSkillLevel: skillAverage(skills, AVERAGE_SKILLS),
    nonCosmeticAverageSkillLevel: skillAverage(skills, NON_COSMETIC_SKILLS),
    totalSkillXp: sum(SKILL_TYPES.map((type) => raw.skillExperience[type])),
    maxedSkillCount: SKILL_TYPES.filter((type) => skills[type].maxed).length,
    farmingLevelCap,
    tamingLevelCap,
    slayers: computeSlayers(raw.slayers.bosses),
    totalSlayerXp: sum(
      Object.values(raw.slayers.bosses).map((boss) => boss.xp),
    ),
    activeSlayerQuestElapsedMs:
      activeQuest === null || activeQuest.startTimestamp === 0
        ? null
        : Date.now() - activeQuest.startTimestamp,
    catacombs: dungeonLevel(raw.dungeons.catacombs.experience),
    masterCatacombs: dungeonLevel(raw.dungeons.masterCatacombs.experience),
    catacombsBestRunScores: computeBestRunScores(raw.dungeons.catacombs),
    masterCatacombsBestRunScores: computeBestRunScores(
      raw.dungeons.masterCatacombs,
    ),
    dungeonClasses,
    classAverage: average(
      DUNGEON_CLASSES.map((name) => dungeonClasses[name].level),
    ),
    classXpShare: computeClassXpShare(raw.dungeons.classExperience),
    dominantClass: argMax(
      DUNGEON_CLASSES.map(
        (name) =>
          [name, raw.dungeons.classExperience[name]?.experience ?? 0] as const,
      ),
    ),
    mostPlayedFloor: argMax(floorCompletions),
    secretsPerRun: ratio(raw.dungeons.secrets, tierCompletions.total ?? 0),
    treasureChestCountByRun: computeTreasureChestCounts(raw.dungeons.treasures),
    pets,
    activePet: pets.find((pet) => pet.active) ?? null,
    petCount: pets.length,
    petScore: computePetScore(pets),
    maxedPetCount: pets.filter((pet) => pet.level.maxed).length,
    topSlayer: argMax(
      Object.entries(raw.slayers.bosses).map(
        ([name, boss]) => [name, boss.xp] as const,
      ),
      0,
    ),
    skyblockLevel: raw.leveling.experience / XP_PER_SKYBLOCK_LEVEL,
  };
}

