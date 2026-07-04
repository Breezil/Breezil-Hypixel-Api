# Player endpoints

The `PlayerEndpoints` group (available as `client.player`) wraps the Hypixel player-centric
endpoints: the full player object, the raw unparsed payload, session status, and recent games.
It is defined in `src/endpoints/player-endpoints.ts` and extends `ResolvingEndpointGroup`,
so every method here accepts an `idOrName` and resolves it to a UUID before calling Hypixel.

All methods are `async` and return `null` instead of throwing when something is missing or fails.

## Identifier resolution

Every method takes an `idOrName: string`. Resolution works as follows (see `resolveUuid` in
`src/resolver.ts`):

1. The input is trimmed and dashes are removed.
2. If the result is 32 hex characters, it is treated as a UUID directly (lowercased, undashed).
   No network call is made to resolve it.
3. Otherwise the input is treated as an IGN and resolved through the injected
   `HypixelUuidResolver` (by default the Mojang-backed resolver with an in-memory cache).
4. If resolution yields `null` (unknown name, resolver error), the method returns `null`
   without ever hitting the Hypixel API.

## `get(idOrName)`

Fetches and parses the full player object, then attaches computed stats.

```ts
get(idOrName: string): Promise<EnrichedPlayer | null>
```

**Parameters**

| Name       | Type     | Description                                                          |
| ---------- | -------- | -------------------------------------------------------------------- |
| `idOrName` | `string` | Player UUID (dashed or undashed) or IGN, resolved as described above |

**Endpoint:** `GET /player?uuid=<uuid>` (Hypixel API v2)

**Returns:** `EnrichedPlayer | null`

`EnrichedPlayer` is the parser's `HypixelPlayer` (see the
[player raw type](/api/raw/player)) with two changes:

- a top-level `.computed` block of type `PlayerComputed` (network level, ranks, and other
  derived values, documented on the [player computed page](/api/computed/player))
- `stats` replaced by `EnrichedPlayerStats`, where each per-game stats object
  (`bedwars`, `skywars`, `duels`, and the rest) carries its own `.computed` block
  (or is `null` when the player has no stats for that game)

**Null semantics:** returns `null` when the identifier cannot be resolved, the request fails
(no API key, rate limited, upstream error), or the response's `player` key is missing or not
an object (player never joined Hypixel). The raw `player` object is extracted from the
success envelope via `pickObject(res, "player")` before parsing.

## `raw(idOrName)`

Fetches the raw, unparsed player object. Useful when you need fields the parser does not
expose.

```ts
raw(idOrName: string): Promise<Record<string, unknown> | null>
```

**Parameters**

| Name       | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `idOrName` | `string` | Player UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /player?uuid=<uuid>`

**Returns:** `Record<string, unknown> | null`

The `player` object exactly as Hypixel returned it. No parsing, no enrichment, and no
`.computed` block.

**Null semantics:** `null` when resolution fails, the request fails, or the `player` key is
missing or not an object.

## `status(idOrName)`

Fetches the player's current session status (online state, game, mode, map).

```ts
status(idOrName: string): Promise<PlayerStatus | null>
```

**Parameters**

| Name       | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `idOrName` | `string` | Player UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /status?uuid=<uuid>`

**Returns:** `PlayerStatus | null`

`PlayerStatus` is a raw parser type from `@breezil/hypixel-parsers` with no `.computed`
block. See the [status raw type](/api/raw/guild-status) for its
fields. The `session` object is extracted from the envelope before parsing with
`parseStatus`.

**Null semantics:** `null` when resolution fails, the request fails, or the `session` key is
missing or not an object.

## `recentGames(idOrName)`

Fetches the player's recent games (Hypixel keeps roughly the last 100, and only if the
player has not hidden them).

```ts
recentGames(idOrName: string): Promise<EnrichedRecentGame[] | null>
```

**Parameters**

| Name       | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `idOrName` | `string` | Player UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /recentgames?uuid=<uuid>`

**Returns:** `EnrichedRecentGame[] | null`

Each element is the parser's `RecentGame` plus a `.computed` block of type
`RecentGameComputed` (see the [computed pages](/api/computed/player)). The `games` array is
extracted from the envelope, parsed with `parseRecentGames`, then enriched with
`enrichRecentGames`. An empty array is a valid result (the key was present but empty).

**Null semantics:** `null` when resolution fails, the request fails, or the `games` key is
missing or not an array.

## Summary

| Method                  | Endpoint       | Returns                           | `.computed`?         |
| ----------------------- | -------------- | --------------------------------- | -------------------- |
| `get(idOrName)`         | `/player`      | `EnrichedPlayer \| null`          | Yes, plus per-game   |
| `raw(idOrName)`         | `/player`      | `Record<string, unknown> \| null` | No (raw payload)     |
| `status(idOrName)`      | `/status`      | `PlayerStatus \| null`            | No (parser type)     |
| `recentGames(idOrName)` | `/recentgames` | `EnrichedRecentGame[] \| null`    | Yes, on each element |

