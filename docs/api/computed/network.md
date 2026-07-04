# Network (computed)

Derived network-wide statistics computed from the parsed static network shapes: game counts, boosters, recent games, leaderboards, and Watchdog. Sources: `src/computed/network/game-counts.ts`, `booster.ts`, `recent-game.ts`, `leaderboards.ts`, and `watchdog.ts`.

Conventions used on this page (from the shared ratio helpers):

- Ratios are bare numbers rounded to 2 decimals. A zero denominator yields the numerator (so `ratio(x, 0)` is `x`).
- `*Share`, `*SharePercent`, and `*Percent` fields are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).
- "Top"/"most" fields use an arg-max over counts; a floor of `0` means the winner must have a strictly positive count, otherwise the field is `null`. Ties keep the first entry encountered.

Several fields reference the shared `GameInfo` shape from `src/computed/shared/games.ts`:

```ts
export interface GameInfo {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}
```

| Field  | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| `id`   | Hypixel numeric game type id (for example `58` for Bed Wars). |
| `code` | Hypixel game type code (for example `"BEDWARS"`).             |
| `name` | Human-readable game name (for example `"Bed Wars"`).          |

Lookups fall back gracefully: an unknown numeric id yields `{ id, code: "UNKNOWN", name: "Unknown" }`; an unknown code yields `{ id: 0, code, name: code }`.

## Game counts

### `GameCountsComputed`

Produced by `computeGameCounts(raw: StaticGameCounts): GameCountsComputed`. Computed from the per-game player counts in `raw.games` and the network-wide `raw.playerCount`.

```ts
export interface GameCountsComputed {
  readonly trackedPlayers: number;
  readonly untrackedPlayers: number;
  readonly topGame: string | null;
  readonly perGameShare: Record<string, number>;
  readonly topModeByGame: Record<string, string | null>;
  readonly activeGameCount: number;
}
```

