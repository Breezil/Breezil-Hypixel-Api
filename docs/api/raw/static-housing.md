# Static & Housing

The static module exposes parsers for Hypixel's network-wide endpoints (`/boosters`, `/leaderboards`, `/counts`, `/punishmentstats`), and the housing module parses the `/housing/*` endpoints. Each parser mirrors the raw JSON field-for-field into readonly, fully-typed objects with no computation and no derived totals. Across all parsers the safe readers apply: missing or non-number values become `0`, missing or non-string values become `""`, boolean fields are `true` only when the raw value is exactly `true`, missing nested objects are treated as empty objects, and `Date | null` fields are `null` unless the raw value is a positive epoch-ms number.

## parseBoosters

Parses the network boosters (`/boosters`) into an array of typed objects.

```ts
function parseBoosters(boosters: unknown[]): StaticBooster[];
```

### Null / empty behavior

Never returns `null`. Iterates the input array, skipping any entry that is not a plain object (`null`, arrays, and non-objects are dropped), so the result may be shorter than the input. Returns `[]` when no valid entries exist.

## parseLeaderboards

Parses the leaderboards (`/leaderboards`) into a typed object keyed by game name.

```ts
function parseLeaderboards(
  raw: Record<string, unknown>,
): Record<string, StaticLeaderboard[]>;
```

### Null / empty behavior

Never returns `null`. Reads the raw `leaderboards` object (empty when absent). Each game whose value is not an array is skipped; within a game, non-object entries are skipped. Returns an empty record when no games qualify.

## parseGameCounts

Parses the player counts (`/counts`) into a typed object.

```ts
function parseGameCounts(raw: Record<string, unknown>): StaticGameCounts;
```

### Null / empty behavior

Never returns `null`. Reads the raw `games` object (empty when absent); each game value that is not a plain object is skipped. Per-game `modes` includes only entries whose count is a number.

## parseWatchdogStats

Parses the punishment stats (`/punishmentstats`) into a typed object.

```ts
function parseWatchdogStats(raw: Record<string, unknown>): StaticWatchdogStats;
```

### Null / empty behavior

Never returns `null`. Always returns a fully-populated `StaticWatchdogStats`; missing numeric fields become `0`.

## parseHouse

Parses a single house (`/housing/house`) into a typed object.

```ts
function parseHouse(raw: Record<string, unknown>): HousingHouse;
```

### Null / empty behavior

Never returns `null`. Always returns a fully-populated `HousingHouse`; `createdAt` is a `Date` or `null`, and the nested `cookies` object is always present.

## parseHouses

Parses a list of houses (`/housing/houses`) into an array of typed objects.

```ts
function parseHouses(houses: unknown[]): HousingHouse[];
```

### Null / empty behavior

Never returns `null`. Iterates the input array, skipping any entry that is not a plain object; each remaining entry is parsed via `parseHouse`. Returns `[]` when no valid entries exist.

---

## Returned type tree

### StaticBooster

The per-entry value returned by `parseBoosters`.

```ts
interface StaticBooster {
  readonly id: string;
  readonly purchaserUuid: string;
  readonly amount: number;
  readonly originalLength: number;
  readonly length: number;
  readonly gameType: number;
  readonly dateActivated: Date | null;
  readonly stacked: boolean | readonly string[];
}
```

| Field            | Notes                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `id`             | Raw `_id`.                                                                                                      |
| `purchaserUuid`  | UUID of the booster purchaser.                                                                                  |
| `amount`         | Booster multiplier amount.                                                                                      |
| `originalLength` | Original duration.                                                                                              |
| `length`         | Remaining duration.                                                                                             |
| `gameType`       | Numeric game type id.                                                                                           |
| `dateActivated`  | Epoch-ms timestamp as `Date`, or `null`.                                                                        |
| `stacked`        | The raw `stacked` array filtered to strings, or `true` when the raw value is exactly `true`; otherwise `false`. |

---

### StaticLeaderboard

The per-entry value in each game's leaderboard list returned by `parseLeaderboards`.

```ts
interface StaticLeaderboard {
  readonly path: string;
  readonly prefix: string;
  readonly title: string;
  readonly location: string;
  readonly count: number;
  readonly leaders: readonly string[];
}
```

| Field     | Notes                                                           |
| --------- | --------------------------------------------------------------- |
| `leaders` | The raw `leaders` array filtered to strings (`[]` when absent). |

---

### StaticGameCounts

The root object returned by `parseGameCounts`.

```ts
interface StaticGameCounts {
  readonly playerCount: number;
  readonly games: Record<string, StaticGameCount>;
}
```

| Field         | Notes                               |
| ------------- | ----------------------------------- |
| `playerCount` | Total network player count.         |
| `games`       | Per-game counts keyed by game name. |

### StaticGameCount

The per-game value within `StaticGameCounts.games`.

```ts
interface StaticGameCount {
  readonly players: number;
  readonly modes: Record<string, number>;
}
```

| Field   | Notes                                                            |
| ------- | ---------------------------------------------------------------- |
| `modes` | Raw `modes` map, including only entries whose count is a number. |

---

### StaticWatchdogStats

The object returned by `parseWatchdogStats`.

```ts
interface StaticWatchdogStats {
  readonly watchdogLastMinute: number;
  readonly watchdogDaily: number;
  readonly watchdogTotal: number;
  readonly staffDaily: number;
  readonly staffTotal: number;
}
```

| Field                | Notes                        |
| -------------------- | ---------------------------- |
| `watchdogLastMinute` | Raw `watchdog_lastMinute`.   |
| `watchdogDaily`      | Raw `watchdog_rollingDaily`. |
| `watchdogTotal`      | Raw `watchdog_total`.        |
| `staffDaily`         | Raw `staff_rollingDaily`.    |
| `staffTotal`         | Raw `staff_total`.           |

---

### HousingHouse

The object returned by `parseHouse` and the per-entry value returned by `parseHouses`.

```ts
interface HousingHouse {
  readonly uuid: string;
  readonly owner: string;
  readonly name: string;
  readonly createdAt: Date | null;
  readonly players: number;
  readonly cookies: HousingCookies;
}
```

| Field       | Notes                                    |
| ----------- | ---------------------------------------- |
| `uuid`      | House UUID.                              |
| `owner`     | Owner UUID.                              |
| `name`      | House name.                              |
| `createdAt` | Epoch-ms timestamp as `Date`, or `null`. |
| `players`   | Current player count.                    |

### HousingCookies

Read from the raw `cookies` object.

```ts
interface HousingCookies {
  readonly current: number;
}
```
