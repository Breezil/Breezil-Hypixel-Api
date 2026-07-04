# SkyWars

The SkyWars parser turns a player's raw `stats.SkyWars` block into a readonly, fully-typed `SkyWarsStats` object. Every field mirrors the raw Hypixel API one-to-one: there are no ratios, levels-from-xp, or other derived values.

## parseSkyWars

Parses a player's SkyWars stats (`stats.SkyWars`) into a typed object.

```ts
function parseSkyWars(stats: Record<string, unknown>): SkyWarsStats | null;
```

Returns `null` when the `SkyWars` block is absent or empty (no keys). Otherwise it returns a fully-populated `SkyWarsStats`. Missing scalar fields fall back to their safe defaults (`0` for numbers, `""` for strings, `false` for booleans), absent nested objects become empty objects/maps, absent arrays become empty arrays, and absent date fields become `null`.

## Returned type tree

### SkyWarsStats

The root object returned by `parseSkyWars`.

```ts
interface SkyWarsStats {
  readonly coins: number;
  readonly tokens: number;
  readonly experience: number;
  readonly experiencePending: number;
  readonly levelFormatted: string;
  readonly levelFormattedWithBrackets: string;
  readonly hideLevel: boolean;
  readonly lastPrestigeUnlocked: string;
  readonly activeScheme: string;
  readonly activeEmblem: string;
  readonly kitsMaxPrestige: string;
  readonly lowestLevelRewardsReceived: number;
  readonly gamesPlayedTotal: number;
  readonly headsCollected: number;
  readonly souls: number;
  readonly soulWell: number;
  readonly soulsGathered: number;
  readonly paidSouls: number;
  readonly soulWellRares: number;
  readonly soulWellLegendaries: number;
  readonly usedSoulWell: boolean;
  readonly angelOfDeathLevel: number;
  readonly refillChestDestroy: number;
  readonly harvestingSeason: number;
  readonly xezbethLuck: number;
  readonly extraWheels: number;
  readonly quits: number;
  readonly beastChance: number;
  readonly shardSeeker: number;
  readonly opals: number;
  readonly opalRollback: Date | null;
  readonly highestKillstreak: number;
  readonly highestWinstreak: number;
  readonly lastMode: string;
  readonly lastTourneyAd: number;
  readonly freeLootChestNpc: Date | null;
  readonly selectedPrestigeIcon: string;
  readonly shopSort: string;
  readonly shopSortOwnedFirst: boolean;
  readonly luckyBlockResourcePackEnabled: boolean;
  readonly combatTracker: boolean;
  readonly activeKillEffect: string;
  readonly activeVictoryDance: string;
  readonly activeKillMessages: string;
  readonly activeDeathCry: string;
  readonly activeBalloon: string;
  readonly activeCage: string;
  readonly activeSprays: string;
  readonly activeProjectileTrail: string;
  readonly selectedCosmetics: SkyWarsSelectedCosmetics;
  readonly activeKits: SkyWarsActiveKits;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly chests: number;
  readonly chestHistory: readonly string[];
  readonly chestHistoryNew: readonly string[];
  readonly chestRarities: SkyWarsChestRarities;
  readonly halloweenBoxes: number;
  readonly christmasBoxes: number;
  readonly lunarBoxes: number;
  readonly easterBoxes: number;
  readonly mysteryBoxesSeasonOne: number;
  readonly packages: readonly string[];
  readonly favoriteKits: Readonly<Record<string, readonly string[]>>;
  readonly headCollection: SkyWarsHeadCollection;
  readonly challengeAttemptsTotal: number;
  readonly challengeWinsTotal: number;
  readonly challengeMilestonesAchieved: number;
  readonly challengeAttempts: Readonly<Record<string, number>>;
  readonly challengeWins: Readonly<Record<string, number>>;
  readonly labWins: Readonly<Record<string, number>>;
  readonly votes: Readonly<Record<string, number>>;
  readonly explainedFlags: Readonly<Record<string, number>>;
  readonly presentsCaps: Readonly<Record<string, number>>;
  readonly freeEventKeys: Readonly<Record<string, boolean>>;
  readonly megaKitLevels: Readonly<Record<string, number>>;
  readonly kitInventories: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly brewery: SkyWarsBrewery;
  readonly breweryActive: string;
  readonly settings: SkyWarsSettings;
  readonly leaderboardSettings: SkyWarsLeaderboardSettings;
  readonly rankedSeasonRatings: Readonly<
    Record<string, SkyWarsRankedSeasonRating>
  >;
  readonly privateGames: SkyWarsPrivateGameSettings;
  readonly overall: SkyWarsModeStats;
  readonly solo: SkyWarsSoloStats;
  readonly teams: SkyWarsTeamsStats;
  readonly mega: SkyWarsMegaStats;
  readonly mini: SkyWarsMiniStats;
  readonly ranked: SkyWarsRankedStats;
  readonly lab: SkyWarsLabStats;
  readonly tourney: SkyWarsTourneyStats;
  readonly crazyTourney: SkyWarsCrazyTourneyStats;
  readonly tourneyInstances: Readonly<Record<string, SkyWarsModeStats>>;
  readonly soloPerks: SkyWarsModePerks;
  readonly teamsPerks: SkyWarsModePerks;
  readonly megaPerks: SkyWarsModePerks;
  readonly rankedPerks: SkyWarsModePerks;
  readonly universalPerks: SkyWarsUniversalPerks;
  readonly universalPerkToggles: Readonly<Record<string, boolean>>;
  readonly perkSlots: SkyWarsPerkSlots;
  readonly disabledPerks: Readonly<Record<string, readonly string[]>>;
  readonly mythicKits: SkyWarsMythicKits;
  readonly perKit: Readonly<Record<string, SkyWarsKitStats>>;
}
```

