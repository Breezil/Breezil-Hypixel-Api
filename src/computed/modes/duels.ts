import { neededForNextWholeRatio, perGame, ratio } from "../shared/ratio";
import { argMax } from "../shared/aggregate";
import type {
  DuelsBridgeGamemodeStats,
  DuelsBridgeStats,
  DuelsGamemodeStats,
  DuelsModeStats,
  DuelsStats,
  DuelsTitlePrestige,
} from "@breezil/hypixel-parsers";

export interface DuelsCombatRatios {
  readonly KDR: number;
  readonly WLR: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly meleeAccuracy: number;
  readonly bowAccuracy: number;
}

export interface DuelsModeComputed extends DuelsCombatRatios {
  readonly title: string;
  readonly winsForNextTitle: number;
}

export interface DuelsGroupTotals {
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly playedGames: number;
  readonly swings: number;
  readonly hits: number;
  readonly bowShots: number;
  readonly bowHits: number;
  readonly blocksPlaced: number;
  readonly healthRegenerated: number;
  readonly goldenApplesEaten: number;
}

export interface DuelsGroupComputed
  extends DuelsGroupTotals, DuelsCombatRatios {
  readonly title: string;
  readonly winsForNextTitle: number;
  readonly submodes: Readonly<Record<string, DuelsCombatRatios>>;
}

export interface DuelsBridgeGroupComputed extends DuelsGroupComputed {
  readonly goalsPerGame: number;
  readonly capturesPerGame: number;
}

export interface DuelsOverallComputed extends DuelsCombatRatios {
  readonly title: string;
  readonly winsForNextTitle: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly damageDealtPerGame: number;
  readonly blocksPlacedPerGame: number;
  readonly goldenApplesPerGame: number;
  readonly legendaryChestRate: number;
  readonly healPotsPerGame: number;
  readonly goldenHeadToAppleRatio: number;
  readonly favoriteKit: string;
}

export interface DuelsComputed {
  readonly overall: DuelsOverallComputed;
  readonly blitz: DuelsModeComputed;
  readonly bow: DuelsModeComputed;
  readonly noDebuff: DuelsModeComputed;
  readonly combo: DuelsModeComputed;
  readonly bowSpleef: DuelsModeComputed;
  readonly sumo: DuelsModeComputed;
  readonly boxing: DuelsModeComputed;
  readonly parkour: DuelsModeComputed;
  readonly arena: DuelsCombatRatios;
  readonly uhc: DuelsGroupComputed;
  readonly skywars: DuelsGroupComputed;
  readonly megaWalls: DuelsGroupComputed;
  readonly overPowered: DuelsGroupComputed;
  readonly classic: DuelsGroupComputed;
  readonly bridge: DuelsBridgeGroupComputed;
}

interface CombatCounts {
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly meleeHits: number;
  readonly meleeSwings: number;
  readonly bowHits: number;
  readonly bowShots: number;
}

const DUELS_DIVISIONS: readonly {
  readonly key: keyof DuelsTitlePrestige;
  readonly name: string;
  readonly wins: number;
  readonly winsPerLevel: number;
}[] = [
  { key: "rookie", name: "Rookie", wins: 50, winsPerLevel: 10 },
  { key: "iron", name: "Iron", wins: 100, winsPerLevel: 30 },
  { key: "gold", name: "Gold", wins: 250, winsPerLevel: 50 },
  { key: "diamond", name: "Diamond", wins: 500, winsPerLevel: 100 },
  { key: "master", name: "Master", wins: 1000, winsPerLevel: 200 },
  { key: "legend", name: "Legend", wins: 2000, winsPerLevel: 600 },
  { key: "grandmaster", name: "Grandmaster", wins: 5000, winsPerLevel: 1000 },
  { key: "godlike", name: "Godlike", wins: 10_000, winsPerLevel: 3000 },
  { key: "celestial", name: "Celestial", wins: 25_000, winsPerLevel: 5000 },
  { key: "divine", name: "Divine", wins: 50_000, winsPerLevel: 10_000 },
  { key: "worldElite", name: "Ascended", wins: 100_000, winsPerLevel: 10_000 },
];