| Field              | Formula / meaning                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trackedPlayers`   | Sum of `game.players` across all entries of `raw.games`.                                                                                                         |
| `untrackedPlayers` | Players counted network-wide but not attributed to any game: `raw.playerCount - trackedPlayers` (can be negative if game totals exceed the network total).       |
| `topGame`          | Game key with the most players. `null` only when every game has non-positive players and no entry beats the default floor. Ties keep the first game encountered. |
| `perGameShare`     | Per-game percentage (0 to 100) of the network player count: `percent(game.players, raw.playerCount)` for every game key.                                         |
| `topModeByGame`    | For each game, the mode key with the highest player count in `game.modes`; `null` when no mode has a count greater than `0`.                                     |
| `activeGameCount`  | Number of games with `players > 0`.                                                                                                                              |

## Boosters

### `BoosterComputed`

Produced by `computeBooster(raw: StaticBooster): BoosterComputed`. The Hypixel API flips a booster's `length` negative once it expires; `originalLength` is the full duration.

```ts
export interface BoosterComputed {
  readonly game: GameInfo;
  readonly isExpired: boolean;
  readonly isActive: boolean;
  readonly isStacked: boolean;
  readonly stackedCount: number;
  readonly consumedLength: number;
  readonly remainingPercent: number;
}
```

| Field              | Formula / meaning                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `game`             | `GameInfo` resolved from the numeric `raw.gameType` id (unknown ids yield the `"UNKNOWN"` fallback).                          |
| `isExpired`        | `raw.length < 0` (the API flips `length` negative on expiry).                                                                 |
| `isActive`         | Currently ticking: `raw.length > 0 && raw.length < raw.originalLength` (a queued booster still at full length is not active). |
| `isStacked`        | When `raw.stacked` is an array: `stacked.length > 0`; otherwise `raw.stacked === true`.                                       |
| `stackedCount`     | Number of stacking players: `raw.stacked.length` when it is an array, else `0`.                                               |
| `consumedLength`   | Duration already consumed: `raw.originalLength - max(raw.length, 0)` (an expired booster is fully consumed).                  |
| `remainingPercent` | Percentage (0 to 100) of the booster remaining: `percent(max(raw.length, 0), raw.originalLength)`.                            |

## Recent games

### `RecentGameComputed`

Produced by `computeRecentGame(raw: RecentGame): RecentGameComputed` for a single recent game entry.

```ts
export interface RecentGameComputed {
  readonly game: GameInfo | null;
  readonly ongoing: boolean;
  readonly durationMs: number | null;
  readonly startedAgoMs: number | null;
}
```

| Field          | Formula / meaning                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `game`         | `GameInfo` resolved from the `raw.gameType` code, or `null` when the code is the empty string. Unknown non-empty codes yield the code-echo fallback. |
| `ongoing`      | `raw.endedAt === null`: the session has no recorded end.                                                                                             |
| `durationMs`   | `endedAt - startedAt` in milliseconds when both timestamps exist; otherwise `null` (so ongoing games have `null` duration).                          |
| `startedAgoMs` | `Date.now() - startedAt` in milliseconds, or `null` when `startedAt` is `null`.                                                                      |

### `RecentGamesSummaryComputed`

Produced by `computeRecentGamesSummary(games: readonly RecentGame[]): RecentGamesSummaryComputed` over a list of recent games.

```ts
export interface RecentGamesSummaryComputed {
  readonly gameCount: number;
  readonly ongoingCount: number;
  readonly mostPlayedGameType: string | null;
  readonly mostPlayedMode: string | null;
  readonly uniqueMapCount: number;
  readonly totalDurationMs: number;
  readonly averageDurationMs: number;
}
```

| Field                | Formula / meaning                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gameCount`          | `games.length`.                                                                                                                                                                 |
| `ongoingCount`       | Number of entries with `endedAt === null`.                                                                                                                                      |
| `mostPlayedGameType` | Game type code appearing most often across the list (entries with `null` or empty game type are skipped); `null` when nothing qualifies.                                        |
| `mostPlayedMode`     | Mode string appearing most often (same skipping rule); `null` when nothing qualifies.                                                                                           |
| `uniqueMapCount`     | Number of distinct non-`null` `map` values.                                                                                                                                     |
| `totalDurationMs`    | Sum of `durationMs` over entries where it is not `null` (ongoing or timestamp-less games are excluded).                                                                         |
| `averageDurationMs`  | `totalDurationMs / finishedCount` as a bare ratio, where `finishedCount` is the number of entries with a non-`null` duration (equals `totalDurationMs` when that count is `0`). |

## Leaderboards

### `LeaderboardPosition`

The in-lobby coordinates of a physical leaderboard sign, parsed from the raw `location` string (`"x,y,z"`).

```ts
export interface LeaderboardPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
```

| Field | Meaning                                                       |
| ----- | ------------------------------------------------------------- |
| `x`   | X coordinate parsed from the first comma-separated component. |
| `y`   | Y coordinate parsed from the second component.                |
| `z`   | Z coordinate parsed from the third component.                 |

Parsing returns `null` when the string does not split into exactly three numeric parts.

### `LeaderboardComputed`

Produced by `computeLeaderboard(raw: StaticLeaderboard, game: string, boardIndex: number): LeaderboardComputed` for a single board.

```ts
export interface LeaderboardComputed {
  readonly game: string;
  readonly boardIndex: number;
  readonly playerCount: number;
  readonly hasLeaders: boolean;
  readonly position: LeaderboardPosition | null;
}
```

| Field         | Formula / meaning                                                                             |
| ------------- | --------------------------------------------------------------------------------------------- |
| `game`        | The game key this board belongs to (passed through from the caller).                          |
| `boardIndex`  | The board's index within its game's board list (passed through from the caller).              |
| `playerCount` | `raw.leaders.length`: number of leader entries on the board.                                  |
| `hasLeaders`  | `raw.leaders.length > 0`.                                                                     |
| `position`    | Parsed sign coordinates from `raw.location`, or `null` when the location string is malformed. |

