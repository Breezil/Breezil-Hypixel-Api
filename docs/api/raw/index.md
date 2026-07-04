# Raw Types Reference

The strict-raw parsed types and parser functions from `@breezil/hypixel-parsers`, all re-exported from `@breezil/hypixel-api` so you never need another package or docs site. Every parser is a pure function: raw Hypixel JSON in, a readonly fully-typed object out. The client calls these for you on every endpoint; they are also importable directly for parsing JSON you already have.

## Design principles

- **Strict-raw.** The parsers mirror the raw Hypixel API field-for-field and do zero computation. No ratios, no levels-from-xp, no derived totals, no aggregates. Computed and derived values belong in a wrapper layer built on top of this one.
- **Full depth.** Every field the API returns is typed, including the deep SkyBlock sub-trees and decoded item NBT.
- **Decoded NBT.** Base64 + gzipped item NBT is decoded and typed (see [NBT Decoding](/api/raw/nbt)) rather than left as an opaque blob.
- **Safe defaults.** Missing fields resolve to typed defaults: `0`, `""`, `false`, `null`, `[]`, or `{}`, never `undefined`. Game-mode blocks resolve to `null` when the player has never played them.
- **No `Record<string, unknown>` in outputs**, except the one deliberate decoded-NBT passthrough on item tags.

## Endpoint to parser

| Hypixel endpoint                     | Parser                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `/player`                            | [`parsePlayer`](/api/raw/player) (aggregates all game modes)                                 |
| `/guild`                             | [`parseGuild`](/api/raw/guild-status)                                                        |
| `/status`                            | [`parseStatus`](/api/raw/guild-status)                                                       |
| `/recentgames`                       | [`parseRecentGames`](/api/raw/guild-status)                                                  |
| `/skyblock/profile`                  | [`parseSkyBlockProfile`](/api/raw/skyblock/profile)                                          |
| `/skyblock/profiles`                 | [`parseSkyBlockProfiles`](/api/raw/skyblock/profile)                                         |
| `/skyblock/bazaar`                   | [`parseBazaar`](/api/raw/skyblock/economy)                                                   |
| `/skyblock/auction`                  | [`parseAuction`](/api/raw/skyblock/economy), [`parseAuctionList`](/api/raw/skyblock/economy) |
| `/skyblock/auctions`                 | [`parseAuctionsPage`](/api/raw/skyblock/economy)                                             |
| `/skyblock/auctions_ended`           | [`parseAuctionList`](/api/raw/skyblock/economy)                                              |
| `/skyblock/museum`                   | [`parseMuseum`](/api/raw/skyblock/collections)                                               |
| `/skyblock/garden`                   | [`parseGarden`](/api/raw/skyblock/collections)                                               |
| `/skyblock/news`                     | [`parseSkyBlockNews`](/api/raw/skyblock/collections)                                         |
| `/skyblock/firesales`                | [`parseFireSales`](/api/raw/skyblock/collections)                                            |
| `/skyblock/bingo`                    | [`parsePlayerBingo`](/api/raw/skyblock/collections)                                          |
| `/resources/skyblock/items`          | [`parseSkyBlockItems`](/api/raw/skyblock/items)                                              |
| `/resources/skyblock/skills`         | [`parseSkyBlockSkills`](/api/raw/skyblock/resources)                                         |
| `/resources/skyblock/collections`    | [`parseSkyBlockCollections`](/api/raw/skyblock/resources)                                    |
| `/resources/skyblock/election`       | [`parseSkyBlockElection`](/api/raw/skyblock/resources)                                       |
| `/resources/skyblock/bingo`          | [`parseSkyBlockBingo`](/api/raw/skyblock/resources)                                          |
| `/resources/achievements`            | [`parseAchievements`](/api/raw/resources)                                                    |
| `/resources/challenges`              | [`parseChallenges`](/api/raw/resources)                                                      |
| `/resources/quests`                  | [`parseQuests`](/api/raw/resources)                                                          |
| `/resources/guilds/achievements`     | [`parseGuildAchievements`](/api/raw/resources)                                               |
| `/resources/games`                   | [`parseGames`](/api/raw/resources)                                                           |
| `/resources/vanity/pets`             | [`parseVanityPets`](/api/raw/resources)                                                      |
| `/resources/vanity/companions`       | [`parseVanityCompanions`](/api/raw/resources)                                                |
| `/counts`                            | [`parseGameCounts`](/api/raw/static-housing)                                                 |
| `/leaderboards`                      | [`parseLeaderboards`](/api/raw/static-housing)                                               |
| `/boosters`                          | [`parseBoosters`](/api/raw/static-housing)                                                   |
| `/punishmentstats`                   | [`parseWatchdogStats`](/api/raw/static-housing)                                              |
| `/housing/active`, `/housing/houses` | [`parseHouses`](/api/raw/static-housing)                                                     |
| `/housing/house`                     | [`parseHouse`](/api/raw/static-housing)                                                      |

