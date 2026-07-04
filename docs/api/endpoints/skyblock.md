# SkyBlock endpoints

The `SkyBlockEndpoints` group (available as `client.skyblock`) wraps every SkyBlock
endpoint: profiles, garden, museum, bazaar, auctions, fire sales, news, bingo, and the
static `/resources/skyblock/*` definitions. It is defined in
`src/endpoints/skyblock-endpoints.ts` and extends `ResolvingEndpointGroup`, so the
player-scoped methods (`profiles`, `auction` with `by: "player"`, `playerBingo`) accept a
UUID or IGN.

All methods are `async` and return `null` instead of throwing when the request fails
(no API key, rate limited, upstream error) or the expected payload is missing.

Enriched results carry a `.computed` block; see the
[SkyBlock computed pages](/api/computed/skyblock). Raw parser types are documented in the
[parsers docs](https://breezil.github.io/Breezil-Hypixel-Parsers/). `Timestamped<T>` is
documented on the [network endpoints page](/api/endpoints/network#timestamped-t).

## Identifier resolution

Methods that take an `idOrName: string` resolve it as follows (see `resolveUuid` in
`src/resolver.ts`): the input is trimmed, and if it is 32 hex characters after removing
dashes it is used directly as the UUID (lowercased, undashed); otherwise it is resolved
via the injected `HypixelUuidResolver`. If resolution fails, the method returns `null`
without hitting the Hypixel API. Methods that take a `profileId` pass it through verbatim.

## `profiles(idOrName)`

Fetches all of a player's SkyBlock profiles.

```ts
profiles(idOrName: string): Promise<readonly EnrichedSkyBlockProfile[] | null>
```

**Parameters**

| Name       | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `idOrName` | `string` | Player UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /skyblock/profiles?uuid=<uuid>` (Hypixel API v2)

**Returns:** `readonly EnrichedSkyBlockProfile[] | null`

The whole envelope is parsed with `parseSkyBlockProfiles(raw, uuid)`; because the resolved
UUID is passed in, each profile's `.member` is pre-selected to the queried player.
`EnrichedSkyBlockProfile` is the parser's `SkyBlockProfile` with `member` and `members`
replaced by enriched variants: each member carries a `.computed` block of type
`SkyBlockMemberComputed` (skills, and other derived values), and `.member` is
`EnrichedSkyBlockMember | null`.

**Null semantics:** `null` when resolution fails or the request fails. A player with no
profiles yields an empty array (the parser handles `profiles: null`).

## `profile(profileId)`

Fetches a single profile by its id.

```ts
profile(profileId: string): Promise<EnrichedSkyBlockProfile | null>
```

**Parameters**

| Name        | Type     | Description               |
| ----------- | -------- | ------------------------- |
| `profileId` | `string` | The SkyBlock profile UUID |

**Endpoint:** `GET /skyblock/profile?profile=<profileId>`

**Returns:** `EnrichedSkyBlockProfile | null` (same enriched shape as
[`profiles()`](#profiles-idorname); since no player UUID is supplied here, `.member` is not
pre-selected).

**Null semantics:** `null` when the request fails, the envelope's `profile` key is missing
or not an object (unknown profile id), or `parseSkyBlockProfile` returns `null`.

## `garden(profileId)`

Fetches a profile's garden.

```ts
garden(profileId: string): Promise<EnrichedGarden | null>
```

**Parameters**

| Name        | Type     | Description               |
| ----------- | -------- | ------------------------- |
| `profileId` | `string` | The SkyBlock profile UUID |

**Endpoint:** `GET /skyblock/garden?profile=<profileId>`

**Returns:** `EnrichedGarden | null`

The `garden` object is extracted from the envelope and parsed with `parseGarden`.
`EnrichedGarden` is the parser's `SkyBlockGarden` plus a `.computed` block of type
`GardenComputed` (see the [SkyBlock computed pages](/api/computed/skyblock)).

**Null semantics:** `null` when the request fails, the `garden` key is missing or not an
object, or `parseGarden` returns `null`.

## `museum(profileId)`

Fetches a profile's museum.

```ts
museum(profileId: string): Promise<EnrichedMuseum | null>
```

**Parameters**

| Name        | Type     | Description               |
| ----------- | -------- | ------------------------- |
| `profileId` | `string` | The SkyBlock profile UUID |

**Endpoint:** `GET /skyblock/museum?profile=<profileId>`

**Returns:** `EnrichedMuseum | null`

The `members` object is extracted from the envelope and parsed with `parseMuseum`.
`EnrichedMuseum` is the parser's `SkyBlockMuseum` with each member replaced by an
`EnrichedMuseumMember` (member `.computed` of type `MuseumMemberComputed`) plus a
top-level `.computed` block of type `MuseumComputed`.

**Null semantics:** `null` when the request fails or the `members` key is missing or not an
object.

## `bazaar()`

Fetches the live bazaar, keyed by product id.

```ts
bazaar(): Promise<Timestamped<Record<string, EnrichedBazaarProduct>> | null>
```

**Endpoint:** `GET /skyblock/bazaar`

**Returns:** `Timestamped<Record<string, EnrichedBazaarProduct>> | null`

The `products` object is extracted from the envelope, parsed with `parseBazaar`, and
enriched with `enrichBazaar`; the result is wrapped in `Timestamped` using the envelope's
`lastUpdated` field. Each `EnrichedBazaarProduct` is the parser's `BazaarProduct` plus a
`.computed` block of type `BazaarProductComputed` (spreads, margins, and other derived
values; see the [SkyBlock computed pages](/api/computed/skyblock)).

**Null semantics:** `null` when the request fails or the `products` key is missing or not
an object.

## `auctions(page?)`

Fetches one page of active auctions.

```ts
auctions(page = 0): Promise<EnrichedAuctionsPage | null>
```

**Parameters**

| Name   | Type     | Default | Description              |
| ------ | -------- | ------- | ------------------------ |
| `page` | `number` | `0`     | Zero-based page to fetch |

**Endpoint:** `GET /skyblock/auctions?page=<page>`

**Returns:** `EnrichedAuctionsPage | null`

The whole envelope is parsed with `parseAuctionsPage` and enriched with
`enrichAuctionsPage`. `EnrichedAuctionsPage` is the parser's `SkyBlockAuctionsPage`
(`page`, `totalPages`, `totalAuctions`, ...) with its `auctions` array replaced by
`readonly EnrichedAuction[]`, where each auction carries a `.computed` block of type
`AuctionComputed`.

**Null semantics:** `null` only when the request itself fails (an out-of-range page is
still a well-formed envelope).

## `auction(by, query)`

Fetches auctions by auction UUID, seller player, or seller profile.

```ts
auction(
  by: "uuid" | "player" | "profile",
  query: string,
): Promise<EnrichedAuction[] | null>
```

**Parameters**

| Name    | Type                              | Description                                                 |
| ------- | --------------------------------- | ----------------------------------------------------------- |
| `by`    | `"uuid" \| "player" \| "profile"` | Which query parameter to send                               |
| `query` | `string`                          | Auction UUID, player UUID or IGN, or profile UUID, per `by` |

**Endpoint:** `GET /skyblock/auction?uuid=<query>`, `?player=<uuid>`, or
`?profile=<query>` depending on `by`

When `by` is `"player"`, `query` goes through the UUID resolver first (UUID or IGN
accepted); `"uuid"` and `"profile"` queries are passed through verbatim.

**Returns:** `EnrichedAuction[] | null`

The `auctions` array is extracted from the envelope, parsed with `parseAuctionList`, and
enriched with `enrichAuctions`. Each element carries a `.computed` block of type
`AuctionComputed`.

**Null semantics:** `null` when `by` is `"player"` and resolution fails, when the request
fails, or when the `auctions` key is missing or not an array. An empty array means the
query matched nothing.

## `endedAuctions()`

Fetches auctions that ended in the last minute.

```ts
endedAuctions(): Promise<Timestamped<EnrichedEndedAuctions> | null>
```

**Endpoint:** `GET /skyblock/auctions_ended`

**Returns:** `Timestamped<EnrichedEndedAuctions> | null`

The `auctions` array is extracted from the envelope, parsed with `parseAuctionList`, and
enriched with `enrichEndedAuctions`; the result is wrapped in `Timestamped`.
`EnrichedEndedAuctions` is a wrapper rather than a per-auction enrichment:

```ts
interface EnrichedEndedAuctions {
  readonly auctions: readonly SkyBlockAuction[];
  readonly computed: EndedAuctionsComputed;
}
```

The individual auctions are raw parser `SkyBlockAuction` values; the `.computed` block
aggregates over the batch (see the [SkyBlock computed pages](/api/computed/skyblock)).

**Null semantics:** `null` when the request fails or the `auctions` key is missing or not
an array.

## `fireSales()`

Fetches active or upcoming fire sales.

```ts
fireSales(): Promise<EnrichedFireSale[] | null>
```

**Endpoint:** `GET /skyblock/firesales`

**Returns:** `EnrichedFireSale[] | null`

The `sales` array is extracted from the envelope, parsed with `parseFireSales`, and
enriched with `enrichFireSales`. Each element is the parser's `SkyBlockFireSale` plus a
`.computed` block of type `FireSaleComputed`.

**Null semantics:** `null` when the request fails or the `sales` key is missing or not an
array. An empty array means no fire sales.

## `news()`

Fetches SkyBlock news posts.

```ts
news(): Promise<SkyBlockNewsItem[] | null>
```

**Endpoint:** `GET /skyblock/news`

**Returns:** `SkyBlockNewsItem[] | null`

The `items` array is extracted from the envelope and parsed with `parseSkyBlockNews`. Raw
parser type, no `.computed` block.

**Null semantics:** `null` when the request fails or the `items` key is missing or not an
array.

## `items()`

Fetches SkyBlock item definitions.

```ts
items(): Promise<Timestamped<SkyBlockItem[]> | null>
```

**Endpoint:** `GET /resources/skyblock/items`

**Returns:** `Timestamped<SkyBlockItem[]> | null`

The `items` array is extracted from the envelope and parsed with `parseSkyBlockItems`;
the result is wrapped in `Timestamped`. Raw parser type, no `.computed` block.

**Null semantics:** `null` when the request fails or the `items` key is missing or not an
array.

## `skills()`

Fetches SkyBlock skill definitions.

```ts
skills(): Promise<SkyBlockSkillsResource | null>
```

**Endpoint:** `GET /resources/skyblock/skills`

**Returns:** `SkyBlockSkillsResource | null`

The whole envelope is parsed with `parseSkyBlockSkills`. Raw parser type, no `.computed`
block and no `Timestamped` wrapper.

**Null semantics:** `null` only when the request itself fails.

## `collections()`

Fetches SkyBlock collection definitions.

```ts
collections(): Promise<SkyBlockCollectionsResource | null>
```

**Endpoint:** `GET /resources/skyblock/collections`

**Returns:** `SkyBlockCollectionsResource | null`

The whole envelope is parsed with `parseSkyBlockCollections`. Raw parser type, no
`.computed` block.

**Null semantics:** `null` only when the request itself fails.

## `election()`

Fetches the current mayor and election state.

```ts
election(): Promise<SkyBlockElectionResource | null>
```

**Endpoint:** `GET /resources/skyblock/election`

**Returns:** `SkyBlockElectionResource | null`

The whole envelope is parsed with `parseSkyBlockElection`. Raw parser type, no `.computed`
block.

**Null semantics:** `null` only when the request itself fails.

## `bingo()`

Fetches the current bingo event definition (goals and event metadata).

```ts
bingo(): Promise<SkyBlockBingoResource | null>
```

**Endpoint:** `GET /resources/skyblock/bingo`

**Returns:** `SkyBlockBingoResource | null`

The whole envelope is parsed with `parseSkyBlockBingo`. Raw parser type, no `.computed`
block.

**Null semantics:** `null` only when the request itself fails.

## `playerBingo(idOrName)`

Fetches a player's bingo participation data.

```ts
playerBingo(idOrName: string): Promise<readonly PlayerBingoEvent[] | null>
```

**Parameters**

| Name       | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `idOrName` | `string` | Player UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /skyblock/bingo?uuid=<uuid>`

**Returns:** `readonly PlayerBingoEvent[] | null`

The whole envelope is parsed with `parsePlayerBingo`. Raw parser type, no `.computed`
block.

**Null semantics:** `null` when resolution fails or the request fails.

## Summary

| Method                  | Endpoint                          | Returns                                                      | `.computed`?                  |
| ----------------------- | --------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| `profiles(idOrName)`    | `/skyblock/profiles`              | `readonly EnrichedSkyBlockProfile[] \| null`                 | Yes, per member               |
| `profile(profileId)`    | `/skyblock/profile`               | `EnrichedSkyBlockProfile \| null`                            | Yes, per member               |
| `garden(profileId)`     | `/skyblock/garden`                | `EnrichedGarden \| null`                                     | Yes                           |
| `museum(profileId)`     | `/skyblock/museum`                | `EnrichedMuseum \| null`                                     | Yes, top-level and per member |
| `bazaar()`              | `/skyblock/bazaar`                | `Timestamped<Record<string, EnrichedBazaarProduct>> \| null` | Yes, per product              |
| `auctions(page?)`       | `/skyblock/auctions`              | `EnrichedAuctionsPage \| null`                               | Yes, per auction              |
| `auction(by, query)`    | `/skyblock/auction`               | `EnrichedAuction[] \| null`                                  | Yes, per auction              |
| `endedAuctions()`       | `/skyblock/auctions_ended`        | `Timestamped<EnrichedEndedAuctions> \| null`                 | Yes, batch-level only         |
| `fireSales()`           | `/skyblock/firesales`             | `EnrichedFireSale[] \| null`                                 | Yes, per sale                 |
| `news()`                | `/skyblock/news`                  | `SkyBlockNewsItem[] \| null`                                 | No (parser type)              |
| `items()`               | `/resources/skyblock/items`       | `Timestamped<SkyBlockItem[]> \| null`                        | No (parser type)              |
| `skills()`              | `/resources/skyblock/skills`      | `SkyBlockSkillsResource \| null`                             | No (parser type)              |
| `collections()`         | `/resources/skyblock/collections` | `SkyBlockCollectionsResource \| null`                        | No (parser type)              |
| `election()`            | `/resources/skyblock/election`    | `SkyBlockElectionResource \| null`                           | No (parser type)              |
| `bingo()`               | `/resources/skyblock/bingo`       | `SkyBlockBingoResource \| null`                              | No (parser type)              |
| `playerBingo(idOrName)` | `/skyblock/bingo`                 | `readonly PlayerBingoEvent[] \| null`                        | No (parser type)              |

