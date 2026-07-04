# Computed Values

Every parsed object returned by the client is enriched with an always-on `.computed`
namespace before it reaches you. There is no opt-in flag and no extra call: `player()`,
`guild()`, `skyblockProfiles()`, `skyblockBazaar()`, and the rest return objects that
already carry derived statistics next to the raw parsed fields.

The enrichment layer lives in `src/computed/enrich.ts` (player, guild, SkyBlock profile)
and `src/computed/enrich-endpoints.ts` (all other endpoints). Both are pure: they take a
parsed value from `@breezil/hypixel-parsers` and return the same value plus a `computed`
property. No network calls, no mutation of the input.

## Unit conventions

All computed values across every module follow one naming convention:

| Field name pattern      | Unit                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `*Percent`, `*Share`    | Percentage on a 0 to 100 scale (`percent(part, whole)` = `part / whole * 100`, rounded to 2 dp) |
| any other ratio or rate | Bare quotient (for example a K/D of `2.5`, a per-game average of `0.8`)                         |
| `*ForNext*`             | A count or amount of XP still needed to reach the next whole ratio, level, prestige, or title   |

Two edge cases are worth knowing:

- `ratio(a, b)` returns `a` itself when `b` is `0` (the K/D convention: 10 kills and 0
  deaths is a K/D of 10).
- `percent(part, whole)` returns `0` when `whole` is `0`.

See [Shared helpers](./shared) for the exact implementations.

## `WithComputed<T, C>`

```ts
export type WithComputed<T, C> = T & { readonly computed: C };
```

The universal shape of an enriched value: the raw parsed object `T` with a read-only
`computed` property of type `C` merged in. All raw fields stay exactly where the parsers
put them; the computed values never shadow or replace raw data.

## Attach helpers

Three small helpers build every enriched shape. They are exported so you can enrich data
you obtained some other way (for example from a cache or a fixture).

### `attach(raw, compute)`

```ts
function attach<T extends object, C>(
  raw: T,
  compute: (value: T) => C,
): WithComputed<T, C>;
function attach<T extends object, C>(
  raw: T | null,
  compute: (value: T) => C,
): WithComputed<T, C> | null;
```

Shallow-copies `raw` and adds `computed: compute(raw)`. Null-safe: passing `null` returns
`null` without calling `compute`. The overloads preserve nullability in the return type,
so `attach(nonNullValue, fn)` is typed as non-null.

### `attachAll(items, compute)`

```ts
function attachAll<T extends object, C>(
  items: readonly T[],
  compute: (value: T) => C,
): WithComputed<T, C>[];
```

Maps `attach` over an array.

### `attachRecord(record, compute)`

```ts
function attachRecord<T extends object, C>(
  record: Readonly<Record<string, T>>,
  compute: (value: T) => C,
): Record<string, WithComputed<T, C>>;
```

Maps `attach` over every value of a string-keyed record, preserving the keys.

## Player

### `EnrichedPlayer`

```ts
type EnrichedPlayer = Omit<HypixelPlayer, "stats"> & {
  readonly computed: PlayerComputed;
  readonly stats: EnrichedPlayerStats;
};
```

Returned by `player()`. The top-level `computed` is [`PlayerComputed`](./player)
(rank, formatted nickname, network level progress, account age, and more). The `stats`
property is replaced with `EnrichedPlayerStats`, in which each per-game stats block is
itself enriched.

Produced by `enrichPlayer(player: HypixelPlayer): EnrichedPlayer`.

### `EnrichedPlayerStats`

Every per-game block of `HypixelPlayerStats` wrapped in `WithComputed` with that game's
computed interface. Each entry is `null` exactly when the parsed block was `null` (the
player never touched that game). The one exception is `skyblock`, which is passed through
unenriched (SkyBlock enrichment happens on profiles, not on the player object).