Notable top-level fields:

| Field                                                | Meaning                                                                                                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coins`                                              | SkyWars coin balance                                                                                                                                                    |
| `tokens`                                             | Cosmetic token balance                                                                                                                                                  |
| `experience` / `experiencePending`                   | Raw SkyWars XP and pending XP                                                                                                                                           |
| `levelFormatted` / `levelFormattedWithBrackets`      | Pre-formatted level strings as supplied by the API                                                                                                                      |
| `souls` / `soulWell` / `paidSouls`                   | Soul economy counters                                                                                                                                                   |
| `opalRollback` / `freeLootChestNpc` / `opalRollback` | Epoch-ms timestamps surfaced as `Date                                   \| null`                                                                                        |
| `chestHistory` / `chestHistoryNew`                   | Raw chest history string lists                                                                                                                                          |
| `favoriteKits`                                       | Map keyed by the suffix after `favorite_kits_`, value is a string array                                                                                                 |
| `tourneyInstances`                                   | Map keyed by tourney instance id (derived from `tourney_<id>_wins`)                                                                                                     |
| `perKit`                                             | Map keyed by kit id (every `*_kit_*` key except mythical kits)                                                                                                          |
| `universalPerkToggles`                               | Map keyed by toggle id (every `toggle_*` raw key except the `solo_`/`team_`/`mega_`/`ranked_` mode prefixes), value is `true` only when the raw value is exactly `true` |

The dynamic maps above are collected by scanning the raw keys; their keys are the captured portions of the matching patterns and never include synthetic or computed entries.

### SkyWarsModeStats

The per-mode statistics block reused across every SkyWars mode. The dedicated mode interfaces below all extend this shape.

```ts
interface SkyWarsModeStats {
  readonly wins: number;
  readonly losses: number;
  readonly gamesPlayed: number;
  readonly timePlayed: number;
  readonly winStreak: number;
  readonly legacyWinStreak: number;
  readonly survivedPlayers: number;
  readonly chestsOpened: number;
  readonly killstreak: number;
  readonly longestBowKill: number;
  readonly fastestWin: number;
  readonly assists: number;
  readonly mostKillsGame: number;
  readonly longestBowShot: number;
  readonly arrowsHit: number;
  readonly arrowsShot: number;
  readonly shard: number;
  readonly blocksBroken: number;
  readonly blocksPlaced: number;
  readonly eggsThrown: number;
  readonly enderpearlsThrown: number;
  readonly itemsEnchanted: number;
  readonly quits: number;
  readonly coins: number;
  readonly coinsGained: number;
  readonly souls: number;
  readonly soulsGathered: number;
  readonly refillChestDestroy: number;
  readonly kills: SkyWarsKillsByType;
  readonly deaths: number;
  readonly fallKills: number;
  readonly mobsKilled: number;
  readonly heads: SkyWarsHeadsByType;
}
```

Note: `winStreak` maps the raw `win_streak` field and `legacyWinStreak` maps the raw `winstreak` field; both are kept separately as they appear in the API.

### SkyWarsKillsByType

Kill counts broken down by source, nested under each `SkyWarsModeStats.kills`.

```ts
interface SkyWarsKillsByType {
  readonly total: number;
  readonly melee: number;
  readonly void: number;
  readonly bow: number;
  readonly mob: number;
}
```

### SkyWarsHeadsByType

Collected-head counts broken down by head rarity name, nested under each `SkyWarsModeStats.heads`.

```ts
interface SkyWarsHeadsByType {
  readonly total: number;
  readonly tasty: number;
  readonly yucky: number;
  readonly eww: number;
  readonly salty: number;
  readonly divine: number;
  readonly heavenly: number;
  readonly decent: number;
  readonly meh: number;
  readonly succulent: number;
  readonly sweet: number;
  readonly ethereal: number;
  readonly indescribable: number;
}
```

### SkyWarsSoloStats

Solo mode stats, extending `SkyWarsModeStats` with its difficulty sub-modes.

```ts
interface SkyWarsSoloStats extends SkyWarsModeStats {
  readonly normal: SkyWarsModeStats;
  readonly insane: SkyWarsModeStats;
}
```

### SkyWarsTeamsStats

Teams mode stats, extending `SkyWarsModeStats` with difficulty and legacy team sub-modes.

```ts
interface SkyWarsTeamsStats extends SkyWarsModeStats {
  readonly normal: SkyWarsModeStats;
  readonly insane: SkyWarsModeStats;
  readonly teamsNormal: SkyWarsModeStats;
  readonly teamsInsane: SkyWarsModeStats;
}
```

### SkyWarsMegaStats

Mega mode stats, extending `SkyWarsModeStats` with doubles and normal sub-modes.

```ts
interface SkyWarsMegaStats extends SkyWarsModeStats {
  readonly doubles: SkyWarsModeStats;
  readonly doublesNormal: SkyWarsModeStats;
  readonly normal: SkyWarsModeStats;
}
```

### SkyWarsMiniStats

Mini mode stats, extending `SkyWarsModeStats` with its normal sub-mode.

```ts
interface SkyWarsMiniStats extends SkyWarsModeStats {
  readonly normal: SkyWarsModeStats;
}
```

### SkyWarsRankedStats

Ranked mode stats, extending `SkyWarsModeStats` with its normal sub-mode.

```ts
interface SkyWarsRankedStats extends SkyWarsModeStats {
  readonly normal: SkyWarsModeStats;
}
```

### SkyWarsLabStats

Lab mode stats, extending `SkyWarsModeStats` with solo and team sub-modes.

```ts
interface SkyWarsLabStats extends SkyWarsModeStats {
  readonly solo: SkyWarsModeStats;
  readonly team: SkyWarsModeStats;
}
```

### SkyWarsTourneyStats

Tourney mode stats, extending `SkyWarsModeStats` with crazy and teams tourney sub-modes.

```ts
interface SkyWarsTourneyStats extends SkyWarsModeStats {
  readonly crazyTourney: SkyWarsModeStats;
  readonly teamsTourney: SkyWarsModeStats;
}
```

### SkyWarsCrazyTourneyStats

Crazy tourney mode stats, extending `SkyWarsModeStats` with its normal sub-mode.

```ts
interface SkyWarsCrazyTourneyStats extends SkyWarsModeStats {
  readonly normal: SkyWarsModeStats;
}
```

### SkyWarsKitStats

Per-kit stats, used as the value type of `SkyWarsStats.perKit`.

```ts
interface SkyWarsKitStats {
  readonly experience: number;
  readonly autoEquipArmor: boolean;
  readonly overall: SkyWarsModeStats;
  readonly lab: SkyWarsModeStats;
  readonly tourney: SkyWarsModeStats;
}
```

### SkyWarsMythicKits

The fixed set of mythic kits, nested under `SkyWarsStats.mythicKits`.

```ts
interface SkyWarsMythicKits {
  readonly chronobreaker: SkyWarsMythicKitStats;
  readonly netherLord: SkyWarsMythicKitStats;
  readonly endLord: SkyWarsMythicKitStats;
  readonly monsterTrainer: SkyWarsMythicKitStats;
  readonly cryomancer: SkyWarsMythicKitStats;
  readonly thundermeister: SkyWarsMythicKitStats;
  readonly fishmonger: SkyWarsMythicKitStats;
}
```

### SkyWarsMythicKitStats

Stats for a single mythic kit, extending `SkyWarsModeStats` with kit-level fields.

```ts
interface SkyWarsMythicKitStats extends SkyWarsModeStats {
  readonly experience: number;
  readonly autoEquipArmor: boolean;
  readonly lab: SkyWarsModeStats;
  readonly tourney: SkyWarsModeStats;
}
```

### SkyWarsPerk

A single perk's level and toggle state.

```ts
interface SkyWarsPerk {
  readonly level: number;
  readonly enabled: boolean;
}
```

### SkyWarsModePerks

A map of perk name to `SkyWarsPerk`, used for `soloPerks`, `teamsPerks`, `megaPerks`, and `rankedPerks`. The keys are the camelCase perk names defined per mode.

```ts
type SkyWarsModePerks = Readonly<Record<string, SkyWarsPerk>>;
```

### SkyWarsUniversalPerks

The fixed set of universal (cross-mode) perks, nested under `SkyWarsStats.universalPerks`.

```ts
interface SkyWarsUniversalPerks {
  readonly avarice: SkyWarsPerk;
  readonly grandSlam: SkyWarsPerk;
  readonly tenacity: SkyWarsPerk;
  readonly meticulousMiner: SkyWarsPerk;
  readonly hideAndSeek: SkyWarsPerk;
  readonly midasGift: SkyWarsPerk;
  readonly firstBlood: SkyWarsPerk;
  readonly fortuneTeller: SkyWarsPerk;
  readonly fireproof: SkyWarsPerk;
  readonly angelsOffering: SkyWarsPerk;
  readonly librarian: SkyWarsPerk;
  readonly luckierCharm: SkyWarsPerk;
  readonly apothecary: SkyWarsPerk;
  readonly fruitFinder: SkyWarsPerk;
  readonly sorcerersSpell: SkyWarsPerk;
  readonly corruptedCoinage: SkyWarsPerk;
}
```

### SkyWarsPerkSlots

The configured perk slot loadouts per game category. Each map keys a slot to a perk id string.

```ts
interface SkyWarsPerkSlots {
  readonly insane: Readonly<Record<string, string>>;
  readonly normal: Readonly<Record<string, string>>;
  readonly mega: Readonly<Record<string, string>>;
}
```

### SkyWarsActiveKits

The active kit selection (and per-mode random toggles), nested under `SkyWarsStats.activeKits`.

```ts
interface SkyWarsActiveKits {
  readonly solo: string;
  readonly team: string;
  readonly teams: string;
  readonly mega: string;
  readonly megaDoubles: string;
  readonly mini: string;
  readonly ranked: string;
  readonly teamsTourney: string;
  readonly soloRandom: boolean;
  readonly megaRandom: boolean;
  readonly megaDoublesRandom: boolean;
  readonly miniRandom: boolean;
  readonly teamsRandom: boolean;
  readonly rankedRandom: boolean;
  readonly teamsTourneyRandom: boolean;
}
```

### SkyWarsSelectedCosmetics

The selected cosmetic ids, nested under `SkyWarsStats.selectedCosmetics`.

```ts
interface SkyWarsSelectedCosmetics {
  readonly killEffect: string;
  readonly victoryDance: string;
  readonly projectileTrail: string;
  readonly deathCry: string;
  readonly cage: string;
}
```

### SkyWarsChestRarities

Opened-chest counts by rarity, nested under `SkyWarsStats.chestRarities`.

```ts
interface SkyWarsChestRarities {
  readonly opened: number;
  readonly commons: number;
  readonly rares: number;
  readonly epics: number;
  readonly legendaries: number;
}
```

### SkyWarsBrewery

Brewery ingredient counts, nested under `SkyWarsStats.brewery`.

```ts
interface SkyWarsBrewery {
  readonly gildedTonic: number;
  readonly enderElixir: number;
}
```

### SkyWarsSettings

Player SkyWars settings, nested under `SkyWarsStats.settings`.

```ts
interface SkyWarsSettings {
  readonly soulWellLobbyNotifications: boolean;
  readonly showPersonalMovementTrails: boolean;
}
```

### SkyWarsLeaderboardSettings

Leaderboard display settings, nested under `SkyWarsStats.leaderboardSettings`.

```ts
interface SkyWarsLeaderboardSettings {
  readonly resetType: string;
  readonly mode: string;
}
```

### SkyWarsRankedSeasonRating

A single ranked-season rating entry, used as the value type of `SkyWarsStats.rankedSeasonRatings`. The map key is the season identifier captured from `SkyWars_skywars_rating_<season>_(rating|position)`.

```ts
interface SkyWarsRankedSeasonRating {
  readonly rating: number;
  readonly position: number;
}
```

### SkyWarsHeadCollection

The player's head collection lists, nested under `SkyWarsStats.headCollection`.

```ts
interface SkyWarsHeadCollection {
  readonly recent: readonly SkyWarsHeadCollectionEntry[];
  readonly prestigious: readonly SkyWarsHeadCollectionEntry[];
}
```

### SkyWarsHeadCollectionEntry

A single head collection entry.

```ts
interface SkyWarsHeadCollectionEntry {
  readonly timestamp: Date | null;
  readonly mode: string;
  readonly sacrifice: string;
}
```

`timestamp` is an epoch-ms value surfaced as `Date`, or `null` when absent.

### SkyWarsPrivateGameSettings

Saved private-game settings, nested under `SkyWarsStats.privateGames`.

```ts
interface SkyWarsPrivateGameSettings {
  readonly maxKitsAndPerks: boolean;
  readonly legacyItems: boolean;
  readonly speed: string;
  readonly dragons: string;
  readonly noKits: boolean;
  readonly nightTime: boolean;
  readonly healthBuff: string;
  readonly teleportMayhem: boolean;
  readonly chestSwords: string;
  readonly chestArmour: string;
  readonly oneHitOneKill: boolean;
  readonly lowGravity: boolean;
  readonly chestBows: string;
}
```
