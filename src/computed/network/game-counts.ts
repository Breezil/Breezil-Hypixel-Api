import { type StaticGameCounts } from "@breezil/hypixel-parsers";

import { argMax, sum } from "../shared/aggregate";
import { percent } from "../shared/ratio";

export interface GameCountsComputed {
  readonly trackedPlayers: number;
  readonly untrackedPlayers: number;
  readonly topGame: string | null;
  readonly perGameShare: Record<string, number>;
  readonly topModeByGame: Record<string, string | null>;
  readonly activeGameCount: number;
}

export function computeGameCounts(raw: StaticGameCounts): GameCountsComputed {
  const games = Object.entries(raw.games);
  const trackedPlayers = sum(games.map(([, game]) => game.players));
  const perGameShare: Record<string, number> = {};
  const topModeByGame: Record<string, string | null> = {};
  for (const [name, game] of games) {
    perGameShare[name] = percent(game.players, raw.playerCount);
    topModeByGame[name] = argMax(game.modes, 0);
  }
  return {
    trackedPlayers,
    untrackedPlayers: raw.playerCount - trackedPlayers,
    topGame: argMax(games.map(([name, game]) => [name, game.players] as const)),
    perGameShare,
    topModeByGame,
    activeGameCount: games.filter(([, game]) => game.players > 0).length,
  };
}

