# Player

The player module exposes a single parser, `parsePlayer`, which mirrors the raw `/player` block of the Hypixel API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals: raw JSON in, typed objects out.

## parsePlayer

Parses a player (`/player`) into a typed object, mapping the raw player payload field-for-field into a `HypixelPlayer`.

```ts
export function parsePlayer(raw: Record<string, unknown>): HypixelPlayer;
```

### Null / empty behavior

`parsePlayer` always returns a fully-populated `HypixelPlayer`; it never returns `null`. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- String-array and number-array fields become empty arrays (`[]`) when absent.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.
- `uuid` and `nickname` fall back to `"UNKNOWN"`, `language` falls back to `"ENGLISH"`, and `channel` falls back to `"ALL"` when absent.
- Each per-game block in `stats` is a parser result that may be `null` when that game's block is absent (see [HypixelPlayerStats](#hypixelplayerstats)).

Dynamic maps (for example `claimedSoloBank`, `claimedCoopBankAt`, `christmasPresents`, `cooldowns`, `commandCooldowns`, `mapVotes`, `anniversaryBingoCard`, and the seasonal `bingo` maps) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### HypixelPlayer

The root object returned by `parsePlayer`.

```ts
export interface HypixelPlayer {
  readonly id: string;
  readonly uuid: string;
  readonly nickname: string;
  readonly playerName: string;
  readonly prefix: string;
  readonly staffRank: string;
  readonly packageRank: string;
  readonly newPackageRank: string;
  readonly monthlyPackageRank: string;
  readonly mostRecentMonthlyPackageRank: string;
  readonly networkExp: number;
  readonly karma: number;
  readonly language: string;
  readonly legacyLanguage: string;
  readonly channel: string;
  readonly networkUpdateBook: string;
  readonly mostRecentMinecraftVersion: number;
  readonly timePlaying: number;
  readonly tournamentTokens: number;
  readonly fortuneBuff: number;
  readonly giftsGrinch: number;
  readonly thanksReceived: number;
  readonly thanksSent: number;
  readonly mostRecentlyThanked: string;
  readonly mostRecentlyThankedUuid: string;
  readonly mostRecentlyTipped: string;
  readonly mostRecentlyTippedUuid: string;
  readonly santaQuestStarted: boolean;
  readonly autoSpawnPet: boolean;
  readonly battlePassGlowStatus: boolean;
  readonly clock: boolean;
  readonly main2017Tutorial: boolean;
  readonly mostRecentGameType: string;
  readonly mapVotes: Record<string, Record<string, number>>;
  readonly cachedData: HypixelPlayerCachedData;
  readonly skyblockExtra: HypixelPlayerSkyBlockExtra;
  readonly chatEnabled: boolean;
  readonly disableTipMessages: boolean;
  readonly disabledProjectileTrails: boolean;
  readonly eulaCoins: boolean;
  readonly seeRequests: boolean;
  readonly testPass: boolean;
  readonly questAutoActivate: boolean;
  readonly firstLoginAt: Date | null;
  readonly lastLoginAt: Date | null;
  readonly lastLogoutAt: Date | null;
  readonly claimedCenturyCakeAt: Date | null;
  readonly claimedCenturyCake200At: Date | null;
  readonly claimedYear143CakeAt: Date | null;
  readonly claimedPotatoWarCrownAt: Date | null;
  readonly claimedPotatoBasketAt: Date | null;
  readonly claimedPotatoTalismanAt: Date | null;
  readonly claimedSoloBank: Record<string, number>;
  readonly claimedCoopBankAt: Record<string, Date | null>;
  readonly skyBlockFreeCookieAt: Date | null;
  readonly lastMapVoteAt: Date | null;
  readonly watchdogBlockedAt: Date | null;
  readonly flashingSale: HypixelPlayerFlashingSale;
  readonly flashingNews: HypixelPlayerFlashingNews;
  readonly skin: HypixelPlayerSkin;
  readonly challenges: Record<string, Record<string, number>>;
  readonly compassStats: Record<string, Record<string, number>>;
  readonly voting: Record<string, number>;
  readonly leveling: HypixelPlayerLeveling;
  readonly dailyTwoKExpAt: Date | null;
  readonly weeklyBoosterAt: Date | null;
  readonly anniversary: HypixelPlayerAnniversary;
  readonly cooldowns: HypixelPlayerCooldowns;
  readonly commandCooldowns: Record<string, Record<string, Date | null>>;
  readonly christmasPresents: Record<string, boolean>;
  readonly achievements: HypixelPlayerAchievements;
  readonly cosmetics: HypixelPlayerCosmetics;
  readonly rankPurchase: HypixelPlayerRankPurchase;
  readonly rewards: HypixelPlayerRewards;
  readonly gifting: HypixelPlayerGifting;
  readonly socialMedia: HypixelPlayerSocialMedia;
  readonly housing: HypixelPlayerHousing;
  readonly quests: readonly HypixelPlayerQuest[];
  readonly parkour: readonly HypixelPlayerParkour[];
  readonly adventRewards: readonly HypixelPlayerAdventRewards[];
  readonly seasonal: HypixelPlayerSeasonal;
  readonly scorpiusBribes: readonly HypixelPlayerScorpiusBribe[];
  readonly tourney: HypixelPlayerTourney;
  readonly fireworkStorage: readonly HypixelPlayerFirework[];
  readonly friendRequests: readonly string[];
  readonly friendRequestsBlocked: readonly string[];
  readonly spectatorSettings: HypixelPlayerSpectatorSettings;
  readonly kits: HypixelPlayerKits;
  readonly currentHat: string;
  readonly currentIp: string;
  readonly todo: string;
  readonly guildNotifications: boolean;
  readonly autoDetectLanguage: boolean;
  readonly adventureTester: boolean;
  readonly disableSendAll: boolean;
  readonly sendCerberusMessages: boolean;
  readonly friendInvisible: boolean;
  readonly giveDjFeather: boolean;
  readonly hasTheHotPotato: boolean;
  readonly notifiedOfStuff: boolean;
  readonly reverted: boolean;
  readonly showTntRunActionbarInfo: boolean;
  readonly enableFireFlurry: boolean;
  readonly santaFinished: boolean;
  readonly snowballFightIntro2019: boolean;
  readonly storeCredit: number;
  readonly multiTunnel: readonly string[];
  readonly plotResets: HypixelPlayerPlotResets;
  readonly pp: string;
  readonly collectiblesMenuVisibilitySort: string;
  readonly oneTimeAchievementMenuSortCompletionSort: string;
  readonly anniversaryBingoCard: Record<string, readonly string[]>;
  readonly anniversaryNpcVisited: Record<string, readonly number[]>;
  readonly anniversaryNpcProgress: Record<string, unknown>;
  readonly upcomingLanguageReleases: Record<string, { logins: number }>;
  readonly aprilFoolsClicked: Record<string, readonly string[]>;
  readonly tournamentRewards: Record<string, string>;
  readonly redisBackups: Record<string, unknown>;
  readonly blitzKitLevels: Record<string, number>;
  readonly legacyRootStats: Record<string, number>;
  readonly stats: HypixelPlayerStats;
}
```

