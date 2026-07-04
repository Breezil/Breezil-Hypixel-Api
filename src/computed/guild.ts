import type { Guild, GuildRank } from "@breezil/hypixel-parsers";

import { guildExpUntilNextLevel, guildLevel } from "./shared/leveling";
import { gameByCode, type GameInfo } from "./shared/games";
import { percent, ratio, round2 } from "./shared/ratio";
import { argMax, sum } from "./shared/aggregate";
import { DAY_MS } from "./shared/time";

export interface GuildColor {
  readonly string: string;
  readonly hex: string;
  readonly code: string;
}

export interface GuildExpHistoryEntry {
  readonly day: string;
  readonly date: Date | null;
  readonly exp: number;
  readonly totalExp: number;
}

export interface GuildMemberComputed {
  readonly uuid: string;
  readonly weeklyExperience: number;
  readonly expHistory: readonly GuildExpHistoryEntry[];
}

export interface GuildComputed {
  readonly level: number;
  readonly ranks: readonly GuildRank[];
  readonly tagColor: GuildColor;
  readonly preferredGames: readonly GameInfo[];
  readonly totalWeeklyGEXP: number;
  readonly expHistory: readonly GuildExpHistoryEntry[];
  readonly members: readonly GuildMemberComputed[];
  readonly memberCount: number;
  readonly coinsSpent: number;
  readonly expUntilNextLevel: number;
  readonly topGameType: string | null;
  readonly guildExpByGameTypeShare: Record<string, number>;
  readonly ageInDays: number;
  readonly activeMembersThisWeek: number;
  readonly activeMemberSharePercent: number;
  readonly topWeeklyContributorUuid: string | null;
  readonly averageWeeklyGEXPPerMember: number;
  readonly memberCountByRank: Record<string, number>;
  readonly averageQuestParticipation: number;
}

const COLORS: Record<string, GuildColor> = {
  BLACK: { string: "Black", hex: "#000000", code: "§0" },
  DARK_BLUE: { string: "Dark Blue", hex: "#0000AA", code: "§1" },
  DARK_GREEN: { string: "Dark Green", hex: "#008000", code: "§2" },
  DARK_AQUA: { string: "Dark Aqua", hex: "#00AAAA", code: "§3" },
  DARK_RED: { string: "Dark Red", hex: "#AA0000", code: "§4" },
  DARK_PURPLE: { string: "Dark Purple", hex: "#AA00AA", code: "§5" },
  GOLD: { string: "Gold", hex: "#FFAA00", code: "§6" },
  GRAY: { string: "Gray", hex: "#AAAAAA", code: "§7" },
  DARK_GRAY: { string: "Dark Gray", hex: "#555555", code: "§8" },
  BLUE: { string: "Blue", hex: "#5555FF", code: "§9" },
  GREEN: { string: "Green", hex: "#55FF55", code: "§a" },
  AQUA: { string: "Aqua", hex: "#55FFFF", code: "§b" },
  RED: { string: "Red", hex: "#FF5555", code: "§c" },
  LIGHT_PURPLE: { string: "Light Purple", hex: "#FF55FF", code: "§d" },
  YELLOW: { string: "Yellow", hex: "#FFFF55", code: "§e" },
  WHITE: { string: "White", hex: "#FFFFFF", code: "§f" },
};

const UNKNOWN_COLOR: GuildColor = {
  string: "Gray",
  hex: "#AAAAAA",
  code: "§7",
};

function expLimit(exp: number): number {
  if (exp > 700000) return 250000 + Math.round(exp * 0.03);
  if (exp > 200000) return 200000 + Math.round((exp - 200000) / 10);
  return exp;
}

function parseDay(day: string): Date | null {
  const timestamp = Date.parse(`${day}T05:00:00.000Z`);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function toHistoryEntries(
  pairs: readonly (readonly [string, number])[],
  mapExp: (exp: number) => number = (exp) => exp,
): GuildExpHistoryEntry[] {
  let totalExp = 0;
  return pairs.map(([day, rawExp]) => {
    const exp = mapExp(rawExp);
    totalExp += exp;
    return { day, date: parseDay(day), exp, totalExp };
  });
}

function guildExpHistory(members: Guild["members"]): GuildExpHistoryEntry[] {
  const byDay = new Map<string, number>();
  for (const member of members) {
    for (const [day, exp] of Object.entries(member.expHistory)) {
      byDay.set(day, (byDay.get(day) ?? 0) + exp);
    }
  }
  return toHistoryEntries([...byDay], expLimit);
}

function resolveColor(tagColor: string): GuildColor {
  return COLORS[tagColor] ?? UNKNOWN_COLOR;
}

function gameTypeShare(exp: Record<string, number>): Record<string, number> {
  const total = sum(exp);
  const share: Record<string, number> = {};
  for (const [game, value] of Object.entries(exp)) {
    share[game] = percent(value, total);
  }
  return share;
}

function memberCountByRank(members: Guild["members"]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const member of members) {
    counts[member.rank] = (counts[member.rank] ?? 0) + 1;
  }
  return counts;
}

export function computeGuild(raw: Guild): GuildComputed {
  const members = raw.members.map((member) => ({
    uuid: member.uuid,
    weeklyExperience: sum(member.expHistory),
    expHistory: toHistoryEntries(Object.entries(member.expHistory)),
  }));
  const level = guildLevel(raw.exp);
  const totalWeeklyGEXP = members.reduce(
    (sum, member) => sum + member.weeklyExperience,
    0,
  );
  const totalQuestParticipation = raw.members.reduce(
    (sum, member) => sum + member.questParticipation,
    0,
  );
  const activeMembersThisWeek = members.filter(
    (member) => member.weeklyExperience > 0,
  ).length;
  return {
    level,
    ranks: [...raw.ranks].sort((a, b) => a.priority - b.priority),
    tagColor: resolveColor(raw.tagColor),
    preferredGames: raw.preferredGames.map(gameByCode),
    totalWeeklyGEXP,
    expHistory: guildExpHistory(raw.members),
    members,
    memberCount: raw.members.length,
    coinsSpent: raw.coinsEver - raw.coins,
    expUntilNextLevel: guildExpUntilNextLevel(raw.exp),
    topGameType: argMax(raw.guildExpByGameType),
    guildExpByGameTypeShare: gameTypeShare(raw.guildExpByGameType),
    ageInDays: raw.createdAt
      ? round2((Date.now() - raw.createdAt.getTime()) / DAY_MS)
      : 0,
    activeMembersThisWeek,
    activeMemberSharePercent: percent(activeMembersThisWeek, members.length),
    topWeeklyContributorUuid: argMax(
      members.map((member) => [member.uuid, member.weeklyExperience] as const),
      0,
    ),
    averageWeeklyGEXPPerMember: ratio(totalWeeklyGEXP, raw.members.length),
    memberCountByRank: memberCountByRank(raw.members),
    averageQuestParticipation: ratio(
      totalQuestParticipation,
      raw.members.length,
    ),
  };
}

