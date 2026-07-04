import type { WallsStats } from "@breezil/hypixel-parsers";

import { neededForNextWholeRatio, perGame, ratio } from "../shared/ratio";
import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { argMax, sum } from "../shared/aggregate";

export interface WallsComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly killsPerGame: number;
  readonly assistKillRatio: number;
  readonly combatParticipationPerGame: number;
  readonly totalMapVotes: number;
  readonly favoriteMap: string;
  readonly perksUnlocked: number;
  readonly monthlyWins: number;
  readonly weeklyWins: number;
  readonly monthlyKills: number;
  readonly weeklyKills: number;
}

const PERK_KEYS: readonly (keyof WallsStats)[] = [
  "adrenaline",
  "artisan",
  "attractor",
  "bacon",
  "berserk",
  "blacksmith",
  "blacksmithStarter",
  "bomberman",
  "bossDigger",
  "bossGuardian",
  "bossSkills",
  "burnBabyBurn",
  "canadian",
  "catsEye",
  "chainkiller",
  "chef",
  "chemist",
  "creeperEgg",
  "dwarwenSkills",
  "ecologist",
  "einstein",
  "escapist",
  "excavator",
  "expertMiner",
  "farmer",
  "finalForm",
  "fireproof",
  "fisherman",
  "fortune",
  "getToTheChoppa",
  "goldRush",
  "graveDigger",
  "grimReaper",
  "guitarist",
  "haste",
  "hunter",
  "lazyman",
  "leatherWorker",
  "masterTroll",
  "necromancer",
  "opportunity",
  "pyromaniac",
  "ready",
  "reallyShiny",
  "redstoneExpert",
  "sage",
  "scotsman",
  "skybaseKing",
  "smartBoy",
  "snackLover",
  "soupDrinker",
  "step",
  "stoneGuardian",
  "swift",
  "tenacity",
  "thatsHot",
  "tragedy",
  "trapEngineer",
  "vampirism",
  "veryFortunate",
  "vitality",
];

function mapVotes(raw: WallsStats): Readonly<Record<string, number>> {
  return {
    Aztec: raw.votesAztec,
    Candyland: raw.votesCandyland,
    Castle: raw.votesCastle,
    Dwarven: raw.votesDwarven,
    Egypt: raw.votesEgypt,
    Fantasy: raw.votesFantasy,
    Harmony: raw.votesHarmony,
    Island: raw.votesIsland,
    Jungle: raw.votesJungle,
    LoveLand: raw.votesLoveLand,
    Modern: raw.votesModern,
    Nordic: raw.votesNordic,
    Outback: raw.votesOutback,
    Saraat: raw.votesSaraat,
    Shire: raw.votesShire,
    Space: raw.votesSpace,
    Wild: raw.votesWild,
  };
}

function perksUnlocked(raw: WallsStats): number {
  return PERK_KEYS.reduce(
    (count, key) => count + ((raw[key] as number) > 0 ? 1 : 0),
    0,
  );
}

export function computeWalls(raw: WallsStats): WallsComputed {
  const games = raw.wins + raw.losses;
  const votes = mapVotes(raw);
  const now = new Date();
  return {
    kdr: ratio(raw.kills, raw.deaths),
    wlr: ratio(raw.wins, raw.losses),
    winRate: ratio(raw.wins, games),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, raw.losses),
    killsPerGame: perGame(raw.kills, games),
    assistKillRatio: ratio(raw.assists, raw.kills),
    combatParticipationPerGame: perGame(raw.kills + raw.assists, games),
    totalMapVotes: sum(votes),
    favoriteMap: argMax(votes, 0) ?? "",
    perksUnlocked: perksUnlocked(raw),
    monthlyWins: monthlyValue(raw.monthlyWinsA, raw.monthlyWinsB, now),
    weeklyWins: weeklyValue(raw.weeklyWinsA, raw.weeklyWinsB, now),
    monthlyKills: monthlyValue(raw.monthlyKillsA, raw.monthlyKillsB, now),
    weeklyKills: weeklyValue(raw.weeklyKillsA, raw.weeklyKillsB, now),
  };
}