| Field             | Type                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `bedwars`         | `WithComputed<BedWarsStats, BedWarsComputed> \| null`                 |
| `skywars`         | `WithComputed<SkyWarsStats, SkyWarsComputed> \| null`                 |
| `duels`           | `WithComputed<DuelsStats, DuelsComputed> \| null`                     |
| `arcade`          | `WithComputed<ArcadeStats, ArcadeComputed> \| null`                   |
| `buildBattle`     | `WithComputed<BuildBattleStats, BuildBattleComputed> \| null`         |
| `murderMystery`   | `WithComputed<MurderMysteryStats, MurderMysteryComputed> \| null`     |
| `tntGames`        | `WithComputed<TNTGamesStats, TNTGamesComputed> \| null`               |
| `pit`             | `WithComputed<PitStats, PitComputed> \| null`                         |
| `megaWalls`       | `WithComputed<MegaWallsStats, MegaWallsComputed> \| null`             |
| `blitz`           | `WithComputed<BlitzStats, BlitzComputed> \| null`                     |
| `uhc`             | `WithComputed<UHCStats, UHCComputed> \| null`                         |
| `smashHeroes`     | `WithComputed<SmashHeroesStats, SmashHeroesComputed> \| null`         |
| `copsAndCrims`    | `WithComputed<CopsAndCrimsStats, CopsAndCrimsComputed> \| null`       |
| `paintball`       | `WithComputed<PaintballStats, PaintballComputed> \| null`             |
| `quakecraft`      | `WithComputed<QuakecraftStats, QuakecraftComputed> \| null`           |
| `vampireZ`        | `WithComputed<VampireZStats, VampireZComputed> \| null`               |
| `walls`           | `WithComputed<WallsStats, WallsComputed> \| null`                     |
| `warlords`        | `WithComputed<WarlordsStats, WarlordsComputed> \| null`               |
| `turboKartRacers` | `WithComputed<TurboKartRacersStats, TurboKartRacersComputed> \| null` |
| `arenaBrawl`      | `WithComputed<ArenaBrawlStats, ArenaBrawlComputed> \| null`           |
| `woolGames`       | `WithComputed<WoolGamesStats, WoolGamesComputed> \| null`             |
| `speedUHC`        | `WithComputed<SpeedUHCStats, SpeedUHCComputed> \| null`               |
| `skyClash`        | `WithComputed<SkyClashStats, SkyClashComputed> \| null`               |
| `trueCombat`      | `WithComputed<TrueCombatStats, TrueCombatComputed> \| null`           |
| `legacy`          | `WithComputed<LegacyStats, LegacyComputed> \| null`                   |
| `mainLobby`       | `WithComputed<MainLobbyStats, MainLobbyComputed> \| null`             |
| `housing`         | `WithComputed<HousingStats, HousingComputed> \| null`                 |
| `skyblock`        | `SkyBlockStats \| null` (raw, not enriched)                           |

## Guild

### `EnrichedGuild`

```ts
type EnrichedGuild = WithComputed<Guild, GuildComputed>;
```

Returned by `guild()`. `computed` is [`GuildComputed`](./guild): level, weekly GEXP,
per-member exp history, activity shares, and more.

Produced by `enrichGuild(guild: Guild): EnrichedGuild`.

## SkyBlock profiles

### `EnrichedSkyBlockMember`

```ts
type EnrichedSkyBlockMember = WithComputed<
  SkyBlockMember,
  SkyBlockMemberComputed
>;
```

`computed` is [`SkyBlockMemberComputed`](./skyblock): skills, slayers, dungeons, pets,
pet score, and averages.

### `EnrichedSkyBlockProfile`

```ts
type EnrichedSkyBlockProfile = Omit<SkyBlockProfile, "member" | "members"> & {
  readonly member: EnrichedSkyBlockMember | null;
  readonly members: Record<string, EnrichedSkyBlockMember>;
};
```

Returned by `skyblockProfiles()` and `skyblockProfile()`. The queried player's `member`
(when present) and every entry of `members` are enriched. The profile object itself gains
no top-level `computed`; all derived values are per member.

Produced by `enrichSkyBlockProfile(profile: SkyBlockProfile): EnrichedSkyBlockProfile`.

## Network endpoints

### `EnrichedGameCounts`

```ts
type EnrichedGameCounts = WithComputed<StaticGameCounts, GameCountsComputed>;
```

Produced by `enrichGameCounts(counts)`. Used by `gameCounts()`.

### `EnrichedBooster`

```ts
type EnrichedBooster = WithComputed<StaticBooster, BoosterComputed>;
```

Produced by `enrichBoosters(boosters: readonly StaticBooster[]): EnrichedBooster[]`,
which enriches each booster in the list. Used by `boosters()`.

### `EnrichedRecentGame`

```ts
type EnrichedRecentGame = WithComputed<RecentGame, RecentGameComputed>;
```

Produced by `enrichRecentGames(games: readonly RecentGame[]): EnrichedRecentGame[]`.
Used by `recentGames()`.