## By domain

### Core

- [`parsePlayer`](/api/raw/player) and the full `HypixelPlayer` tree
- [`parseGuild`, `parseStatus`, `parseRecentGames`](/api/raw/guild-status)

### Game modes

[`parseBedWars`](/api/raw/modes/bedwars) ·
[`parseSkyWars`](/api/raw/modes/skywars) ·
[`parseDuels`](/api/raw/modes/duels) ·
[`parseArcade`](/api/raw/modes/arcade) ·
[`parseBuildBattle`](/api/raw/modes/buildbattle) ·
[`parseMurderMystery`](/api/raw/modes/murdermystery) ·
[`parseTNTGames`](/api/raw/modes/tntgames) ·
[`parsePit`](/api/raw/modes/pit) ·
[`parseMegaWalls`](/api/raw/modes/megawalls) ·
[`parseBlitz`](/api/raw/modes/blitz) ·
[`parseUHC`](/api/raw/modes/uhc) ·
[`parseSmashHeroes`](/api/raw/modes/smashheroes) ·
[`parseCopsAndCrims`](/api/raw/modes/copsandcrims) ·
[`parsePaintball`](/api/raw/modes/paintball) ·
[`parseQuakecraft`](/api/raw/modes/quakecraft) ·
[`parseVampireZ`](/api/raw/modes/vampirez) ·
[`parseWalls`](/api/raw/modes/walls) ·
[`parseWarlords`](/api/raw/modes/warlords) ·
[`parseTurboKartRacers`](/api/raw/modes/turbokartracers) ·
[`parseArenaBrawl`](/api/raw/modes/arenabrawl)

Each game-mode parser takes the player's `stats` block and returns the mode's typed stats, or `null` when the player has never played it. `parseBedWars` additionally takes the star `level`, which it passes through verbatim.

### SkyBlock

- [Profile](/api/raw/skyblock/profile): `parseSkyBlockProfile`, `parseSkyBlockProfiles`
- [Bazaar & Auctions](/api/raw/skyblock/economy): `parseBazaar`, `parseAuction`, `parseAuctionList`, `parseAuctionsPage`
- [Museum, Garden, News & Bingo](/api/raw/skyblock/collections): `parseMuseum`, `parseGarden`, `parseSkyBlockNews`, `parseFireSales`, `parsePlayerBingo`
- [Items](/api/raw/skyblock/items): `parseSkyBlockItems`
- [Resources](/api/raw/skyblock/resources): `parseSkyBlockSkills`, `parseSkyBlockCollections`, `parseSkyBlockElection`, `parseSkyBlockBingo`

### Resources, static & housing

- [Resources](/api/raw/resources): `parseAchievements`, `parseChallenges`, `parseQuests`, `parseGuildAchievements`, `parseGames`, `parseVanityPets`, `parseVanityCompanions`
- [Static & Housing](/api/raw/static-housing): `parseBoosters`, `parseLeaderboards`, `parseGameCounts`, `parseWatchdogStats`, `parseHouse`, `parseHouses`

### Decoding & helpers

- [NBT Decoding](/api/raw/nbt): `decodeNbt`, `decodeItemBytes`
- [Helpers](/api/raw/common): `num`, `str`, `bool`, `obj`, `date`

Every type behind a parser (such as `HypixelPlayer`, `BedWarsStats`, or `SkyBlockProfile`) is exported from the package root too.

