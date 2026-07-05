# API Overview

The package exports one client class, `HypixelApiService` (aliased as `HypixelClient`), a
provider-based identity layer, an always-on computed enrichment layer, and every raw parser
type from [`@breezil/hypixel-parsers`](/api/raw/)
(re-exported). All endpoint methods are `async` and return `null` rather than throwing when
there is no API key, the target is unknown, or the upstream call fails.

```ts
import { HypixelClient } from "@breezil/hypixel-api";

const hypixel = new HypixelClient("YOUR-API-KEY");
```

## Where everything lives

| Area               | Page                                                                                                                                                                                                                                                | What's inside                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client and config  | [Client &amp; Config](/api/client)                                                                                                                                                                                                                  | Constructor forms, endpoint groups, `ping`/`request`/`hasApiKey`/`keys`/`clearCache`, multi-key round-robin, cache/rate-limit/retry pipeline behavior |
| Identity           | [Resolver &amp; Identity Stores](/api/resolver)                                                                                                                                                                                                     | `createResolver`, `createMojangResolver`, provider chaining, `IdentityStore` port, memory and JSON-file stores                                        |
| Endpoints          | [Player](/api/endpoints/player), [Guild](/api/endpoints/guild), [Network](/api/endpoints/network), [Resources](/api/endpoints/resources), [SkyBlock](/api/endpoints/skyblock), [Housing](/api/endpoints/housing)                                    | Every method, the exact Hypixel endpoint it hits, parameters, and return types                                                                        |
| Computed layer     | [Overview &amp; Enriched Types](/api/computed/)                                                                                                                                                                                                     | `WithComputed`, every `Enriched*` type, and the unit conventions                                                                                      |
| Computed reference | [Player](/api/computed/player), [Guild](/api/computed/guild), [SkyBlock Member](/api/computed/skyblock), [Garden](/api/computed/garden), [Network](/api/computed/network), [Economy](/api/computed/skyblock-economy), per-mode pages in the sidebar | Every computed interface, field, and formula                                                                                                          |
| Shared math        | [Shared Math &amp; Tables](/api/computed/shared)                                                                                                                                                                                                    | Ratio helpers, level curves, prestige tables, oscillation buckets                                                                                     |

## Endpoint map

| Hypixel endpoint                  | Client method                        | Returns                                                          |
| --------------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| `/player`                         | `player.get(idOrName)`               | `EnrichedPlayer` (raw + `.computed`, every stats block enriched) |
| `/player`                         | `player.raw(idOrName)`               | the unparsed player object                                       |
| `/status`                         | `player.status(idOrName)`            | `PlayerStatus`                                                   |
| `/recentgames`                    | `player.recentGames(idOrName)`       | `EnrichedRecentGame[]`                                           |
| `/guild`                          | `guild.byId` / `byName` / `byPlayer` | `EnrichedGuild`                                                  |
| `/boosters`                       | `network.boosters()`                 | `BoosterFeed` (booster state + enriched boosters)                |
| `/counts`                         | `network.counts()`                   | `EnrichedGameCounts`                                             |
| `/leaderboards`                   | `network.leaderboards()`             | `EnrichedLeaderboards`                                           |
| `/punishmentstats`                | `network.watchdog()`                 | `EnrichedWatchdogStats`                                          |
| `/resources/achievements`         | `resources.achievements()`           | `Timestamped<...>`                                               |
| `/resources/challenges`           | `resources.challenges()`             | `Timestamped<...>`                                               |
| `/resources/quests`               | `resources.quests()`                 | `Timestamped<...>`                                               |
| `/resources/guilds/achievements`  | `resources.guildAchievements()`      | `GuildAchievements`                                              |
| `/resources/games`                | `resources.games()`                  | `Timestamped<...>`                                               |
| `/resources/vanity/pets`          | `resources.vanityPets()`             | `Timestamped<VanityResource>`                                    |
| `/resources/vanity/companions`    | `resources.vanityCompanions()`       | `Timestamped<VanityResource>`                                    |
| `/skyblock/profiles`              | `skyblock.profiles(idOrName)`        | `EnrichedSkyBlockProfile[]`                                      |
| `/skyblock/profile`               | `skyblock.profile(profileId)`        | `EnrichedSkyBlockProfile`                                        |
| `/skyblock/garden`                | `skyblock.garden(profileId)`         | `EnrichedGarden`                                                 |
| `/skyblock/museum`                | `skyblock.museum(profileId)`         | `EnrichedMuseum`                                                 |
| `/skyblock/bazaar`                | `skyblock.bazaar()`                  | `Timestamped<Record<string, EnrichedBazaarProduct>>`             |
| `/skyblock/auctions`              | `skyblock.auctions(page?)`           | `EnrichedAuctionsPage`                                           |
| `/skyblock/auction`               | `skyblock.auction(by, query)`        | `EnrichedAuction[]`                                              |
| `/skyblock/auctions_ended`        | `skyblock.endedAuctions()`           | `Timestamped<EnrichedEndedAuctions>`                             |
| `/skyblock/firesales`             | `skyblock.fireSales()`               | `EnrichedFireSale[]`                                             |
| `/skyblock/news`                  | `skyblock.news()`                    | `SkyBlockNewsItem[]`                                             |
| `/resources/skyblock/items`       | `skyblock.items()`                   | `Timestamped<SkyBlockItem[]>`                                    |
| `/resources/skyblock/skills`      | `skyblock.skills()`                  | `SkyBlockSkillsResource`                                         |
| `/resources/skyblock/collections` | `skyblock.collections()`             | `SkyBlockCollectionsResource`                                    |
| `/resources/skyblock/election`    | `skyblock.election()`                | `SkyBlockElectionResource`                                       |
| `/resources/skyblock/bingo`       | `skyblock.bingo()`                   | `SkyBlockBingoResource`                                          |
| `/skyblock/bingo`                 | `skyblock.playerBingo(idOrName)`     | `PlayerBingoEvent[]`                                             |
| `/housing/active`                 | `housing.active()`                   | `HousingHouse[]`                                                 |
| `/housing/house`                  | `housing.get(houseId)`               | `HousingHouse`                                                   |
| `/housing/houses`                 | `housing.forPlayer(idOrName)`        | `HousingHouse[]`                                                 |
| any v2 path                       | `request<T>(endpoint)`               | success-checked raw body                                         |

Raw parser types (`HypixelPlayer`, `Guild`, `SkyBlockProfile`, `HousingHouse`, and the rest)
are documented on the [raw type reference](/api/raw/)
and re-exported from this package.
