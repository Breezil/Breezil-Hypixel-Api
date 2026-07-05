# Client

The client module exposes `HypixelApiService` (also exported as `HypixelClient`), the entry point of the package. It wires a shared request pipeline (caching, concurrency limiting, rate-limit gating, retries) into six typed endpoint groups, plus an identity API for name/UUID resolution and an external ping service. Configuration is described by `HypixelApiConfig`, `HypixelApiConfigInput`, and `HypixelApiConfigSource` from `src/config.ts`.

```ts
import { HypixelClient } from "@breezil/hypixel-api";

const client = new HypixelClient("your-hypixel-api-key");

const player = await client.player.get("Technoblade");
const guild = await client.guild.byPlayer("Technoblade");
const uuid = await client.identity.uuid("Technoblade");
```

## HypixelApiService

The main client class. `HypixelClient` is an alias for the same class, re-exported from the package root.

```ts
export class HypixelApiService {
  public readonly player: PlayerEndpoints;
  public readonly guild: GuildEndpoints;
  public readonly network: NetworkEndpoints;
  public readonly resources: ResourceEndpoints;
  public readonly skyblock: SkyBlockEndpoints;
  public readonly housing: HousingEndpoints;
  public readonly identity: IdentityApi;

  constructor(
    config: HypixelApiConfigInput,
    resolver?: HypixelUuidResolver,
    now?: () => number,
  );

  public hasApiKey(): boolean;
  public ping(uuid: string): Promise<number | null>;
  public request<T = Record<string, unknown>>(
    endpoint: string,
  ): Promise<T | null>;
  public keys(): KeyDiagnostics[];
  public clearCache(): void;
}
```

### Constructor

```ts
constructor(
  config: HypixelApiConfigInput,
  resolver?: HypixelUuidResolver,
  now: () => number = () => Date.now(),
)
```

