import { type RecentGame } from "@breezil/hypixel-parsers";

import { gameByCode, type GameInfo } from "../shared/games";
import { argMax } from "../shared/aggregate";
import { ratio } from "../shared/ratio";

export interface RecentGameComputed {
  readonly game: GameInfo | null;
  readonly ongoing: boolean;
  readonly durationMs: number | null;
  readonly startedAgoMs: number | null;
}

export interface RecentGamesSummaryComputed {
  readonly gameCount: number;
  readonly ongoingCount: number;
  readonly mostPlayedGameType: string | null;
  readonly mostPlayedMode: string | null;
  readonly uniqueMapCount: number;
  readonly totalDurationMs: number;
  readonly averageDurationMs: number;
}

export function computeRecentGame(raw: RecentGame): RecentGameComputed {
  const ongoing = raw.endedAt === null;
  const durationMs =
    raw.startedAt !== null && raw.endedAt !== null
      ? raw.endedAt.getTime() - raw.startedAt.getTime()
      : null;
  return {
    game: raw.gameType === "" ? null : gameByCode(raw.gameType),
    ongoing,
    durationMs,
    startedAgoMs:
      raw.startedAt === null ? null : Date.now() - raw.startedAt.getTime(),
  };
}

function countBy(values: readonly (string | null)[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    if (value !== null && value !== "") {
      counts[value] = (counts[value] ?? 0) + 1;
    }
  }
  return counts;
}

export function computeRecentGamesSummary(
  games: readonly RecentGame[],
): RecentGamesSummaryComputed {
  const durations = games
    .map((game) => computeRecentGame(game).durationMs)
    .filter((duration): duration is number => duration !== null);
  const totalDurationMs = durations.reduce((sum, value) => sum + value, 0);
  return {
    gameCount: games.length,
    ongoingCount: games.filter((game) => game.endedAt === null).length,
    mostPlayedGameType: argMax(countBy(games.map((game) => game.gameType))),
    mostPlayedMode: argMax(countBy(games.map((game) => game.mode))),
    uniqueMapCount: new Set(
      games.map((game) => game.map).filter((map) => map !== null),
    ).size,
    totalDurationMs,
    averageDurationMs: ratio(totalDurationMs, durations.length),
  };
}

