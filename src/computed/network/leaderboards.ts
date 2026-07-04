import { type StaticLeaderboard } from "@breezil/hypixel-parsers";

import { argMax, sum } from "../shared/aggregate";
import { ratio } from "../shared/ratio";

export interface LeaderboardPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface LeaderboardComputed {
  readonly game: string;
  readonly boardIndex: number;
  readonly playerCount: number;
  readonly hasLeaders: boolean;
  readonly position: LeaderboardPosition | null;
}

export interface LeaderboardsComputed {
  readonly gameCount: number;
  readonly boardCount: number;
  readonly emptyBoardCount: number;
  readonly boardsPerGame: Record<string, number>;
  readonly averageBoardsPerGame: number;
  readonly totalLeaderEntries: number;
  readonly uniquePlayerCount: number;
  readonly mostFeaturedPlayerUuid: string | null;
  readonly mostFeaturedPlayerBoardCount: number;
  readonly largestGame: string | null;
}

function parsePosition(location: string): LeaderboardPosition | null {
  const parts = location.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  const [x, y, z] = parts;
  return { x, y, z };
}

export function computeLeaderboard(
  raw: StaticLeaderboard,
  game: string,
  boardIndex: number,
): LeaderboardComputed {
  return {
    game,
    boardIndex,
    playerCount: raw.leaders.length,
    hasLeaders: raw.leaders.length > 0,
    position: parsePosition(raw.location),
  };
}

export function computeLeaderboards(
  raw: Readonly<Record<string, readonly StaticLeaderboard[]>>,
): LeaderboardsComputed {
  const games = Object.entries(raw);
  const boards = games.flatMap(([, list]) => list);
  const boardsPerGame: Record<string, number> = {};
  for (const [game, list] of games) {
    boardsPerGame[game] = list.length;
  }
  const boardAppearances: Record<string, number> = {};
  for (const board of boards) {
    for (const leader of new Set(board.leaders)) {
      boardAppearances[leader] = (boardAppearances[leader] ?? 0) + 1;
    }
  }
  const mostFeatured = argMax(boardAppearances, 0);
  return {
    gameCount: games.length,
    boardCount: boards.length,
    emptyBoardCount: boards.filter((board) => board.leaders.length === 0)
      .length,
    boardsPerGame,
    averageBoardsPerGame: ratio(boards.length, games.length),
    totalLeaderEntries: sum(boards.map((board) => board.leaders.length)),
    uniquePlayerCount: Object.keys(boardAppearances).length,
    mostFeaturedPlayerUuid: mostFeatured,
    mostFeaturedPlayerBoardCount:
      mostFeatured === null ? 0 : boardAppearances[mostFeatured],
    largestGame: argMax(boardsPerGame, 0),
  };
}