| Field                                                 | Notes                                                                                                                                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                                  | Internal Hypixel document id (raw `_id`).                                                                                                                                                                   |
| `uuid`                                                | Player UUID, `"UNKNOWN"` when absent.                                                                                                                                                                       |
| `nickname`                                            | Display name (raw `displayname`), `"UNKNOWN"` when absent.                                                                                                                                                  |
| `playerName`                                          | Raw `playername` value.                                                                                                                                                                                     |
| `staffRank`                                           | Raw `rank` (staff rank) value.                                                                                                                                                                              |
| `packageRank` / `newPackageRank`                      | Purchased rank fields.                                                                                                                                                                                      |
| `monthlyPackageRank` / `mostRecentMonthlyPackageRank` | Monthly (MVP++) rank fields.                                                                                                                                                                                |
| `networkExp`                                          | Network experience (raw, not a derived level).                                                                                                                                                              |
| `language`                                            | User language (raw `userLanguage`), `"ENGLISH"` when absent.                                                                                                                                                |
| `legacyLanguage`                                      | Legacy language field (raw `language`).                                                                                                                                                                     |
| `channel`                                             | Chat channel, `"ALL"` when absent.                                                                                                                                                                          |
| `giftsGrinch`                                         | Raw `gifts_grinch`.                                                                                                                                                                                         |
| `santaQuestStarted`                                   | Raw `SANTA_QUEST_STARTED`.                                                                                                                                                                                  |
| `mapVotes`                                            | Nested number map from raw `map_votes`.                                                                                                                                                                     |
| `questAutoActivate`                                   | Raw `questSettings.autoActivate`, falling back to `quest.autoActivate`.                                                                                                                                     |
| `chatEnabled`                                         | Raw `chat`.                                                                                                                                                                                                 |
| `claimedSoloBank`                                     | Map keyed by the suffix after `claimed_solo_bank_`.                                                                                                                                                         |
| `claimedCoopBankAt`                                   | Timestamp map keyed by the suffix after `claimed_coop_bank_`.                                                                                                                                               |
| `skyBlockFreeCookieAt`                                | Raw `skyblock_free_cookie` timestamp.                                                                                                                                                                       |
| `watchdogBlockedAt`                                   | Raw `watchdogBlockTimestamp`.                                                                                                                                                                               |
| `dailyTwoKExpAt`                                      | Raw `eugene.dailyTwoKExp` timestamp.                                                                                                                                                                        |
| `weeklyBoosterAt`                                     | Raw `eugene.weekly_booster` timestamp.                                                                                                                                                                      |
| `commandCooldowns`                                    | Timestamp map from the raw `cooldowns` object, one inner map per group.                                                                                                                                     |
| `christmasPresents`                                   | Boolean map of raw keys matching `xmas<year>_...`, keyed with the `xmas` prefix removed (for example `2019_...`). Replaces the old per-year `xmas2019` field.                                               |
| `challenges` / `compassStats`                         | Nested number maps from the raw fields of the same name.                                                                                                                                                    |
| `friendRequests`                                      | Raw `friendRequests` string list.                                                                                                                                                                           |
| `friendRequestsBlocked`                               | Raw `friendBlocksUuid` string list.                                                                                                                                                                         |
| `currentHat` / `currentIp`                            | Raw fields of the same name.                                                                                                                                                                                |
| `todo`                                                | Raw `TODO`.                                                                                                                                                                                                 |
| `giveDjFeather`                                       | Raw `give_dj_feather`.                                                                                                                                                                                      |
| `showTntRunActionbarInfo`                             | Raw `show_tntrun_actionbar_info`.                                                                                                                                                                           |
| `enableFireFlurry`                                    | Raw `enable_fire_flurry`.                                                                                                                                                                                   |
| `santaFinished`                                       | Raw `SANTA_FINISHED`.                                                                                                                                                                                       |
| `snowballFightIntro2019`                              | Raw `snowball_fight_intro_2019`.                                                                                                                                                                            |
| `multiTunnel`                                         | Raw `multiTunnel` string list.                                                                                                                                                                              |
| `pp`                                                  | Raw `pp`.                                                                                                                                                                                                   |
| `collectiblesMenuVisibilitySort`                      | Raw `collectibles_menu_visibility_sort`.                                                                                                                                                                    |
| `oneTimeAchievementMenuSortCompletionSort`            | Raw `onetime_achievement_menu_sort_completion_sort`.                                                                                                                                                        |
| `anniversaryBingoCard`                                | String-list map of the known bingo cell keys (`Rowone` through `Rowfive`, `Columnone` through `Columnfive`, `Diagonalone`, `Diagonaltwo`, `blackOut`); only cells present as arrays in the raw data appear. |
| `anniversaryNpcVisited`                               | Number-list map keyed by the four-digit year from raw `anniversaryNPCVisited<year>` keys.                                                                                                                   |
| `anniversaryNpcProgress`                              | Map keyed by the four-digit year from raw `anniversaryNPCProgress<year>` keys; raw values are passed through unchanged.                                                                                     |
| `upcomingLanguageReleases`                            | Map keyed by the suffix after `upcomingLanguageRelease_`; each entry holds its `logins` count.                                                                                                              |
| `aprilFoolsClicked`                                   | String-list map of raw keys starting with `aprilFoolsPlayerClicked_` or `aprilFoolsStaffClicked_`, keyed by the full raw key.                                                                               |
| `tournamentRewards`                                   | String map keyed by the suffix after `tournamentReward_`.                                                                                                                                                   |
| `redisBackups`                                        | Map of raw keys matching `redisBackup` plus an optional number suffix; raw values are passed through unchanged.                                                                                             |
| `blitzKitLevels`                                      | Number map of root-level raw keys matching `insane_<kit>` or `normal_<kit>`.                                                                                                                                |
| `legacyRootStats`                                     | Number map of the fixed legacy root keys `coins`, `deaths`, `forcefieldTime`, `kills`, `killstreaks`, `monthly_kills_b`, `shots_fired`, `weekly_kills_a`, and `wins`; only keys present as numbers appear.  |
| `stats`                                               | Per-game and SkyBlock statistics blocks (see [HypixelPlayerStats](#hypixelplayerstats)).                                                                                                                    |

### HypixelPlayerStats

Per-game and SkyBlock statistics container. Each field is the result of the corresponding game's parser and is `null` when that game's block is absent or empty in the raw stats. The per-game types are documented on their own pages and are not re-documented here.

```ts
export interface HypixelPlayerStats {
  readonly bedwars: BedWarsStats | null;
  readonly skywars: SkyWarsStats | null;
  readonly duels: DuelsStats | null;
  readonly arcade: ArcadeStats | null;
  readonly buildBattle: BuildBattleStats | null;
  readonly murderMystery: MurderMysteryStats | null;
  readonly tntGames: TNTGamesStats | null;
  readonly pit: PitStats | null;
  readonly megaWalls: MegaWallsStats | null;
  readonly blitz: BlitzStats | null;
  readonly uhc: UHCStats | null;
  readonly smashHeroes: SmashHeroesStats | null;
  readonly copsAndCrims: CopsAndCrimsStats | null;
  readonly paintball: PaintballStats | null;
  readonly quakecraft: QuakecraftStats | null;
  readonly vampireZ: VampireZStats | null;
  readonly walls: WallsStats | null;
  readonly warlords: WarlordsStats | null;
  readonly turboKartRacers: TurboKartRacersStats | null;
  readonly arenaBrawl: ArenaBrawlStats | null;
  readonly woolGames: WoolGamesStats | null;
  readonly speedUHC: SpeedUHCStats | null;
  readonly skyClash: SkyClashStats | null;
  readonly trueCombat: TrueCombatStats | null;
  readonly legacy: LegacyStats | null;
  readonly mainLobby: MainLobbyStats | null;
  readonly housing: HousingStats | null;
  readonly skyblock: SkyBlockStats | null;
}
```

Each per-game type is imported from its own module and documented on the corresponding API page:

| Field             | Type                   | Raw source           | Page                                            |
| ----------------- | ---------------------- | -------------------- | ----------------------------------------------- |
| `bedwars`         | `BedWarsStats`         | `stats.Bedwars`      | [BedWars](./modes/bedwars.md)                   |
| `skywars`         | `SkyWarsStats`         | `stats`              | [SkyWars](./modes/skywars.md)                   |
| `duels`           | `DuelsStats`           | `stats`              | [Duels](./modes/duels.md)                       |
| `arcade`          | `ArcadeStats`          | `stats`              | [Arcade](./modes/arcade.md)                     |
| `buildBattle`     | `BuildBattleStats`     | `stats`              | [Build Battle](./modes/buildbattle.md)          |
| `murderMystery`   | `MurderMysteryStats`   | `stats`              | [Murder Mystery](./modes/murdermystery.md)      |
| `tntGames`        | `TNTGamesStats`        | `stats`              | [TNT Games](./modes/tntgames.md)                |
| `pit`             | `PitStats`             | `stats`              | [The Pit](./modes/pit.md)                       |
| `megaWalls`       | `MegaWallsStats`       | `stats.Walls3`       | [Mega Walls](./modes/megawalls.md)              |
| `blitz`           | `BlitzStats`           | `stats`              | [Blitz SG](./modes/blitz.md)                    |
| `uhc`             | `UHCStats`             | `stats`              | [UHC](./modes/uhc.md)                           |
| `smashHeroes`     | `SmashHeroesStats`     | `stats.SuperSmash`   | [Smash Heroes](./modes/smashheroes.md)          |
| `copsAndCrims`    | `CopsAndCrimsStats`    | `stats`              | [Cops and Crims](./modes/copsandcrims.md)       |
| `paintball`       | `PaintballStats`       | `stats`              | [Paintball](./modes/paintball.md)               |
| `quakecraft`      | `QuakecraftStats`      | `stats`              | [Quakecraft](./modes/quakecraft.md)             |
| `vampireZ`        | `VampireZStats`        | `stats`              | [VampireZ](./modes/vampirez.md)                 |
| `walls`           | `WallsStats`           | `stats`              | [Walls](./modes/walls.md)                       |
| `warlords`        | `WarlordsStats`        | `stats.Battleground` | [Warlords](./modes/warlords.md)                 |
| `turboKartRacers` | `TurboKartRacersStats` | `stats.GingerBread`  | [Turbo Kart Racers](./modes/turbokartracers.md) |
| `arenaBrawl`      | `ArenaBrawlStats`      | `stats`              | [Arena Brawl](./modes/arenabrawl.md)            |
| `woolGames`       | `WoolGamesStats`       | `stats.WoolGames`    | [Wool Games](./modes/woolgames.md)              |
| `speedUHC`        | `SpeedUHCStats`        | `stats.SpeedUHC`     | [Speed UHC](./modes/speeduhc.md)                |
| `skyClash`        | `SkyClashStats`        | `stats.SkyClash`     | [SkyClash](./modes/skyclash.md)                 |
| `trueCombat`      | `TrueCombatStats`      | `stats.TrueCombat`   | True Combat                                     |
| `legacy`          | `LegacyStats`          | `stats.Legacy`       | [Legacy](./modes/legacy.md)                     |
| `mainLobby`       | `MainLobbyStats`       | `stats.MainLobby`    | [Main Lobby](./modes/mainlobby.md)              |
| `housing`         | `HousingStats`         | `stats.Housing`      | [Housing](./modes/housing.md)                   |
| `skyblock`        | `SkyBlockStats`        | `stats.SkyBlock`     | [SkyBlock](#skyblockstats) (below)              |

---

## Top-level value blocks

### HypixelPlayerCachedData

Cached server-side values.

```ts
export interface HypixelPlayerCachedData {
  readonly superstarMonths: HypixelPlayerCachedSuperstarMonths;
}
```

### HypixelPlayerCachedSuperstarMonths

Cached MVP++ (superstar) month count with its last-update timestamp.

```ts
export interface HypixelPlayerCachedSuperstarMonths {
  readonly value: number;
  readonly lastUpdatedAt: Date | null;
}
```

Note: `lastUpdatedAt` maps from raw `lastUpdated`.

### HypixelPlayerSkyBlockExtra

Miscellaneous SkyBlock-related top-level values.

```ts
export interface HypixelPlayerSkyBlockExtra {
  readonly ozanneCoins: number;
}
```

Note: read from raw `skyblock_extra.ozanne_coins`.

### HypixelPlayerFlashingSale

Flashing-sale popup interaction counters.

```ts
export interface HypixelPlayerFlashingSale {
  readonly clicks: number;
  readonly opens: number;
  readonly poppedUp: number;
  readonly lastPopupAt: Date | null;
}
```

Note: read from raw `flashingSaleClicks`, `flashingSaleOpens`, `flashingSalePoppedUp`, and `flashingSalePopup`.

### HypixelPlayerFlashingNews

Flashing-news popup interaction counters.

```ts
export interface HypixelPlayerFlashingNews {
  readonly opens: number;
  readonly poppedUp: number;
  readonly popup: readonly string[];
}
```

Note: read from raw `flashingNewsOpens`, `flashingNewsPoppedUp`, and `flashingNewsPopup`.

### HypixelPlayerSkin

Skin state block (read from the raw `skin` object).

```ts
export interface HypixelPlayerSkin {
  readonly timeoutStartAt: Date | null;
  readonly value: string;
}
```

Note: `timeoutStartAt` maps from raw `skin.timeoutStart`; `value` from raw `skin.value`.

### HypixelPlayerPlotResets

Housing plot reset record (read from the raw `plotResets` object).

```ts
export interface HypixelPlayerPlotResets {
  readonly at: Date | null;
  readonly uuid: string;
}
```

Note: `at` maps from raw `plotResets.time`.

### HypixelPlayerSpectatorSettings

Spectator mode preferences.

```ts
export interface HypixelPlayerSpectatorSettings {
  readonly invisible: boolean;
  readonly firstPerson: boolean;
  readonly alwaysFlying: boolean;
  readonly autoTeleport: boolean;
}
```

Note: read from raw `spectators_invisible`, `spec_first_person`, `spec_always_flying`, and `spec_auto_teleport`.

### HypixelPlayerKits

Kit shop preferences (read from the raw `kits` object).

```ts
export interface HypixelPlayerKits {
  readonly kitShopSorting: {
    readonly ownedFirst: boolean;
    readonly currentSort: string;
  };
}
```

Note: read from raw `kits.kitShopSorting.ownedFirst` and `kits.kitShopSorting.currentSort`.

### HypixelPlayerLeveling

Network leveling reward claim state.

```ts
export interface HypixelPlayerLeveling {
  readonly claimedRewards: readonly number[];
}
```

### HypixelPlayerAnniversary

Anniversary NPC progress for the 2020 event.

```ts
export interface HypixelPlayerAnniversary {
  readonly npcProgress2020: number;
  readonly npcVisited2020: readonly number[];
}
```

Note: read from raw `anniversaryNPCProgress2020` and `anniversaryNPCVisited2020`. Other years are exposed through the root `anniversaryNpcProgress` and `anniversaryNpcVisited` maps.

### HypixelPlayerCooldowns

Open-ended map of per-event cooldown families. The outer key is a raw cooldown family name with its trailing `Cooldowns` or `Cooldowns2` suffix stripped; the inner value is a `Record<string, boolean>` keyed by the raw cooldown identifiers. Only families present in the raw data appear.

```ts
export type HypixelPlayerCooldowns = Record<string, Record<string, boolean>>;
```

### HypixelPlayerRankPurchase

Timestamps of when each rank was purchased / leveled up to.

```ts
export interface HypixelPlayerRankPurchase {
  readonly noneAt: Date | null;
  readonly vipAt: Date | null;
  readonly vipPlusAt: Date | null;
  readonly mvpAt: Date | null;
  readonly mvpPlusAt: Date | null;
}
```

Note: these map from raw `levelUp_NONE`, `levelUp_VIP`, `levelUp_VIP_PLUS`, `levelUp_MVP`, and `levelUp_MVP_PLUS`.

---

## Achievements

### HypixelPlayerAchievements

Achievement points, rewards, tracking, and totem state.

```ts
export interface HypixelPlayerAchievements {
  readonly points: number;
  readonly rewards: Record<string, number>;
  readonly tracking: readonly string[];
  readonly trackingHideMessages: boolean;
  readonly tiered: Record<string, number>;
  readonly oneTime: readonly string[];
  readonly oneTimeMenuSort: string;
  readonly oneTimeMenuSortCompletedFirst: boolean;
  readonly tieredMenuSort: string;
  readonly sync: Record<string, number>;
  readonly totem: HypixelPlayerAchievementsTotem;
}
```

| Field                           | Notes                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `points`                        | From `achievements._legacy_achievement_points`, falling back to `achievementPoints`. |
| `rewards`                       | Reward map keyed by the suffix after `for_points_`.                                  |
| `tracking`                      | List of currently tracked achievements (raw `achievementTracking`).                  |
| `trackingHideMessages`          | Raw `achievementTrackingHideMessages`.                                               |
| `tiered`                        | Tiered achievement progress map (raw `achievements`).                                |
| `oneTime`                       | List of unlocked one-time achievements (raw `achievementsOneTime`).                  |
| `oneTimeMenuSort`               | Raw `onetime_achievement_menu_sort`.                                                 |
| `oneTimeMenuSortCompletedFirst` | Raw `onetime_achievement_menu_sort_completed_first`.                                 |
| `tieredMenuSort`                | Raw `tiered_achievement_menu_sort`.                                                  |
| `sync`                          | Achievement sync map (raw `achievementSync`).                                        |
| `totem`                         | Totem customization state.                                                           |

### HypixelPlayerAchievementsTotem

Totem of corruption customization state.

```ts
export interface HypixelPlayerAchievementsTotem {
  readonly canCustomize: boolean;
  readonly allowedMaxHeight: number;
  readonly unlockedParts: readonly string[];
  readonly selectedParts: Record<string, string>;
  readonly unlockedColors: readonly string[];
  readonly selectedColors: Record<string, string>;
}
```

Note: `allowedMaxHeight` maps from raw `allowed_max_height`.

---

## Cosmetics and pets

### HypixelPlayerCosmetics

Cosmetic selections, vanity state, and pets.

```ts
export interface HypixelPlayerCosmetics {
  readonly menuSort: string;
  readonly rankPlusColor: string;
  readonly monthlyRankColor: string;
  readonly selectedGadget: string;
  readonly gadget: string;
  readonly selectedParticlePack: string;
  readonly clickEffect: string;
  readonly cloak: string;
  readonly customCloakBase64: string;
  readonly emote: string;
  readonly disguise: string;
  readonly transformation: string;
  readonly wardrobe: string;
  readonly outfit: Record<string, string>;
  readonly boxesConvertedToday: number;
  readonly firstBoxConvertedAt: Date | null;
  readonly boxesCraftedToday: number;
  readonly firstBoxCraftedAt: Date | null;
  readonly packages: readonly string[];
  readonly pets: HypixelPlayerPets;
}
```

| Field                  | Notes                                    |
| ---------------------- | ---------------------------------------- |
| `menuSort`             | Raw `collectibles_menu_sort`.            |
| `selectedGadget`       | Raw `currentGadget`.                     |
| `selectedParticlePack` | Raw `particlePack`.                      |
| `clickEffect`          | Raw `currentClickEffect`.                |
| `cloak`                | Raw `currentCloak`.                      |
| `customCloakBase64`    | Raw `customCloakBase64`.                 |
| `emote`                | Raw `currentEmote`.                      |
| `boxesConvertedToday`  | Raw `vanityConvertedBoxToday`.           |
| `firstBoxConvertedAt`  | Raw `vanityFirstConvertedBox` timestamp. |
| `boxesCraftedToday`    | Raw `vanityCraftedBoxToday`.             |
| `firstBoxCraftedAt`    | Raw `vanityFirstCraftedBox` timestamp.   |
| `packages`             | Raw `vanityMeta.packages`.               |

### HypixelPlayerPets

Pet container: current pet, favorites, consumables, and owned pets.

```ts
export interface HypixelPlayerPets {
  readonly currentPet: string;
  readonly favorites: string;
  readonly autoSpawn: boolean;
  readonly active: boolean;
  readonly lastJourneyAt: Date | null;
  readonly lastUpdatedAt: Date | null;
  readonly consumables: HypixelPlayerPetConsumables;
  readonly owned: readonly HypixelPlayerPet[];
}
```

Note: `favorites` maps from raw `vanityFavorites`; `autoSpawn` from raw `auto_spawn_pet`; `active` from raw `petActive`; `lastJourneyAt` from raw `petJourneyTimestamp`; `lastUpdatedAt` from raw `petUpdate`. `owned` is built from the union of each `vanityMeta.packages` entry starting with `pet_` and each key under raw `petStats` (lowercased), so pets that only appear in `petStats` are included too.

### HypixelPlayerPet

A single owned pet with its stats.

```ts
export interface HypixelPlayerPet {
  readonly name: string;
  readonly nickname: string;
  readonly experience: number;
  readonly hunger: number;
  readonly lastFedAt: Date | null;
  readonly thirst: number;
  readonly lastDrankAt: Date | null;
  readonly exercise: number;
  readonly lastExercisedAt: Date | null;
}
```

| Field             | Notes                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| `name`            | Pet package id with the `pet_` prefix removed, or the `petStats` key lowercased. |
| `nickname`        | Raw `petStats.<NAME>.name`.                                                      |
| `hunger`          | Raw `petStats.<NAME>.HUNGER.value`.                                              |
| `lastFedAt`       | Raw `petStats.<NAME>.HUNGER.timestamp`.                                          |
| `thirst`          | Raw `petStats.<NAME>.THIRST.value`.                                              |
| `lastDrankAt`     | Raw `petStats.<NAME>.THIRST.timestamp`.                                          |
| `exercise`        | Raw `petStats.<NAME>.EXERCISE.value`.                                            |
| `lastExercisedAt` | Raw `petStats.<NAME>.EXERCISE.timestamp`.                                        |

### HypixelPlayerPetConsumables

Counts of each pet consumable item.

```ts
export interface HypixelPlayerPetConsumables {
  readonly cake: number;
  readonly cookie: number;
  readonly feather: number;
  readonly goldRecord: number;
  readonly hayBlock: number;
  readonly lavaBucket: number;
  readonly leash: number;
  readonly magmaCream: number;
  readonly melon: number;
  readonly milkBucket: number;
  readonly mushroomSoup: number;
  readonly pork: number;
  readonly pumpkinPie: number;
  readonly rawFish: number;
  readonly slimeBall: number;
  readonly stick: number;
  readonly waterBucket: number;
  readonly woodSword: number;
  readonly apple: number;
  readonly bakedPotato: number;
  readonly cookedBeef: number;
  readonly redRose: number;
  readonly wheat: number;
  readonly bread: number;
  readonly carrot: number;
  readonly rottenFlesh: number;
  readonly bone: number;
}
```

Note: `carrot` maps from the raw `CARROT_ITEM` field; all other fields map from the uppercase item id (`CAKE`, `COOKIE`, `GOLD_RECORD`, and so on).

---

## Rewards, gifting, and crates

### HypixelPlayerRewards

Daily reward streak and crate state.

```ts
export interface HypixelPlayerRewards {
  readonly rewardTokens: number;
  readonly lastAdsenseGenerateTimeAt: Date | null;
  readonly lastClaimedReward: number;
  readonly rewardHighScore: number;
  readonly rewardScore: number;
  readonly rewardStreak: number;
  readonly rewardConsumed: boolean;
  readonly totalDailyRewards: number;
  readonly totalRewards: number;
  readonly monthlyCrates: readonly HypixelPlayerMonthlyCrate[];
  readonly dmCrates: readonly HypixelPlayerMonthlyCrate[];
}
```

| Field           | Notes                                                     |
| --------------- | --------------------------------------------------------- |
| `rewardTokens`  | Token balance (raw `adsense_tokens`).                     |
| `monthlyCrates` | One entry per key in raw `monthlycrates`, keyed by month. |
| `dmCrates`      | One entry per raw key starting with `dmcrates-`.          |

### HypixelPlayerMonthlyCrate

A single monthly or DM crate, keyed by date string, with a flag per rank tier.

```ts
export interface HypixelPlayerMonthlyCrate {
  readonly date: string;
  readonly regular: boolean;
  readonly vip: boolean;
  readonly vipPlus: boolean;
  readonly mvp: boolean;
  readonly mvpPlus: boolean;
}
```

Note: `regular` is `true` when either the raw `REGULAR` or `NORMAL` flag is set.

### HypixelPlayerGifting

Gifting and bundle statistics (read from raw `giftingMeta`).

```ts
export interface HypixelPlayerGifting {
  readonly bundlesReceived: number;
  readonly realBundlesReceived: number;
  readonly realBundlesReceivedInc: number;
  readonly bundlesGiven: number;
  readonly realBundlesGiven: number;
  readonly giftsGiven: number;
  readonly ranksGiven: number;
  readonly milestones: readonly string[];
  readonly rankGiftingMilestones: readonly string[];
}
```

Note: `rankGiftingMilestones` maps from raw `rankgiftingmilestones`.

---

## Social media and housing

### HypixelPlayerSocialMedia

Linked social media handles plus a raw verification map.

```ts
export interface HypixelPlayerSocialMedia {
  readonly discord: string;
  readonly youtube: string;
  readonly twitch: string;
  readonly hypixel: string;
  readonly twitter: string;
  readonly instagram: string;
  readonly tiktok: string;
  readonly prompt: boolean;
  readonly verification: Record<string, string>;
}
```

The named handle fields come from `socialMedia.links`; `prompt` comes from `socialMedia.prompt`; `verification` contains every other string-valued key under `socialMedia` (excluding `links`).

### HypixelPlayerHousing

Housing meta: unlocked content, settings, and given-cookie history (read from raw `housingMeta`).

```ts
export interface HypixelPlayerHousing {
  readonly allowedBlocks: readonly string[];
  readonly packages: readonly string[];
  readonly tutorialStage: string;
  readonly playlist: string;
  readonly plotSize: string;
  readonly firstHouseJoinAt: Date | null;
  readonly visibilityDisabled: boolean;
  readonly selectedChannels: readonly string[];
  readonly playerSettings: Record<string, string>;
  readonly givenCookies: readonly HypixelPlayerGivenCookies[];
}
```

Note: `tutorialStage` maps from raw `tutorialStep`; `firstHouseJoinAt` from raw `firstHouseJoinMs`; `selectedChannels` from raw `selectedChannels_v3`.

### HypixelPlayerGivenCookies

A given-cookies record for a single date, listing the houses cookies were given to.

```ts
export interface HypixelPlayerGivenCookies {
  readonly date: string;
  readonly houses: readonly string[];
}
```

One entry is produced per raw key starting with `given_cookies_`; `date` is the suffix after that prefix.

---

## Quests and parkour

### HypixelPlayerQuest

A quest with its active-run state and completion history.

```ts
export interface HypixelPlayerQuest {
  readonly name: string;
  readonly startedAt: Date | null;
  readonly objectives: Record<string, number>;
  readonly completions: readonly HypixelPlayerQuestCompletion[];
}
```

Note: `startedAt` maps from the raw `active.started` timestamp; `objectives` is a number map from raw `active.objectives`.

### HypixelPlayerQuestCompletion

A single quest completion timestamp.

```ts
export interface HypixelPlayerQuestCompletion {
  readonly completedAt: Date | null;
}
```

Note: `completedAt` is derived from the raw completion entry's `time` field.

### HypixelPlayerParkour

A parkour run record for one location.

```ts
export interface HypixelPlayerParkour {
  readonly location: string;
  readonly timeStart: number;
  readonly timeTook: number;
  readonly checkpoints: readonly number[];
}
```

| Field         | Notes                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `location`    | Parkour location key. Locations are the union of the keys under raw `parkourCompletions` and `parkourCheckpointBests`, so a location with only checkpoint bests (no completed run) still appears. |
| `timeStart`   | Start time of the first recorded run (`0` when the location has no completions).                                                                                                                  |
| `timeTook`    | Duration of the first recorded run (`0` when the location has no completions).                                                                                                                    |
| `checkpoints` | Best checkpoint times from `parkourCheckpointBests` for the location.                                                                                                                             |

---

## Advent rewards and seasonal events

### HypixelPlayerAdventRewards

Advent calendar reward claims for a given year.

```ts
export interface HypixelPlayerAdventRewards {
  readonly year: number;
  readonly days: readonly HypixelPlayerAdventDay[];
}
```

Top-level entries come from raw keys starting with `adventRewards`; the four-digit year is parsed from the key (`0` when none is found). `days` always contains 25 entries (day 1 through day 25).

### HypixelPlayerAdventDay

A single advent calendar day claim.

```ts
export interface HypixelPlayerAdventDay {
  readonly day: number;
  readonly claimedAt: Date | null;
}
```

Note: `claimedAt` is read from the raw `day<N>` field.

### HypixelPlayerSeasonal

Seasonal event data: silver balance, event shop sorting, and one list per seasonal event family.

```ts
export interface HypixelPlayerSeasonal {
  readonly silver: number;
  readonly eventShopSorting: HypixelPlayerSeasonalEventShopSorting;
  readonly christmas: readonly HypixelPlayerSeasonalEvent[];
  readonly easter: readonly HypixelPlayerSeasonalEvent[];
  readonly halloween: readonly HypixelPlayerSeasonalEvent[];
  readonly summer: readonly HypixelPlayerSeasonalEvent[];
  readonly anniversary: readonly HypixelPlayerSeasonalEvent[];
  readonly christmasAdventRewards: readonly HypixelPlayerAdventRewards[];
}
```

Each event-family list (`christmas`, `easter`, `halloween`, `summer`, `anniversary`) is read from `seasonal.<family>`, with one `HypixelPlayerSeasonalEvent` per year key. `christmasAdventRewards` is built from `seasonal.christmas`, one entry per year, each with its 25 advent days read from that year's `adventRewards`.

### HypixelPlayerSeasonalEventShopSorting

Seasonal event-shop sort preference.

```ts
export interface HypixelPlayerSeasonalEventShopSorting {
  readonly currentSort: string;
  readonly ownedFirst: boolean;
}
```

### HypixelPlayerSeasonalEvent

A single seasonal event for one year within an event family.

```ts
export interface HypixelPlayerSeasonalEvent {
  readonly year: string;
  readonly experience: number;
  readonly adventRewards: Record<string, number>;
  readonly presents: Record<string, boolean>;
  readonly completedHolidayQuests: number;
  readonly bedWarsWinsAchievement: number;
  readonly duelsWinsAchievement: number;
  readonly skyBlockAlchemistIntro: boolean;
  readonly eggs: Record<string, boolean>;
  readonly mainLobbyEgghunt: Record<string, boolean>;
  readonly candyHuntBaskets: readonly number[];
  readonly bingoPinned: string;
  readonly bingo: Record<string, Record<string, number>>;
}
```

| Field                    | Notes                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| `year`                   | The raw year key for this event.                                   |
| `experience`             | Raw `levelling.experience`.                                        |
| `adventRewards`          | Number map from raw `adventRewards`.                               |
| `presents`               | Boolean map from raw `presents`.                                   |
| `completedHolidayQuests` | Raw `completed_holiday_quests`.                                    |
| `eggs`                   | Boolean map from raw `egghunt.eggs`.                               |
| `mainLobbyEgghunt`       | Boolean map keyed by the suffix after `mainlobby_egghunt_`.        |
| `candyHuntBaskets`       | Number list from raw `candyhunt.baskets`.                          |
| `bingoPinned`            | Raw `bingo.pinned`.                                                |
| `bingo`                  | Per-bingo-card map; each card maps to its `objectives` number map. |

---

## Scorpius, tourney, fireworks, and friends

### HypixelPlayerScorpiusBribe

A Scorpius bribe claim for a given year.

```ts
export interface HypixelPlayerScorpiusBribe {
  readonly year: number;
  readonly claimedAt: Date | null;
}
```

One entry is produced per raw key starting with `scorpius_bribe_`; `year` is parsed from the suffix (`0` when not numeric).

### HypixelPlayerTourney

Tournament meta: first lobby join, total tributes, and per-tournament entries (read from raw `tourney`).

```ts
export interface HypixelPlayerTourney {
  readonly firstJoinLobbyAt: Date | null;
  readonly totalTributes: number;
  readonly entries: readonly HypixelPlayerTournamentEntry[];
}
```

Note: `firstJoinLobbyAt` maps from raw `first_join_lobby`; `totalTributes` from raw `total_tributes`. `entries` is built from every object-valued key under `tourney`.

### HypixelPlayerTournamentEntry

A single tournament entry, keyed by the raw tournament key.

```ts
export interface HypixelPlayerTournamentEntry {
  readonly key: string;
  readonly gamesPlayed: number;
  readonly playtime: number;
  readonly tributesEarned: number;
  readonly firstWinAt: Date | null;
  readonly firstGameAt: Date | null;
  readonly claimedRankingRewardAt: Date | null;
  readonly seenRewardBook: boolean;
}
```

| Field                    | Notes                         |
| ------------------------ | ----------------------------- |
| `gamesPlayed`            | Raw `games_played`.           |
| `tributesEarned`         | Raw `tributes_earned`.        |
| `firstWinAt`             | Raw `first_win` timestamp.    |
| `firstGameAt`            | Raw `first_game` timestamp.   |
| `claimedRankingRewardAt` | Raw `claimed_ranking_reward`. |
| `seenRewardBook`         | Raw `seenRPbook`.             |

### HypixelPlayerFirework

A stored firework configuration (from raw `fireworkStorage`).

```ts
export interface HypixelPlayerFirework {
  readonly flightDuration: number;
  readonly shape: string;
  readonly trail: boolean;
  readonly twinkle: boolean;
  readonly colors: string;
  readonly fadeColors: string;
  readonly selected: boolean;
}
```

Note: `flightDuration` maps from raw `flight_duration` and `fadeColors` from raw `fade_colors`.

---

## SkyBlock pointer block

### SkyBlockStats

The per-player SkyBlock pointer block (raw `stats.SkyBlock`). Parsed by `parseSkyBlockStats`, which returns `null` when the raw block is empty. This block only points at the player's SkyBlock profiles; full profile data lives behind the SkyBlock profile API, not here.

```ts
export interface SkyBlockStats {
  readonly profiles: Record<string, SkyBlockStatsProfile>;
}
```

`profiles` is keyed by raw profile id, containing one entry per object-valued profile under raw `profiles`.

### SkyBlockStatsProfile

A single SkyBlock profile pointer.

```ts
export interface SkyBlockStatsProfile {
  readonly profileId: string;
  readonly cuteName: string;
}
```

Note: `profileId` maps from raw `profile_id` and `cuteName` from raw `cute_name`.
