import type { BuildBattleStats } from "@breezil/hypixel-parsers";

import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { percent, perGame, ratio } from "../shared/ratio";
import { argMax } from "../shared/aggregate";

const BUILD_BATTLE_TITLE_REQUIREMENTS = [
  { title: "Rookie", requirement: 0 },
  { title: "Untrained", requirement: 100 },
  { title: "Amatuer", requirement: 250 },
  { title: "Prospect", requirement: 550 },
  { title: "Apprentice", requirement: 1000 },
  { title: "Experienced", requirement: 2000 },
  { title: "Seasoned", requirement: 3500 },
  { title: "Trained", requirement: 5000 },
  { title: "Skilled", requirement: 7500 },
  { title: "Talented", requirement: 10000 },
  { title: "Professional", requirement: 15000 },
  { title: "Artisan", requirement: 20000 },
  { title: "Expert", requirement: 30000 },
  { title: "Master", requirement: 50000 },
  { title: "Legend", requirement: 100000 },
  { title: "Grandmaster", requirement: 200000 },
  { title: "Celestial", requirement: 300000 },
  { title: "Divine", requirement: 400000 },
  { title: "Ascended", requirement: 500000 },
] as const;

export type BuildBattleTitle =
  (typeof BUILD_BATTLE_TITLE_REQUIREMENTS)[number]["title"];

export interface BuildBattleModeWinShare {
  readonly soloNormal: number;
  readonly soloPro: number;
  readonly teamsNormal: number;
  readonly speedBuilders: number;
  readonly guessTheBuild: number;
  readonly halloween: number;
}

export interface BuildBattleComputed {
  readonly winRate: number;
  readonly votesPerGame: number;
  readonly superVoteShare: number;
  readonly correctGuessesPerGame: number;
  readonly firstGuessShare: number;
  readonly scorePerWin: number;
  readonly scorePerGame: number;
  readonly seasonalWinShare: number;
  readonly modeWinShare: BuildBattleModeWinShare;
  readonly title: BuildBattleTitle;
  readonly progressToNextTitle: number;
  readonly titleProgressPercent: number;
  readonly monthlyTokens: number;
  readonly weeklyTokens: number;
  readonly mostVotedTheme: string | null;
  readonly mostWonBackdrop: string | null;
}

interface TitleProgression {
  readonly title: BuildBattleTitle;
  readonly progressToNextTitle: number;
  readonly titleProgressPercent: number;
}

function resolveTitle(score: number): TitleProgression {
  let current: (typeof BUILD_BATTLE_TITLE_REQUIREMENTS)[number] =
    BUILD_BATTLE_TITLE_REQUIREMENTS[0];
  let next: (typeof BUILD_BATTLE_TITLE_REQUIREMENTS)[number] | null = null;
  for (const entry of BUILD_BATTLE_TITLE_REQUIREMENTS) {
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
      progressToNextTitle: 0,
      titleProgressPercent: 100,
    };
  }
  return {
    title: current.title,
    progressToNextTitle: next.requirement - score,
    titleProgressPercent: percent(
      score - current.requirement,
      next.requirement - current.requirement,
    ),
  };
}

export function computeBuildBattle(raw: BuildBattleStats): BuildBattleComputed {
  const progression = resolveTitle(raw.score);
  const now = new Date();
  return {
    winRate: ratio(raw.wins, raw.gamesPlayed),
    votesPerGame: perGame(raw.totalVotes, raw.gamesPlayed),
    superVoteShare: percent(raw.superVotes, raw.totalVotes),
    correctGuessesPerGame: perGame(raw.correctGuesses, raw.gamesPlayed),
    firstGuessShare: percent(raw.firstGuesses, raw.correctGuesses),
    scorePerWin: ratio(raw.score, raw.wins),
    scorePerGame: perGame(raw.score, raw.gamesPlayed),
    seasonalWinShare: percent(raw.seasonalWins, raw.wins),
    modeWinShare: {
      soloNormal: percent(raw.winsSoloNormal, raw.wins),
      soloPro: percent(raw.winsSoloPro, raw.wins),
      teamsNormal: percent(raw.winsTeamsNormal, raw.wins),
      speedBuilders: percent(raw.winsSpeedBuilders, raw.wins),
      guessTheBuild: percent(raw.winsGuessTheBuild, raw.wins),
      halloween: percent(raw.winsHalloween, raw.wins),
    },
    title: progression.title,
    progressToNextTitle: progression.progressToNextTitle,
    titleProgressPercent: progression.titleProgressPercent,
    monthlyTokens: monthlyValue(
      raw.monthlyCoins.coinsA,
      raw.monthlyCoins.coinsB,
      now,
    ),
    weeklyTokens: weeklyValue(
      raw.weeklyCoins.coinsA,
      raw.weeklyCoins.coinsB,
      now,
    ),
    mostVotedTheme: argMax(raw.votesByTheme, 0),
    mostWonBackdrop: argMax(raw.backdropWins, 0),
  };
}