### `LeaderboardsComputed`

Produced by `computeLeaderboards(raw: Readonly<Record<string, readonly StaticLeaderboard[]>>): LeaderboardsComputed` over the full game-keyed leaderboard map.

```ts
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
```

| Field                          | Formula / meaning                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gameCount`                    | Number of game keys in the map.                                                                                                                                                |
| `boardCount`                   | Total number of boards across all games.                                                                                                                                       |
| `emptyBoardCount`              | Number of boards with zero leaders.                                                                                                                                            |
| `boardsPerGame`                | Board count per game key.                                                                                                                                                      |
| `averageBoardsPerGame`         | `boardCount / gameCount` as a bare ratio (equals `boardCount` when there are no games).                                                                                        |
| `totalLeaderEntries`           | Sum of `leaders.length` over every board (duplicate UUIDs on one board each count).                                                                                            |
| `uniquePlayerCount`            | Number of distinct player UUIDs appearing on at least one board.                                                                                                               |
| `mostFeaturedPlayerUuid`       | UUID appearing on the most boards. Appearances are counted per board with duplicates on the same board deduplicated first. `null` when nobody appears on more than `0` boards. |
| `mostFeaturedPlayerBoardCount` | Board-appearance count of that player, or `0` when `mostFeaturedPlayerUuid` is `null`.                                                                                         |
| `largestGame`                  | Game key with the most boards; `null` when no game has more than `0` boards.                                                                                                   |

## Watchdog

### `WatchdogComputed`

Produced by `computeWatchdog(raw: StaticWatchdogStats): WatchdogComputed`. Splits total and daily ban counts between the automated Watchdog system and human staff.

```ts
export interface WatchdogComputed {
  readonly totalBans: number;
  readonly dailyBans: number;
  readonly watchdogTotalSharePercent: number;
  readonly staffTotalSharePercent: number;
  readonly watchdogDailySharePercent: number;
  readonly staffDailySharePercent: number;
  readonly staffToWatchdogRatio: number;
  readonly staffToWatchdogDailyRatio: number;
  readonly watchdogBansPerMinute: number;
  readonly staffBansPerMinute: number;
  readonly projectedWatchdogDaily: number;
}
```

| Field                       | Formula / meaning                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `totalBans`                 | `raw.watchdogTotal + raw.staffTotal`: all-time bans from both sources.                           |
| `dailyBans`                 | `raw.watchdogDaily + raw.staffDaily`: bans in the current day window.                            |
| `watchdogTotalSharePercent` | Percentage (0 to 100) of all-time bans issued by Watchdog: `percent(watchdogTotal, totalBans)`.  |
| `staffTotalSharePercent`    | Percentage (0 to 100) of all-time bans issued by staff: `percent(staffTotal, totalBans)`.        |
| `watchdogDailySharePercent` | Percentage (0 to 100) of today's bans issued by Watchdog: `percent(watchdogDaily, dailyBans)`.   |
| `staffDailySharePercent`    | Percentage (0 to 100) of today's bans issued by staff: `percent(staffDaily, dailyBans)`.         |
| `staffToWatchdogRatio`      | Staff bans per Watchdog ban, all-time, as a bare ratio: `staffTotal / watchdogTotal`.            |
| `staffToWatchdogDailyRatio` | Staff bans per Watchdog ban today, as a bare ratio: `staffDaily / watchdogDaily`.                |
| `watchdogBansPerMinute`     | Average Watchdog bans per minute today: `watchdogDaily / 1440`.                                  |
| `staffBansPerMinute`        | Average staff bans per minute today: `staffDaily / 1440`.                                        |
| `projectedWatchdogDaily`    | Naive daily projection from the last-minute rate: `raw.watchdogLastMinute * 1440` (not rounded). |