const DUELS_LEVELS_PER_DIVISION = 5;
const DUELS_OVERALL_WINS_MULTIPLIER = 2;

const ROMAN_NUMERALS: readonly (readonly [number, string])[] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function romanize(value: number): string {
  let remaining = value;
  let result = "";
  for (const [amount, symbol] of ROMAN_NUMERALS) {
    while (remaining >= amount) {
      result += symbol;
      remaining -= amount;
    }
  }
  return result;
}

function duelsTitle(prestige: DuelsTitlePrestige): string {
  for (let i = DUELS_DIVISIONS.length - 1; i >= 0; i -= 1) {
    const division = DUELS_DIVISIONS[i];
    const value = prestige[division.key];
    if (value > 0) return `${division.name} ${romanize(value)}`;
  }
  return "";
}

function duelsWinsForNextTitle(wins: number, multiplier = 1): number {
  for (const division of DUELS_DIVISIONS) {
    for (let level = 0; level < DUELS_LEVELS_PER_DIVISION; level += 1) {
      const threshold =
        (division.wins + division.winsPerLevel * level) * multiplier;
      if (wins < threshold) return threshold - wins;
    }
  }
  return 0;
}

function combatRatios(counts: CombatCounts): DuelsCombatRatios {
  return {
    KDR: ratio(counts.kills, counts.deaths),
    WLR: ratio(counts.wins, counts.losses),
    killsForNextKdr: neededForNextWholeRatio(counts.kills, counts.deaths),
    winsForNextWlr: neededForNextWholeRatio(counts.wins, counts.losses),
    meleeAccuracy: ratio(counts.meleeHits, counts.meleeSwings),
    bowAccuracy: ratio(counts.bowHits, counts.bowShots),
  };
}

function sumGroup(modes: readonly DuelsGamemodeStats[]): DuelsGroupTotals {
  return modes.reduce<DuelsGroupTotals>(
    (acc, mode) => ({
      kills: acc.kills + mode.kills,
      deaths: acc.deaths + mode.deaths,
      wins: acc.wins + mode.wins,
      losses: acc.losses + mode.losses,
      playedGames: acc.playedGames + mode.roundsPlayed,
      swings: acc.swings + mode.meleeSwings,
      hits: acc.hits + mode.meleeHits,
      bowShots: acc.bowShots + mode.bowShots,
      bowHits: acc.bowHits + mode.bowHits,
      blocksPlaced: acc.blocksPlaced + mode.blocksPlaced,
      healthRegenerated: acc.healthRegenerated + mode.healthRegenerated,
      goldenApplesEaten: acc.goldenApplesEaten + mode.goldenApplesEaten,
    }),
    {
      kills: 0,
      deaths: 0,
      wins: 0,
      losses: 0,
      playedGames: 0,
      swings: 0,
      hits: 0,
      bowShots: 0,
      bowHits: 0,
      blocksPlaced: 0,
      healthRegenerated: 0,
      goldenApplesEaten: 0,
    },
  );
}

function submodeRatios(
  modes: Readonly<Record<string, DuelsGamemodeStats>>,
): Record<string, DuelsCombatRatios> {
  const result: Record<string, DuelsCombatRatios> = {};
  for (const [name, mode] of Object.entries(modes)) {
    result[name] = combatRatios(mode);
  }
  return result;
}

function duelsGroup(
  prestige: DuelsTitlePrestige,
  modes: Readonly<Record<string, DuelsGamemodeStats>>,
): DuelsGroupComputed {
  const totals = sumGroup(Object.values(modes));
  return {
    title: duelsTitle(prestige),
    winsForNextTitle: duelsWinsForNextTitle(totals.wins),
    ...totals,
    ...combatRatios({
      kills: totals.kills,
      deaths: totals.deaths,
      wins: totals.wins,
      losses: totals.losses,
      meleeHits: totals.hits,
      meleeSwings: totals.swings,
      bowHits: totals.bowHits,
      bowShots: totals.bowShots,
    }),
    submodes: submodeRatios(modes),
  };
}

