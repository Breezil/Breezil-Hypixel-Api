# Network endpoints

The `NetworkEndpoints` group (available as `client.network`) wraps the network-wide Hypixel
endpoints: active boosters, live player counts, leaderboards, and Watchdog punishment
statistics. It is defined in `src/endpoints/network-endpoints.ts` and extends the plain
`EndpointGroup` (no UUID resolver: none of these endpoints take a player identifier).

All methods are `async`, take no parameters, and return `null` instead of throwing when the
request fails (no API key, rate limited, upstream error).

## `boosters()`

Fetches the active network coin boosters together with the global booster state.

```ts
boosters(): Promise<BoosterFeed | null>
```

**Endpoint:** `GET /boosters` (Hypixel API v2)

**Returns:** `BoosterFeed | null`

The whole success envelope is passed to a composing parser: the `boosters` array is
extracted with `pickArray`, parsed with `parseBoosters`, enriched with `enrichBoosters`,
and the sibling `boosterState` object is parsed with `parseBoosterState`.

Each element of `boosters` is the parser's `Booster` type (see the
[network raw types](/api/raw/static-housing)) plus a `.computed`
block of type `BoosterComputed` (see the [network computed page](/api/computed/network)).

**Null semantics:** `null` when the request fails or the envelope's `boosters` key is
missing or not an array.

### `BoosterFeed`

Defined in `src/endpoints/network-endpoints.ts`:

```ts
interface BoosterFeed {
  readonly boosterState: BoosterState;
  readonly boosters: EnrichedBooster[];
}
```

| Field          | Type                | Description                                       |
| -------------- | ------------------- | ------------------------------------------------- |
| `boosterState` | `BoosterState`      | Global booster queue state from the envelope      |
| `boosters`     | `EnrichedBooster[]` | Active and queued boosters, each with `.computed` |

### `BoosterState`

Defined in `src/endpoints/envelope.ts` and parsed from the envelope's `boosterState`
object by `parseBoosterState`:

```ts
interface BoosterState {
  readonly decrementing: boolean;
}
```

| Field          | Type      | Description                                                       |
| -------------- | --------- | ----------------------------------------------------------------- |
| `decrementing` | `boolean` | Whether booster durations are currently ticking down network-wide |

## `counts()`

Fetches live per-game and total player counts.

```ts
counts(): Promise<EnrichedGameCounts | null>
```

**Endpoint:** `GET /counts`

**Returns:** `EnrichedGameCounts | null`

The whole envelope is parsed with `parseGameCounts` and enriched with `enrichGameCounts`.
`EnrichedGameCounts` is the parser's `GameCounts` type plus a `.computed` block of type
`GameCountsComputed` (see the [network computed page](/api/computed/network)). The
underlying fields are documented in the
[network raw types](/api/raw/static-housing).

**Null semantics:** `null` only when the request itself fails; the parser receives the full
envelope, so there is no extraction step that can miss.

## `leaderboards()`

Fetches every network leaderboard, keyed by game.

```ts
leaderboards(): Promise<EnrichedLeaderboards | null>
```

**Endpoint:** `GET /leaderboards`

**Returns:** `EnrichedLeaderboards | null`

The whole envelope is parsed with `parseLeaderboards` and enriched with
`enrichLeaderboards`. Unlike most enriched types, `EnrichedLeaderboards` is a wrapper
rather than the parser type plus `.computed`:

```ts
interface EnrichedLeaderboards {
  readonly games: Record<string, readonly EnrichedLeaderboard[]>;
  readonly computed: LeaderboardsComputed;
}
```

Each `EnrichedLeaderboard` is the parser's `Leaderboard` type plus its own `.computed`
block (`LeaderboardComputed`), and the top-level `.computed` block aggregates across all
boards. Both computed shapes are documented on the
[network computed page](/api/computed/network); the raw leaderboard fields are in the
[network raw types](/api/raw/static-housing).

**Null semantics:** `null` only when the request itself fails.

## `watchdog()`

Fetches Watchdog and staff punishment statistics.

```ts
watchdog(): Promise<EnrichedWatchdogStats | null>
```

**Endpoint:** `GET /punishmentstats`

**Returns:** `EnrichedWatchdogStats | null`

The whole envelope is parsed with `parseWatchdogStats` and enriched with
`enrichWatchdogStats`. `EnrichedWatchdogStats` is the parser's `WatchdogStats` type plus a
`.computed` block of type `WatchdogComputed` (see the
[network computed page](/api/computed/network)).

**Null semantics:** `null` only when the request itself fails.

## `Timestamped<T>`

Some endpoints elsewhere in this package (resource and a few SkyBlock methods) wrap their
value in `Timestamped<T>`, defined in `src/endpoints/envelope.ts`:

```ts
interface Timestamped<T> {
  readonly lastUpdatedAt: Date | null;
  readonly value: T;
}
```

| Field           | Type           | Description                                                                   |
| --------------- | -------------- | ----------------------------------------------------------------------------- |
| `lastUpdatedAt` | `Date \| null` | Parsed from the envelope's `lastUpdated` field; `null` when absent or invalid |
| `value`         | `T`            | The parsed payload                                                            |

The wrapper is only produced when the payload itself was successfully extracted; a missing
payload makes the whole method return `null`, never a `Timestamped` with an empty value.

## Summary

| Method           | Endpoint           | Returns                         | `.computed`?                 |
| ---------------- | ------------------ | ------------------------------- | ---------------------------- |
| `boosters()`     | `/boosters`        | `BoosterFeed \| null`           | Yes, on each booster         |
| `counts()`       | `/counts`          | `EnrichedGameCounts \| null`    | Yes                          |
| `leaderboards()` | `/leaderboards`    | `EnrichedLeaderboards \| null`  | Yes, top-level and per-board |
| `watchdog()`     | `/punishmentstats` | `EnrichedWatchdogStats \| null` | Yes                          |

