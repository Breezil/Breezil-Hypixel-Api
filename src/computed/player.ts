import type { HypixelPlayer } from "@breezil/hypixel-parsers";

import { ratio, round2 } from "./shared/ratio";
import { sum } from "./shared/aggregate";
import { DAY_MS } from "./shared/time";
import {
  levelStartXp,
  networkLevel,
  type LevelProgress,
} from "./shared/leveling";

export interface PlayerComputed {
  readonly rank: string | null;
  readonly formattedNickname: string;
  readonly level: LevelProgress;
  readonly accountAgeDays: number;
  readonly daysSinceLastLogin: number;
  readonly networkExpPerDay: number;
  readonly karmaPerNetworkLevel: number;
  readonly karmaPerExp: number;
  readonly questsCompleted: number;
  readonly challengesCompleted: number;
  readonly socialMediaLinked: number;
  readonly parkourCoursesCompleted: number;
  readonly xpToReachLevel: (target: number) => number;
}

const FORMATTING = /§[0-9a-fk-or]/g;
const BRACKETS = /[[\]]/g;
const UNDERSCORES = /_+/g;

function playerRank(raw: HypixelPlayer): string | null {
  if (raw.prefix) {
    return raw.prefix.replace(FORMATTING, "").replace(BRACKETS, "").trim();
  }
  if (raw.staffRank && raw.staffRank !== "NORMAL") {
    return raw.staffRank === "YOUTUBER"
      ? "YouTube"
      : raw.staffRank.replace(UNDERSCORES, " ");
  }
  if (raw.monthlyPackageRank && raw.monthlyPackageRank !== "NONE") {
    return "MVP++";
  }
  switch (raw.newPackageRank) {
    case "MVP_PLUS":
      return "MVP+";
    case "MVP":
      return "MVP";
    case "VIP_PLUS":
      return "VIP+";
    case "VIP":
      return "VIP";
    default:
      return null;
  }
}

function elapsedDays(at: Date | null): number {
  return at ? round2((Date.now() - at.getTime()) / DAY_MS) : 0;
}

const SOCIAL_LINKS = [
  "discord",
  "youtube",
  "twitch",
  "hypixel",
  "twitter",
  "instagram",
  "tiktok",
] as const;

function questsCompleted(raw: HypixelPlayer): number {
  return raw.quests.reduce(
    (total, quest) => total + quest.completions.length,
    0,
  );
}

function socialMediaLinked(raw: HypixelPlayer): number {
  return SOCIAL_LINKS.filter((link) => raw.socialMedia[link] !== "").length;
}

export function computePlayer(raw: HypixelPlayer): PlayerComputed {
  const rank = playerRank(raw);
  const level = networkLevel(raw.networkExp);
  const accountAgeDays = elapsedDays(raw.firstLoginAt);
  return {
    rank,
    formattedNickname: rank ? `[${rank}] ${raw.nickname}` : raw.nickname,
    level,
    accountAgeDays,
    daysSinceLastLogin: elapsedDays(raw.lastLoginAt),
    networkExpPerDay: ratio(raw.networkExp, accountAgeDays),
    karmaPerNetworkLevel: ratio(raw.karma, level.level),
    karmaPerExp: ratio(raw.karma, raw.networkExp),
    questsCompleted: questsCompleted(raw),
    challengesCompleted: sum(raw.challenges["all_time"] ?? {}),
    socialMediaLinked: socialMediaLinked(raw),
    parkourCoursesCompleted: raw.parkour.length,
    xpToReachLevel: (target) => round2(levelStartXp(target) - raw.networkExp),
  };
}