### `EnrichedLeaderboards`

```ts
type EnrichedLeaderboard = WithComputed<StaticLeaderboard, LeaderboardComputed>;

interface EnrichedLeaderboards {
  readonly games: Record<string, readonly EnrichedLeaderboard[]>;
  readonly computed: LeaderboardsComputed;
}
```

Produced by `enrichLeaderboards(boards: Readonly<Record<string, readonly StaticLeaderboard[]>>): EnrichedLeaderboards`.
Unlike the other enrichers, each board's `computed` is built with positional context:
`computeLeaderboard(board, game, index)` receives the game key and the board's index in
that game's list. The top-level `computed` aggregates across all games. Used by
`leaderboards()`.

### `EnrichedWatchdogStats`

```ts
type EnrichedWatchdogStats = WithComputed<
  StaticWatchdogStats,
  WatchdogComputed
>;
```

Produced by `enrichWatchdogStats(stats)`. Used by `watchdogStats()`.

## SkyBlock economy endpoints

### `EnrichedBazaarProduct`

```ts
type EnrichedBazaarProduct = WithComputed<BazaarProduct, BazaarProductComputed>;
```

Produced by `enrichBazaar(products: Record<string, BazaarProduct>): Record<string, EnrichedBazaarProduct>`,
which enriches every product in the record, keyed by product id. Used by `skyblockBazaar()`.

### `EnrichedAuction` and `EnrichedAuctionsPage`

```ts
type EnrichedAuction = WithComputed<SkyBlockAuction, AuctionComputed>;

type EnrichedAuctionsPage = Omit<SkyBlockAuctionsPage, "auctions"> & {
  readonly auctions: readonly EnrichedAuction[];
};
```

Produced by `enrichAuctions(auctions: readonly SkyBlockAuction[]): EnrichedAuction[]` and
`enrichAuctionsPage(page: SkyBlockAuctionsPage): EnrichedAuctionsPage` (which keeps the
page metadata and enriches each auction). Used by `skyblockAuctions()`.

### `EnrichedEndedAuctions`

```ts
interface EnrichedEndedAuctions {
  readonly auctions: readonly SkyBlockAuction[];
  readonly computed: EndedAuctionsComputed;
}
```

Produced by `enrichEndedAuctions(auctions: readonly SkyBlockAuction[]): EnrichedEndedAuctions`.
Individual ended auctions are left raw; the value of this endpoint is the aggregate
`computed` over the whole batch. Used by `skyblockEndedAuctions()`.

### `EnrichedFireSale`

```ts
type EnrichedFireSale = WithComputed<SkyBlockFireSale, FireSaleComputed>;
```

Produced by `enrichFireSales(sales: readonly SkyBlockFireSale[]): EnrichedFireSale[]`.
Used by `skyblockFireSales()`.

## SkyBlock garden and museum

### `EnrichedGarden`

```ts
type EnrichedGarden = WithComputed<SkyBlockGarden, GardenComputed>;
```

Produced by `enrichGarden(garden)`. `computed` is [`GardenComputed`](./garden): garden
level, all thirteen crop milestones, upgrade totals, and visitor stats. Used by
`skyblockGarden()`.

### `EnrichedMuseum`

```ts
type EnrichedMuseumMember = WithComputed<
  SkyBlockMuseumMember,
  MuseumMemberComputed
>;

type EnrichedMuseum = Omit<SkyBlockMuseum, "members"> & {
  readonly members: Record<string, EnrichedMuseumMember>;
  readonly computed: MuseumComputed;
};
```

Produced by `enrichMuseum(museum: SkyBlockMuseum): EnrichedMuseum`. Both levels are
enriched: each member gets a `MuseumMemberComputed`, and the museum as a whole gets a
`MuseumComputed`. Used by `skyblockMuseum()`.

## Pages in this section

| Page                          | Covers                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| [Player](./player)            | `PlayerComputed` (rank, nickname, network level, activity)   |
| [Guild](./guild)              | `GuildComputed` and its sub-interfaces                       |
| [SkyBlock member](./skyblock) | `SkyBlockMemberComputed` (skills, slayers, dungeons, pets)   |
| [Garden](./garden)            | `GardenComputed` (level, crop milestones, visitors)          |
| [Shared helpers](./shared)    | Ratio math, leveling curves, oscillation, and time constants |

