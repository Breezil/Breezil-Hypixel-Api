import type { LegacyStats } from "@breezil/hypixel-parsers";

import { percent, round2 } from "../shared/ratio";
import { DAY_MS } from "../shared/time";

const GAME_TOKENS: readonly (readonly [
  string,
  (raw: LegacyStats) => number,
])[] = [
  ["arena", (raw) => raw.arenaTokens],
  ["gingerbread", (raw) => raw.gingerbreadTokens],
  ["paintball", (raw) => raw.paintballTokens],
  ["quakecraft", (raw) => raw.quakecraftTokens],
  ["vampirez", (raw) => raw.vampirezTokens],
  ["walls", (raw) => raw.wallsTokens],
];

export interface LegacyComputed {
  readonly totalGameTokensEarned: number;
  readonly untrackedTokens: number;
  readonly favoriteLegacyGame: string | null;
  readonly legacyGameTokenShares: Readonly<Record<string, number>>;
  readonly legacyGamesPlayedCount: number;
  readonly leaderboardAppearances: number;
  readonly lastTokenReceivedDate: string | null;
  readonly daysSinceLastToken: number | null;
  readonly nextTokensReadyAt: string;
  readonly ownsRollManager: boolean;
}

export function computeLegacy(raw: LegacyStats): LegacyComputed {
  const totalGameTokensEarned = GAME_TOKENS.reduce(
    (sum, [, read]) => sum + read(raw),
    0,
  );

  let favoriteLegacyGame: string | null = null;
  let favoriteTokens = 0;
  const legacyGameTokenShares: Record<string, number> = {};
  let legacyGamesPlayedCount = 0;
  for (const [game, read] of GAME_TOKENS) {
    const tokens = read(raw);
    legacyGameTokenShares[game] = percent(tokens, totalGameTokensEarned);
    if (tokens > 0) {
      legacyGamesPlayedCount += 1;
    }
    if (tokens > favoriteTokens) {
      favoriteTokens = tokens;
      favoriteLegacyGame = game;
    }
  }

  const leaderboardAppearances =
    raw.leaderboardArena +
    raw.leaderboardPaintball +
    raw.leaderboardQuakecraft +
    raw.leaderboardTkr +
    raw.leaderboardVampirez +
    raw.leaderboardWalls;

  const stamp = raw.tokensLastReceivedStamp;
  const lastTokenReceivedDate =
    stamp > 0 ? new Date(stamp).toISOString() : null;
  const daysSinceLastToken =
    stamp > 0 ? round2((Date.now() - stamp) / DAY_MS) : null;

  return {
    totalGameTokensEarned,
    untrackedTokens: Math.max(0, raw.totalTokens - totalGameTokensEarned),
    favoriteLegacyGame,
    legacyGameTokenShares,
    legacyGamesPlayedCount,
    leaderboardAppearances,
    lastTokenReceivedDate,
    daysSinceLastToken,
    nextTokensReadyAt: new Date(
      Date.now() + raw.nextTokensSeconds * 1000,
    ).toISOString(),
    ownsRollManager: raw.packages.includes("usednewrollmanager"),
  };
}

