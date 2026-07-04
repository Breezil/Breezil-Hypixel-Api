# Legacy / Classic Games (computed)

Derived Classic Games (legacy lobby) statistics computed from the parsed `LegacyStats` shape. Produced by `computeLegacy(raw: LegacyStats): LegacyComputed` in `src/computed/modes/legacy.ts`.

The tracked per-game token counters are a fixed set of six games:

| Key           | Raw counter             |
| ------------- | ----------------------- |
| `arena`       | `raw.arenaTokens`       |
| `gingerbread` | `raw.gingerbreadTokens` |
| `paintball`   | `raw.paintballTokens`   |
| `quakecraft`  | `raw.quakecraftTokens`  |
| `vampirez`    | `raw.vampirezTokens`    |
| `walls`       | `raw.wallsTokens`       |

Conventions used on this page:

- `*Shares` values are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).
- Timestamps are ISO 8601 strings; day counts are rounded to 2 decimals.

## `LegacyComputed`

```ts
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
```

| Field                    | Formula / meaning                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `totalGameTokensEarned`  | Sum of the six per-game token counters listed above.                                                                                                                  |
| `untrackedTokens`        | Tokens on the account that are not attributable to the six tracked games: `max(0, raw.totalTokens - totalGameTokensEarned)`.                                          |
| `favoriteLegacyGame`     | Key of the game with the most tokens (strictly greatest; on a tie the earlier game in the table above wins). `null` when every counter is `0`.                        |
| `legacyGameTokenShares`  | Per-game percentage (0 to 100) of `totalGameTokensEarned`: `percent(gameTokens, totalGameTokensEarned)` for each of the six keys. All six keys are always present.    |
| `legacyGamesPlayedCount` | Number of the six tracked games with a token count greater than `0`.                                                                                                  |
| `leaderboardAppearances` | Sum of the six raw leaderboard counters: `leaderboardArena + leaderboardPaintball + leaderboardQuakecraft + leaderboardTkr + leaderboardVampirez + leaderboardWalls`. |
| `lastTokenReceivedDate`  | ISO 8601 string of `raw.tokensLastReceivedStamp`, or `null` when the stamp is not positive.                                                                           |
| `daysSinceLastToken`     | Days elapsed since the last token: `(now - tokensLastReceivedStamp) / 86_400_000`, rounded to 2 decimals; `null` when the stamp is not positive.                      |
| `nextTokensReadyAt`      | ISO 8601 string of when the next tokens become available: `new Date(now + raw.nextTokensSeconds * 1000)`. Always a string (never `null`).                             |
| `ownsRollManager`        | Whether `raw.packages` includes the `"usednewrollmanager"` package.                                                                                                   |

## `computeLegacy`

```ts
export function computeLegacy(raw: LegacyStats): LegacyComputed;
```

Takes the parsed `LegacyStats` from `@breezil/hypixel-parsers` and returns the computed block above. The two `now`-relative fields (`daysSinceLastToken`, `nextTokensReadyAt`) are evaluated against `Date.now()` at call time.