function duelsBridgeGroup(bridge: DuelsBridgeStats): DuelsBridgeGroupComputed {
  const modes: Readonly<Record<string, DuelsBridgeGamemodeStats>> = {
    solo: bridge.solo,
    doubles: bridge.doubles,
    threes: bridge.threes,
    fours: bridge.fours,
    teamsOfTwo: bridge.teamsOfTwo,
    teamsOfThree: bridge.teamsOfThree,
    captureSolo: bridge.captureSolo,
    captureThrees: bridge.captureThrees,
    tournament: bridge.tournament,
  };
  const group = duelsGroup(bridge.titlePrestige, modes);
  const captures = Object.values(modes).reduce(
    (total, mode) => total + mode.captures,
    0,
  );
  return {
    ...group,
    goalsPerGame: perGame(bridge.goals, group.playedGames),
    capturesPerGame: perGame(captures, group.playedGames),
  };
}

function duelsMode(mode: DuelsModeStats): DuelsModeComputed {
  return {
    title: duelsTitle(mode.titlePrestige),
    winsForNextTitle: duelsWinsForNextTitle(mode.wins),
    ...combatRatios(mode),
  };
}

function favoriteKit(kitWins: Readonly<Record<string, number>>): string {
  const entries = Object.entries(kitWins).filter(([kit]) => kit !== "total");
  return argMax(entries, 0) ?? "";
}

function duelsOverall(raw: DuelsStats): DuelsOverallComputed {
  return {
    title: duelsTitle(raw.titlePrestige),
    winsForNextTitle: duelsWinsForNextTitle(
      raw.wins,
      DUELS_OVERALL_WINS_MULTIPLIER,
    ),
    ...combatRatios(raw),
    winRate: ratio(raw.wins, raw.wins + raw.losses),
    killsPerGame: perGame(raw.kills, raw.gamesPlayed),
    damageDealtPerGame: perGame(raw.damageDealt, raw.gamesPlayed),
    blocksPlacedPerGame: perGame(raw.blocksPlaced, raw.gamesPlayed),
    goldenApplesPerGame: perGame(raw.goldenApplesEaten, raw.gamesPlayed),
    legendaryChestRate: ratio(raw.openedLegendaries, raw.openedChests),
    healPotsPerGame: perGame(raw.healPotsUsed, raw.gamesPlayed),
    goldenHeadToAppleRatio: ratio(raw.goldenHeadsEaten, raw.goldenApplesEaten),
    favoriteKit: favoriteKit(raw.kitWins),
  };
}

export function computeDuels(raw: DuelsStats): DuelsComputed {
  return {
    overall: duelsOverall(raw),
    blitz: duelsMode(raw.blitz),
    bow: duelsMode(raw.bow),
    noDebuff: duelsMode(raw.noDebuff),
    combo: duelsMode(raw.combo),
    bowSpleef: duelsMode(raw.bowSpleef),
    sumo: duelsMode(raw.sumo),
    boxing: duelsMode(raw.boxing),
    parkour: duelsMode(raw.parkour),
    arena: combatRatios(raw.arena),
    uhc: duelsGroup(raw.uhc.titlePrestige, {
      solo: raw.uhc.solo,
      doubles: raw.uhc.doubles,
      fours: raw.uhc.fours,
      deathmatch: raw.uhc.deathmatch,
    }),
    skywars: duelsGroup(raw.skywars.titlePrestige, {
      solo: raw.skywars.solo,
      doubles: raw.skywars.doubles,
    }),
    megaWalls: duelsGroup(raw.megaWalls.titlePrestige, {
      solo: raw.megaWalls.solo,
      doubles: raw.megaWalls.doubles,
      fours: raw.megaWalls.fours,
    }),
    overPowered: duelsGroup(raw.overPowered.titlePrestige, {
      solo: raw.overPowered.solo,
      doubles: raw.overPowered.doubles,
    }),
    classic: duelsGroup(raw.classic.titlePrestige, {
      solo: raw.classic.solo,
      doubles: raw.classic.doubles,
    }),
    bridge: duelsBridgeGroup(raw.bridge),
  };
}