| Parameter  | Type                    | Default                  | Description                                                                                                                                                                    |
| ---------- | ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `config`   | `HypixelApiConfigInput` | required                 | API key string, config object, or config source function. Normalized via `toConfigSource` (see [HypixelApiConfigInput](#hypixelapiconfiginput)).                               |
| `resolver` | `HypixelUuidResolver`   | `createMojangResolver()` | Name/UUID resolver used by all endpoint groups that accept `idOrName` and by `identity`. When omitted, a Mojang-backed in-memory resolver with no persistent store is created. |
| `now`      | `() => number`          | `() => Date.now()`       | Clock injection for the request cache and rate-limit gate. Useful for tests.                                                                                                   |

The constructor builds one shared `RequestPipeline` from the config source and hands it (plus the resolver, where applicable) to every endpoint group, so all groups share the same response cache, concurrency limiter, and rate-limit gate.

### Endpoint group properties

Every group method returns `Promise<T | null>`; `null` means the request failed, the API returned `success: false`, the expected payload section was missing, or (for `idOrName` methods) the name could not be resolved to a UUID. Methods taking `idOrName` accept either a Minecraft username or a UUID (dashed or undashed); UUIDs are recognized locally and skip the resolver entirely.

#### `player: PlayerEndpoints`

| Method                  | Returns                                    | Endpoint                                                              |
| ----------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `get(idOrName)`         | `Promise<EnrichedPlayer \| null>`          | `/player`, parsed with `parsePlayer` and enriched with `enrichPlayer` |
| `raw(idOrName)`         | `Promise<Record<string, unknown> \| null>` | `/player`, the untouched `player` object                              |
| `status(idOrName)`      | `Promise<PlayerStatus \| null>`            | `/status`, the `session` object                                       |
| `recentGames(idOrName)` | `Promise<EnrichedRecentGame[] \| null>`    | `/recentgames`, the `games` array                                     |

#### `guild: GuildEndpoints`

| Method               | Returns                          | Endpoint                                               |
| -------------------- | -------------------------------- | ------------------------------------------------------ |
| `byId(id)`           | `Promise<EnrichedGuild \| null>` | `/guild?id=`                                           |
| `byName(name)`       | `Promise<EnrichedGuild \| null>` | `/guild?name=`                                         |
| `byPlayer(idOrName)` | `Promise<EnrichedGuild \| null>` | `/guild?player=`, after resolving `idOrName` to a UUID |

#### `network: NetworkEndpoints`

| Method           | Returns                                  | Endpoint                                                                                          |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `boosters()`     | `Promise<BoosterFeed \| null>`           | `/boosters`; `BoosterFeed` bundles `boosterState: BoosterState` and `boosters: EnrichedBooster[]` |
| `counts()`       | `Promise<EnrichedGameCounts \| null>`    | `/counts`                                                                                         |
| `leaderboards()` | `Promise<EnrichedLeaderboards \| null>`  | `/leaderboards`                                                                                   |
| `watchdog()`     | `Promise<EnrichedWatchdogStats \| null>` | `/punishmentstats`                                                                                |

```ts
export interface BoosterFeed {
  readonly boosterState: BoosterState;
  readonly boosters: EnrichedBooster[];
}
```

#### `resources: ResourceEndpoints`

Resource endpoints do not require player resolution. Several return `Timestamped<T>`, which pairs the payload with the envelope's `lastUpdated` value:

```ts
export interface Timestamped<T> {
  readonly lastUpdatedAt: Date | null;
  readonly value: T;
}
```

| Method                | Returns                                                                      | Endpoint                         |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| `achievements()`      | `Promise<Timestamped<Record<string, AchievementsGame>> \| null>`             | `/resources/achievements`        |
| `challenges()`        | `Promise<Timestamped<Record<string, readonly ResourceChallenge[]>> \| null>` | `/resources/challenges`          |
| `quests()`            | `Promise<Timestamped<Record<string, ResourceQuest[]>> \| null>`              | `/resources/quests`              |
| `guildAchievements()` | `Promise<GuildAchievements \| null>`                                         | `/resources/guilds/achievements` |
| `games()`             | `Promise<Timestamped<Readonly<Record<string, GameDefinition>>> \| null>`     | `/resources/games`               |
| `vanityPets()`        | `Promise<Timestamped<VanityResource> \| null>`                               | `/resources/vanity/pets`         |
| `vanityCompanions()`  | `Promise<Timestamped<VanityResource> \| null>`                               | `/resources/vanity/companions`   |

#### `skyblock: SkyBlockEndpoints`

| Method                  | Returns                                                               | Endpoint                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `profiles(idOrName)`    | `Promise<readonly EnrichedSkyBlockProfile[] \| null>`                 | `/skyblock/profiles?uuid=`                                                                                                    |
| `profile(profileId)`    | `Promise<EnrichedSkyBlockProfile \| null>`                            | `/skyblock/profile?profile=`                                                                                                  |
| `garden(profileId)`     | `Promise<EnrichedGarden \| null>`                                     | `/skyblock/garden?profile=`                                                                                                   |
| `museum(profileId)`     | `Promise<EnrichedMuseum \| null>`                                     | `/skyblock/museum?profile=`                                                                                                   |
| `bazaar()`              | `Promise<Timestamped<Record<string, EnrichedBazaarProduct>> \| null>` | `/skyblock/bazaar`                                                                                                            |
| `auctions(page = 0)`    | `Promise<EnrichedAuctionsPage \| null>`                               | `/skyblock/auctions?page=`                                                                                                    |
| `auction(by, query)`    | `Promise<EnrichedAuction[] \| null>`                                  | `/skyblock/auction`; `by` is `"uuid" \| "player" \| "profile"`. With `by: "player"`, `query` is resolved from name/UUID first |
| `endedAuctions()`       | `Promise<Timestamped<EnrichedEndedAuctions> \| null>`                 | `/skyblock/auctions_ended`                                                                                                    |
| `fireSales()`           | `Promise<EnrichedFireSale[] \| null>`                                 | `/skyblock/firesales`                                                                                                         |
| `news()`                | `Promise<SkyBlockNewsItem[] \| null>`                                 | `/skyblock/news`                                                                                                              |
| `items()`               | `Promise<Timestamped<SkyBlockItem[]> \| null>`                        | `/resources/skyblock/items`                                                                                                   |
| `skills()`              | `Promise<SkyBlockSkillsResource \| null>`                             | `/resources/skyblock/skills`                                                                                                  |
| `collections()`         | `Promise<SkyBlockCollectionsResource \| null>`                        | `/resources/skyblock/collections`                                                                                             |
| `election()`            | `Promise<SkyBlockElectionResource \| null>`                           | `/resources/skyblock/election`                                                                                                |
| `bingo()`               | `Promise<SkyBlockBingoResource \| null>`                              | `/resources/skyblock/bingo`                                                                                                   |
| `playerBingo(idOrName)` | `Promise<readonly PlayerBingoEvent[] \| null>`                        | `/skyblock/bingo?uuid=`                                                                                                       |

#### `housing: HousingEndpoints`

| Method                | Returns                           | Endpoint                                              |
| --------------------- | --------------------------------- | ----------------------------------------------------- |
| `active()`            | `Promise<HousingHouse[] \| null>` | `/housing/active`                                     |
| `get(houseId)`        | `Promise<HousingHouse \| null>`   | `/housing/house?house=`                               |
| `forPlayer(idOrName)` | `Promise<HousingHouse[] \| null>` | `/housing/houses?player=`, after resolving `idOrName` |

#### `identity: IdentityApi`

A thin wrapper over the resolver the client was constructed with. See [IdentityApi](#identityapi).

### hasApiKey

```ts
public hasApiKey(): boolean;
```

Returns `true` when the current config source yields a non-empty (after `trim()`) `apiKey`. Because the config can be a live function, this reflects the key at call time.

### ping

```ts
public ping(uuid: string): Promise<number | null>;
```

Queries the external Bordic ping service (`https://bordic.xyz/api/v2/resources/ping`) for the player's average ping and returns it rounded to the nearest integer. Returns `null` when `pingApiKey` is empty (after `trim()`), the request fails, `success` is falsy, or the `data` array is missing or empty. Ping responses go through the same shared cache as Hypixel responses (cache key `ping:<uuid>`), but the request itself is not subject to the Hypixel rate-limit gate.

### request

```ts
public request<T = Record<string, unknown>>(endpoint: string): Promise<T | null>;
```

Escape hatch for any Hypixel endpoint not covered by a group. `endpoint` is appended to `https://api.hypixel.net/v2` verbatim (include the leading `/` and any query string; the endpoint string is also the cache key). Sends the `API-Key` header, applies caching, the rate-limit gate, concurrency limiting, and retries, then returns the whole response body. Returns `null` when the API key is empty, the request ultimately fails, or the body has `success: false`.

### keys

```ts
public keys(): KeyDiagnostics[];
```

Returns an array of per-key diagnostics for every Hypixel API key currently configured, one `KeyDiagnostics` entry per key. This reflects live config state: it syncs the internal key pool with the current config source before collecting diagnostics, so hot-swapped keys appear immediately.

```ts
export interface KeyDiagnostics {
  readonly key: string;
  readonly remaining: number | null;
  readonly limit: number | null;
  readonly resetAt: number | null;
}
```

| Field       | Type             | Description                                                                 |
| ----------- | ---------------- | --------------------------------------------------------------------------- |
| `key`       | `string`         | The API key this diagnostic entry applies to                                |
| `remaining` | `number \| null` | Requests left in the current window, or `null` before the first response    |
| `limit`     | `number \| null` | Total requests per window from the last `ratelimit-limit` header, or `null` |
| `resetAt`   | `number \| null` | Millisecond timestamp when the window resets (from `now()`), or `null`      |

### clearCache

```ts
public clearCache(): void;
```

Drops every entry from the shared response cache (Hypixel responses and ping responses alike). Does not affect the resolver's identity cache.

### Request pipeline behavior

All requests made through the client share one pipeline with these fixed characteristics:

- **Response cache**: single-flight LRU cache, at most **1000 entries**, TTL of `cacheTtlSeconds` (default **300 s**). Concurrent requests for the same endpoint share one in-flight fetch. `null` results are not cached, so failures are retried on the next call.
- **Concurrency**: a semaphore caps in-flight HTTP requests at **16** across the whole client.
- **Rate-limit gate** (Hypixel requests only): each API key gets its own budget tracker from the `ratelimit-limit`, `ratelimit-remaining`, and `ratelimit-reset` response headers (with `x-` prefixed fallbacks). When multiple keys are configured, requests round-robin across them and each key's budget is tracked independently. When one key hits budget 0, its gate blocks until the reset time; the pipeline picks the next key automatically. Single-key configs behave exactly as before.
- **Retries**: each fetch is attempted up to **4 times**. A per-attempt deadline of **5000 ms** applies to both the fetch and the body read. On HTTP 429, the key's gate is penalized (remaining set to 0, reset from `ratelimit-reset` or `retry-after`, else a 5000 ms default) and the next attempt picks the next key in rotation, except when the 429 body's `cause` contains "too recently" (a per-player cooldown), which returns `null` immediately without retrying. On timeout, the pipeline rotates to the next key; two consecutive timeouts return `null` (the issue is network-wide, not key-specific). Any other non-OK status returns `null` without retrying.

## IdentityApi

Shape of the `identity` property.

```ts
export interface IdentityApi {
  uuid(idOrName: string): Promise<string | null>;
  name(uuid: string): Promise<string | null>;
}
```

- `uuid(idOrName)` returns the undashed lowercase UUID. If the input already looks like a UUID (32 hex chars after removing dashes), it is normalized locally without hitting the resolver; otherwise it is resolved as a name via `resolver.getUuidFromIgn`.
- `name(uuid)` returns the current name for a UUID via the resolver's optional `getIgnFromUuid`. Resolves to `null` when the resolver does not implement it or the lookup fails.

## HypixelApiConfig

Object form of the configuration.

```ts
export interface HypixelApiConfig {
  apiKey: string | string[];
  pingApiKey?: string | string[];
  cacheTtlSeconds?: number;
}
```

| Option            | Type                 | Default  | Description                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apiKey`          | `string \| string[]` | required | Hypixel API key(s). A single string works exactly as before. An array enables round-robin with per-key rate-limit tracking -- when one key is exhausted (HTTP 429), the next request automatically picks the next key. Empty entries in an array are silently dropped. Without any key, endpoint methods return `null`. Get keys at the [Hypixel Developer Dashboard](https://developer.hypixel.net/). |
| `pingApiKey`      | `string \| string[]` | `""`     | Key(s) for the external Aurora ping service by Bordic. When empty, `ping()` returns `null`. Multiple keys are distributed round-robin across calls (no rate-limit gate, since Aurora returns no rate-limit headers). Get one by adding the [Vega Discord bot](https://discord.com/oauth2/authorize?client_id=1244205279697174539) and running `/api view`.                                             |
| `cacheTtlSeconds` | `number`             | `300`    | Success TTL of the shared response cache, in seconds. Applies to all Hypixel and ping responses.                                                                                                                                                                                                                                                                                                       |

## HypixelApiConfigInput

Everything the constructor accepts.

```ts
export type HypixelApiConfigInput =
  | string
  | HypixelApiConfig
  | HypixelApiConfigSource;
```

- **`string`**: shorthand for `{ apiKey: input, pingApiKey: "", cacheTtlSeconds: 300 }`.
- **`HypixelApiConfig`**: missing fields are filled with the defaults above, then frozen into a static snapshot; later mutation of the object you passed has no effect.
- **`HypixelApiConfigSource`**: used as-is and called on every request, so the key and TTL can change at runtime (key rotation, hot reload).

## HypixelApiConfigSource

The fully-resolved, function-shaped configuration the pipeline consumes. `toConfigSource` normalizes every `HypixelApiConfigInput` into this form.

```ts
export type HypixelApiConfigSource = () => {
  apiKey: string | string[];
  pingApiKey: string | string[];
  cacheTtlSeconds: number;
};
```

The pipeline invokes the source at request time for the API key and cache TTL, and the ping service invokes it for `pingApiKey`, so a custom source is read fresh on each call.

## Exports documented

`HypixelApiService` (alias `HypixelClient`), `IdentityApi`, `BoosterFeed`, `Timestamped`, `KeyDiagnostics`, `HypixelApiConfig`, `HypixelApiConfigInput`, `HypixelApiConfigSource`.

