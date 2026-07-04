import type { SpeedUHCStats } from "@breezil/hypixel-parsers";

import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

const SPEED_UHC_TITLE_REQUIREMENTS = [
  { title: "Hiker", requirement: 0 },
  { title: "Jogger", requirement: 50 },
  { title: "Runner", requirement: 300 },
  { title: "Sprinter", requirement: 1050 },
  { title: "Turbo", requirement: 2550 },
  { title: "Sanic", requirement: 5550 },
  { title: "Hot Rod", requirement: 15550 },
  { title: "Bolt", requirement: 30550 },
  { title: "Zoom", requirement: 55550 },
  { title: "God Speed", requirement: 85550 },
] as const;

export type SpeedUHCTitle =
  (typeof SPEED_UHC_TITLE_REQUIREMENTS)[number]["title"];

export interface SpeedUHCModeComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
}

export interface SpeedUHCComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly arrowAccuracy: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly averageSurvivors: number;
  readonly kadr: number;
  readonly quitRate: number;
  readonly tearsPerGame: number;
  readonly assistShare: number;
  readonly title: SpeedUHCTitle;
  readonly scoreToNextTitle: number;
  readonly titleProgressPercent: number;
  readonly modes: Readonly<Record<string, SpeedUHCModeComputed>>;
}

interface TitleProgression {
  readonly title: SpeedUHCTitle;
  readonly scoreToNextTitle: number;
  readonly titleProgressPercent: number;
}

function resolveTitle(score: number): TitleProgression {
  let current: (typeof SPEED_UHC_TITLE_REQUIREMENTS)[number] =
    SPEED_UHC_TITLE_REQUIREMENTS[0];
  let next: (typeof SPEED_UHC_TITLE_REQUIREMENTS)[number] | null = null;
  for (const entry of SPEED_UHC_TITLE_REQUIREMENTS) {
    if (score >= entry.requirement) {
      current = entry;
    } else {
      next = entry;
      break;
    }
  }
  if (next === null) {
    return {
      title: current.title,
      scoreToNextTitle: 0,
      titleProgressPercent: 100,
    };
  }
  return {
    title: current.title,
    scoreToNextTitle: next.requirement - score,
    titleProgressPercent: percent(
      score - current.requirement,
      next.requirement - current.requirement,
    ),
  };
}

const SPEED_UHC_MODES: Readonly<Record<string, string>> = {
  solo: "solo",
  soloNormal: "solo_normal",
  soloInsane: "solo_insane",
  team: "team",
  teamNormal: "team_normal",
  teamInsane: "team_insane",
};

function statValue(
  stats: Readonly<Record<string, number>>,
  key: string,
): number {
  return stats[key] ?? 0;
}

function computeMode(
  modeStats: Readonly<Record<string, number>>,
  suffix: string,
): SpeedUHCModeComputed {
  const kills = statValue(modeStats, `kills_${suffix}`);
  const deaths = statValue(modeStats, `deaths_${suffix}`);
  const wins = statValue(modeStats, `wins_${suffix}`);
  const losses = statValue(modeStats, `losses_${suffix}`);
  return {
    kdr: ratio(kills, deaths),
    killsForNextKdr: neededForNextWholeRatio(kills, deaths),
    wlr: ratio(wins, losses),
    winsForNextWlr: neededForNextWholeRatio(wins, losses),
  };
}

export function computeSpeedUHC(raw: SpeedUHCStats): SpeedUHCComputed {
  const modes: Record<string, SpeedUHCModeComputed> = {};
  for (const [name, suffix] of Object.entries(SPEED_UHC_MODES)) {
    modes[name] = computeMode(raw.modeStats, suffix);
  }
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    wlr: ratio(raw.wins, raw.losses),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, raw.losses),
    arrowAccuracy: ratio(raw.arrowsHit, raw.arrowsShot),
    winRate: ratio(raw.wins, raw.games),
    killsPerGame: perGame(raw.kills, raw.games),
    averageSurvivors: perGame(raw.survivedPlayers, raw.games),
    kadr: ratio(raw.kills + raw.assists, raw.deaths),
    quitRate: ratio(raw.quits, raw.games),
    tearsPerGame: perGame(raw.tearsGathered, raw.games),
    assistShare: percent(raw.assists, raw.kills + raw.assists),
    ...resolveTitle(raw.score),
    modes,
  };
}

