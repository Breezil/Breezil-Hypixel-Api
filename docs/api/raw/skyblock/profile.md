# SkyBlock Profile

The SkyBlock parsers turn the raw `/skyblock/profile` and `/skyblock/profiles` Hypixel API JSON into readonly, fully-typed objects. They are strict-raw: fields are mirrored from the API one-for-one, with no derived, computed, or aggregated values. Every value is read straight from the raw JSON.

This page documents every export of `src/skyblock.ts`: both parse functions and the complete tree of interfaces and types they return. It is exhaustive by design and therefore long.

## parseSkyBlockProfile

Parses a single SkyBlock profile (`/skyblock/profile`) into a typed object.

```ts
export function parseSkyBlockProfile(
  profile: Record<string, unknown>,
  forUuid?: string,
): SkyBlockProfile | null;
```

Returns `null` when `profile` is not a non-array object. When `forUuid` is supplied, the matching member is resolved into the `member` field (or `null` if that uuid is not present in `members`); when `forUuid` is omitted, `member` is always `null`. The full `members` map is populated regardless, keyed by player uuid.

## parseSkyBlockProfiles

Parses a player's SkyBlock profiles (`/skyblock/profiles`) into a typed object.

```ts
export function parseSkyBlockProfiles(
  data: Record<string, unknown>,
  forUuid?: string,
): readonly SkyBlockProfile[];
```

Reads `data.profiles`. Returns an empty array when `data.profiles` is not an array. Each array entry is parsed via `parseSkyBlockProfile` (with the same `forUuid` semantics); non-object entries and any entry that parses to `null` are filtered out. Every element of the result is a [`SkyBlockProfile`](#skyblockprofile).

### Null / empty behavior

Both parsers populate every field of every returned object using the safe readers shared across the library:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is always present and populated with the defaults above.
- String-array, number-array, and object-array fields become empty arrays (`[]`) when absent, and silently drop entries of the wrong element type.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.
- Dynamic record fields (`Record<string, ...>`) contain only the keys present in the raw data, and so may be empty objects.
- Inventory fields decode a base64/gzip NBT blob; they are `null` when the underlying `data` string is missing or empty.

## Returned type tree

### SkyBlockProfile

The root object returned by `parseSkyBlockProfile`.

```ts
interface SkyBlockProfile {
  readonly id: string;
  readonly cuteName: string;
  readonly gameMode: string;
  readonly selected: boolean;
  readonly createdAt: Date | null;
  readonly banking: SkyBlockBanking;
  readonly communityUpgrades: SkyBlockCommunityUpgrades;
  readonly member: SkyBlockMember | null;
  readonly members: Record<string, SkyBlockMember>;
}
```

| Field       | Notes                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| `id`        | Raw `profile_id`.                                                          |
| `cuteName`  | Raw `cute_name` (e.g. "Apple", "Banana").                                  |
| `gameMode`  | Raw `game_mode` (e.g. "ironman", "island", "bingo"; `""` for normal).      |
| `createdAt` | Raw `created_at` epoch-ms as `Date`, or `null`.                            |
| `member`    | The member resolved from `forUuid`, or `null`. See parser semantics above. |
| `members`   | Every member keyed by player uuid.                                         |

### SkyBlockBanking

Profile co-op bank. Read from raw `banking`.

```ts
interface SkyBlockBanking {
  readonly balance: number;
  readonly transactions: readonly SkyBlockBankTransaction[];
}
```

### SkyBlockBankTransaction

```ts
interface SkyBlockBankTransaction {
  readonly amount: number;
  readonly timestamp: number;
  readonly action: string;
  readonly initiatorName: string;
}
```

### SkyBlockCommunityUpgrades

Read from raw `community_upgrades`.

```ts
interface SkyBlockCommunityUpgrades {
  readonly currentlyUpgrading: SkyBlockCommunityUpgradeInProgress | null;
  readonly upgradeStates: readonly SkyBlockCommunityUpgradeState[];
}
```

`currentlyUpgrading` is `null` when the raw `currently_upgrading` is absent or not an object.

### SkyBlockCommunityUpgradeInProgress

```ts
interface SkyBlockCommunityUpgradeInProgress {
  readonly upgrade: string;
  readonly newTier: number;
  readonly startedMs: number;
  readonly startedBy: string;
}
```

`startedMs` reads raw `start_ms`; `startedBy` reads raw `who_started`.

### SkyBlockCommunityUpgradeState

```ts
interface SkyBlockCommunityUpgradeState {
  readonly upgrade: string;
  readonly tier: number;
  readonly startedMs: number;
  readonly startedBy: string;
  readonly claimedMs: number;
  readonly claimedBy: string;
  readonly fastTracked: boolean;
}
```

`fastTracked` reads raw `fasttracked`.

---

## Member root

### SkyBlockMember

A single profile member. The largest object on this page; each field is documented in its own section below.

```ts
interface SkyBlockMember {
  readonly playerId: string;
  readonly firstJoinHub: number;
  readonly stats: Record<string, number>;
  readonly currencies: SkyBlockCurrencies;
  readonly fairySouls: SkyBlockFairySouls;
  readonly leveling: SkyBlockLeveling;
  readonly profileStats: SkyBlockProfileStats;
  readonly itemData: SkyBlockItemData;
  readonly skillExperience: SkyBlockSkillExperience;
  readonly slayers: SkyBlockSlayers;
  readonly dungeons: SkyBlockDungeons;
  readonly playerData: SkyBlockPlayerData;
  readonly playerStats: SkyBlockPlayerStats;
  readonly collections: Record<string, number>;
  readonly jacobContests: SkyBlockJacobContests;
  readonly accessoryBag: SkyBlockAccessoryBag;
  readonly bestiary: SkyBlockBestiary;
  readonly garden: SkyBlockMemberGarden;
  readonly miningCore: SkyBlockMiningCore;
  readonly forge: SkyBlockForge;
  readonly glacitePlayerData: SkyBlockGlacitePlayerData;
  readonly pets: SkyBlockPets;
  readonly chocolateFactory: SkyBlockChocolateFactory;
  readonly crimsonIsle: SkyBlockCrimsonIsle;
  readonly trophyFish: SkyBlockTrophyFish;
  readonly objectives: SkyBlockObjectives;
  readonly quests: SkyBlockQuests;
  readonly experimentation: SkyBlockExperimentation;
  readonly skillTree: SkyBlockSkillTree;
  readonly rift: SkyBlockRift;
  readonly inventories: SkyBlockInventories;
  readonly foraging: SkyBlockForaging;
  readonly foragingCore: SkyBlockForagingCore;
  readonly shards: SkyBlockShards;
  readonly winterPlayerData: SkyBlockWinterPlayerData;
  readonly temples: SkyBlockTemples;
  readonly attributes: SkyBlockAttributes;
  readonly loadout: SkyBlockLoadout;
}
```

| Field             | Notes                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `playerId`        | Raw `player_id`.                                                                                |
| `firstJoinHub`    | Raw `first_join_hub`.                                                                           |
| `stats`           | Open numeric record of raw `stats` (all numeric keys, not allow-listed).                        |
| `skillExperience` | Parsed from `player_data.experience` (see [SkyBlockSkillExperience](#skyblockskillexperience)). |
| `collections`     | Open numeric record of raw `collection`.                                                        |

---

## Shared types

These types appear throughout the member tree.

### SkyBlockScalarMap

An open record of scalar values; entries of other types are dropped.

```ts
type SkyBlockScalarMap = Record<string, number | string | boolean>;
```

### SkyBlockInventory

A decoded inventory. `data` is a base64/gzip NBT blob in the raw API; it is decoded into the typed `items` array. The field is `null` (at every usage site) when the raw blob is missing or empty.

```ts
interface SkyBlockInventory {
  readonly type: number;
  readonly items: readonly NbtItem[];
}
```

`NbtItem` is documented on the [NBT page](../nbt). `type` reads the raw inventory `type` discriminator.

### SkyBlockItemBytes

A raw, undecoded item blob — kept as a string rather than decoded. Used where the API stores arrays of item bytes (e.g. toolkits).

```ts
interface SkyBlockItemBytes {
  readonly type: number;
  readonly data: string;
}
```

### SkyBlockToolkit

A garden/foraging toolkit. `inUse` maps a toolkit slot group to per-tool booleans; `tools` maps each tool key to its raw item-byte blobs. The `IN_USE` and `IS_UNLOCKED` keys are excluded from `tools`.

```ts
interface SkyBlockToolkit {
  readonly isUnlocked: boolean;
  readonly inUse: Record<string, Record<string, boolean>>;
  readonly tools: Record<string, readonly SkyBlockItemBytes[]>;
}
```

---

## Currencies & fairy souls

### SkyBlockCurrencies

Read from raw `currencies`. `essences` maps each essence type to its `current` amount.

```ts
interface SkyBlockCurrencies {
  readonly coinPurse: number;
  readonly motesPurse: number;
  readonly essences: SkyBlockEssences;
}
```

`coinPurse` reads `coin_purse`; `motesPurse` reads `motes_purse`.

### SkyBlockEssences

```ts
type SkyBlockEssences = Record<string, number>;
```

### SkyBlockFairySouls

Read from raw `fairy_soul`.

```ts
interface SkyBlockFairySouls {
  readonly exchanges: number;
  readonly collected: number;
  readonly unspent: number;
}
```

`exchanges` reads `fairy_exchanges`; `collected` reads `total_collected`; `unspent` reads `unspent_souls`.

---

## Leveling

### SkyBlockLeveling

SkyBlock Level / task progression. Read from raw `leveling`.

```ts
interface SkyBlockLeveling {
  readonly experience: number;
  readonly highestPetScore: number;
  readonly miningFiestaOresMined: number;
  readonly fishingFestivalSharksKilled: number;
  readonly taskSort: string;
  readonly selectedSymbol: string;
  readonly bopBonus: string;
  readonly claimedTalisman: boolean;
  readonly migrated: boolean;
  readonly migratedCompletions: boolean;
  readonly migratedCompletions2: boolean;
  readonly completedTasks: readonly string[];
  readonly lastViewedTasks: readonly string[];
  readonly emblemUnlocks: readonly string[];
  readonly categoryExpanded: boolean;
  readonly guideSort: string;
  readonly completed: readonly string[];
  readonly completions: Record<string, number>;
}
```

---

## Profile stats & item data

### SkyBlockProfileStats

Per-member profile-level state. Assembled from several raw locations.

```ts
interface SkyBlockProfileStats {
  readonly firstJoin: Date | null;
  readonly personalBankUpgrade: number;
  readonly bankAccount: number;
  readonly hasCookieBuff: boolean;
  readonly coopInvitation: SkyBlockCoopInvitation | null;
}
```

`firstJoin` is an epoch-ms `Date` or `null`; `coopInvitation` is `null` when absent.

### SkyBlockCoopInvitation

```ts
interface SkyBlockCoopInvitation {
  readonly timestamp: number;
  readonly invitedBy: string;
  readonly confirmed: boolean;
  readonly confirmedTimestamp: number;
}
```

### SkyBlockItemData

```ts
interface SkyBlockItemData {
  readonly soulflow: number;
  readonly favoriteArrow: string;
  readonly teleporterPillConsumed: boolean;
}
```

---

## Skills

### SkyBlockSkillExperience

Per-skill experience. Read from `player_data.experience` (and also exposed nested inside [SkyBlockPlayerData](#skyblockplayerdata)).

```ts
interface SkyBlockSkillExperience {
  readonly farming: number;
  readonly mining: number;
  readonly combat: number;
  readonly foraging: number;
  readonly fishing: number;
  readonly enchanting: number;
  readonly alchemy: number;
  readonly carpentry: number;
  readonly runecrafting: number;
  readonly social: number;
  readonly taming: number;
  readonly hunting: number;
}
```

Each field maps to its `SKILL_*` raw key (e.g. `farming` ← `SKILL_FARMING`).

---

## Slayers

### SkyBlockSlayers

Read from raw `slayer`. `bosses` is an open record keyed by slayer type (e.g. `zombie`, `spider`, `wolf`, `enderman`, `blaze`, `vampire`).

```ts
interface SkyBlockSlayers {
  readonly activeQuest: SkyBlockSlayerQuest | null;
  readonly bosses: Record<string, SkyBlockSlayerBoss>;
}
```

### SkyBlockSlayerBoss

```ts
interface SkyBlockSlayerBoss {
  readonly xp: number;
  readonly bossKillsTier0: number;
  readonly bossKillsTier1: number;
  readonly bossKillsTier2: number;
  readonly bossKillsTier3: number;
  readonly bossKillsTier4: number;
  readonly bossAttemptsTier0: number;
  readonly bossAttemptsTier1: number;
  readonly bossAttemptsTier2: number;
  readonly bossAttemptsTier3: number;
  readonly bossAttemptsTier4: number;
  readonly claimedLevels: Record<string, boolean>;
}
```

### SkyBlockSlayerQuest

The active slayer quest. Also reused by the Rift (see [SkyBlockRift](#skyblockrift)).

```ts
interface SkyBlockSlayerQuest {
  readonly type: string;
  readonly tier: number;
  readonly startTimestamp: number;
  readonly completionState: number;
  readonly usedArmor: boolean;
  readonly solo: boolean;
  readonly combatXp: number;
  readonly recentMobKills: readonly SkyBlockSlayerRecentKill[];
  readonly lastKilledMobIsland: string;
  readonly xpOnLastFollowerSpawn: number;
  readonly spawnTimestamp: number;
  readonly killTimestamp: number;
}
```

### SkyBlockSlayerRecentKill

```ts
interface SkyBlockSlayerRecentKill {
  readonly xp: number;
  readonly timestamp: number;
}
```

---

## Dungeons

### SkyBlockDungeons

Read from raw `dungeons`. `dungeonTypes` is an open record keyed by dungeon type; `catacombs` and `masterCatacombs` are also surfaced as named fields.

```ts
interface SkyBlockDungeons {
  readonly catacombs: SkyBlockDungeonMode;
  readonly masterCatacombs: SkyBlockDungeonMode;
  readonly dungeonTypes: Record<string, SkyBlockDungeonMode>;
  readonly selectedClass: string;
  readonly classExperience: Record<string, SkyBlockDungeonClass>;
  readonly secrets: number;
  readonly lastDungeonRun: string;
  readonly dungeonsBlahBlah: readonly string[];
  readonly hubRaceSettings: SkyBlockDungeonHubRaceSettings;
  readonly dailyRuns: SkyBlockDungeonDailyRuns;
  readonly unlockedJournals: readonly string[];
  readonly journalEntries: Record<string, readonly number[]>;
  readonly hasReadTheEye: boolean;
  readonly treasures: SkyBlockDungeonTreasures;
}
```

### SkyBlockDungeonMode

Per-dungeon-type stats. Every map is keyed by floor/tier id.

```ts
interface SkyBlockDungeonMode {
  readonly experience: number;
  readonly highestTierCompleted: number;
  readonly timesPlayed: Record<string, number>;
  readonly tierCompletions: Record<string, number>;
  readonly milestoneCompletions: Record<string, number>;
  readonly bestScore: Record<string, number>;
  readonly mobsKilled: Record<string, number>;
  readonly mostMobsKilled: Record<string, number>;
  readonly mostDamageBerserk: Record<string, number>;
  readonly mostDamageMage: Record<string, number>;
  readonly mostDamageHealer: Record<string, number>;
  readonly mostDamageTank: Record<string, number>;
  readonly mostDamageArcher: Record<string, number>;
  readonly mostHealingDealt: Record<string, number>;
  readonly watcherKills: Record<string, number>;
  readonly fastestTime: Record<string, number>;
  readonly fastestTimeS: Record<string, number>;
  readonly fastestTimeSPlus: Record<string, number>;
  readonly bestRuns: Record<string, readonly SkyBlockDungeonRun[]>;
}
```

### SkyBlockDungeonRun

A single recorded best run.

```ts
interface SkyBlockDungeonRun {
  readonly timestamp: number;
  readonly scoreExploration: number;
  readonly scoreSpeed: number;
  readonly scoreSkill: number;
  readonly scoreBonus: number;
  readonly dungeonClass: string;
  readonly teammates: readonly string[];
  readonly elapsedTime: number;
  readonly damageDealt: number;
  readonly deaths: number;
  readonly mobsKilled: number;
  readonly secretsFound: number;
  readonly damageMitigated: number;
  readonly allyHealing: number;
}
```

### SkyBlockDungeonClass

```ts
interface SkyBlockDungeonClass {
  readonly experience: number;
}
```

### SkyBlockDungeonHubRaceSettings

```ts
interface SkyBlockDungeonHubRaceSettings {
  readonly selectedRace: string;
  readonly selectedSetting: string;
  readonly runback: boolean;
}
```

### SkyBlockDungeonDailyRuns

```ts
interface SkyBlockDungeonDailyRuns {
  readonly currentDayStamp: number;
  readonly completedRunsCount: number;
}
```

### SkyBlockDungeonTreasures

Dungeon treasure-chest history. Read from `dungeons.treasures`.

```ts
interface SkyBlockDungeonTreasures {
  readonly runs: readonly SkyBlockDungeonTreasureRun[];
  readonly chests: readonly SkyBlockDungeonTreasureChest[];
}
```

### SkyBlockDungeonTreasureRun

```ts
interface SkyBlockDungeonTreasureRun {
  readonly runId: string;
  readonly completionTimestamp: number;
  readonly type: string;
  readonly dungeonTier: number;
  readonly participants: readonly SkyBlockDungeonTreasureParticipant[];
}
```

### SkyBlockDungeonTreasureParticipant

```ts
interface SkyBlockDungeonTreasureParticipant {
  readonly playerUuid: string;
  readonly displayName: string;
  readonly classMilestone: number;
}
```

### SkyBlockDungeonTreasureChest

`rewards` is the raw reward-id list. `shinyEligible` / `paid` / `rolledRngMeterRandomly` are booleans.

```ts
interface SkyBlockDungeonTreasureChest {
  readonly runId: string;
  readonly chestId: string;
  readonly treasureType: string;
  readonly quality: number;
  readonly shinyEligible: boolean;
  readonly paid: boolean;
  readonly rerolls: number;
  readonly rewards: readonly string[];
  readonly rolledRngMeterRandomly: boolean;
}
```

---

## Player data

### SkyBlockPlayerData

Read from raw `player_data`. `perks`, `gardenChips`, and `experience` are open numeric records; the various visited/unlocked/crafted fields are string arrays.

```ts
interface SkyBlockPlayerData {
  readonly deaths: number;
  readonly lastDeath: number;
  readonly reaperPeppersEaten: number;
  readonly fishingTreasureCaught: number;
  readonly fastestTargetPractice: number;
  readonly visitedZones: readonly string[];
  readonly visitedModes: readonly string[];
  readonly achievementSpawnedIslandTypes: readonly string[];
  readonly unlockedCollectionTiers: readonly string[];
  readonly craftedGenerators: readonly string[];
  readonly pausedEffects: readonly string[];
  readonly disabledPotionEffects: readonly string[];
  readonly activeEffects: readonly SkyBlockActiveEffect[];
  readonly temporaryStatBuffs: readonly SkyBlockTemporaryStatBuff[];
  readonly perks: Record<string, number>;
  readonly gardenChips: Record<string, number>;
  readonly skillExperience: SkyBlockSkillExperience;
  readonly experience: Record<string, number>;
}
```

### SkyBlockActiveEffect

```ts
interface SkyBlockActiveEffect {
  readonly effect: string;
  readonly level: number;
  readonly modifiers: readonly SkyBlockActiveEffectModifier[];
  readonly ticksRemaining: number;
  readonly infinite: boolean;
}
```

### SkyBlockActiveEffectModifier

```ts
interface SkyBlockActiveEffectModifier {
  readonly key: string;
  readonly amp: number;
}
```

### SkyBlockTemporaryStatBuff

```ts
interface SkyBlockTemporaryStatBuff {
  readonly statId: string;
  readonly key: string;
  readonly amount: number;
  readonly expireAt: number;
}
```

---

## Player stats

### SkyBlockPlayerStats

Read from raw `player_stats`. `kills`, `deaths`, and `itemsFished` are open records; `rift` and `races` mix scalar and nested-numeric values.

```ts
interface SkyBlockPlayerStats {
  readonly highestDamage: number;
  readonly highestCriticalDamage: number;
  readonly glowingMushroomsBroken: number;
  readonly seaCreatureKills: number;
  readonly cropsMined: number;
  readonly shredderRod: SkyBlockPlayerStatsShredderRod;
  readonly kills: Record<string, number>;
  readonly deaths: Record<string, number>;
  readonly itemsFished: Record<string, number>;
  readonly auctions: SkyBlockPlayerStatsAuctions;
  readonly candyCollected: SkyBlockPlayerStatsCandy;
  readonly gifts: SkyBlockPlayerStatsGifts;
  readonly mythos: SkyBlockPlayerStatsMythos;
  readonly winter: SkyBlockPlayerStatsWinter;
  readonly endIsland: SkyBlockPlayerStatsEndIsland;
  readonly spooky: SkyBlockPlayerStatsSpooky;
  readonly rift: Record<string, number | Record<string, number>>;
  readonly shardCombatHunts: number;
  readonly shardFishingHunts: number;
  readonly shardTrapHunts: number;
  readonly shardForestHunts: number;
  readonly shardSaltHunts: number;
  readonly uniqueShards: number;
  readonly races: Record<string, number | Record<string, number>>;
  readonly pets: SkyBlockPlayerStatsPets;
}
```

### SkyBlockPlayerStatsShredderRod

```ts
interface SkyBlockPlayerStatsShredderRod {
  readonly bait: number;
  readonly fished: number;
}
```

### SkyBlockPlayerStatsAuctions

```ts
interface SkyBlockPlayerStatsAuctions {
  readonly bids: number;
  readonly highestBid: number;
  readonly won: number;
  readonly goldSpent: number;
  readonly created: number;
  readonly fees: number;
  readonly completed: number;
  readonly goldEarned: number;
  readonly noBids: number;
  readonly totalBought: Record<string, number>;
  readonly totalSold: Record<string, number>;
}
```

`totalBought` / `totalSold` are keyed by item rarity.

### SkyBlockPlayerStatsCandy

Spooky-festival candy totals. `festivals` is keyed by festival id.

```ts
interface SkyBlockPlayerStatsCandy {
  readonly total: number;
  readonly greenCandy: number;
  readonly purpleCandy: number;
  readonly festivals: Record<string, SkyBlockSpookyFestivalCandy>;
}
```

### SkyBlockSpookyFestivalCandy

```ts
interface SkyBlockSpookyFestivalCandy {
  readonly greenCandy: number;
  readonly purpleCandy: number;
}
```

### SkyBlockPlayerStatsGifts

```ts
interface SkyBlockPlayerStatsGifts {
  readonly totalReceived: number;
  readonly totalGiven: number;
}
```

### SkyBlockPlayerStatsMythos

Diana / mythological-event stats. Each `burrows*` map is keyed by tier.

```ts
interface SkyBlockPlayerStatsMythos {
  readonly kills: number;
  readonly burrowsDugNext: Record<string, number>;
  readonly burrowsDugCombat: Record<string, number>;
  readonly burrowsDugTreasure: Record<string, number>;
  readonly burrowsChainsComplete: Record<string, number>;
}
```

### SkyBlockPlayerStatsWinter

```ts
interface SkyBlockPlayerStatsWinter {
  readonly mostSnowballsHit: number;
  readonly mostDamageDealt: number;
  readonly mostMagmaDamageDealt: number;
  readonly mostCannonballsHit: number;
}
```

### SkyBlockPlayerStatsEndIsland

```ts
interface SkyBlockPlayerStatsEndIsland {
  readonly summoningEyesCollected: number;
  readonly specialZealotLootCollected: number;
  readonly dragonFight: SkyBlockPlayerStatsDragonFight;
}
```

### SkyBlockPlayerStatsDragonFight

Each map is keyed by dragon type.

```ts
interface SkyBlockPlayerStatsDragonFight {
  readonly enderCrystalsDestroyed: number;
  readonly mostDamage: Record<string, number>;
  readonly highestRank: Record<string, number>;
  readonly fastestKill: Record<string, number>;
  readonly amountSummoned: Record<string, number>;
  readonly summoningEyesContributed: Record<string, number>;
}
```

### SkyBlockPlayerStatsSpooky

`batsSpawned` is keyed by category.

```ts
interface SkyBlockPlayerStatsSpooky {
  readonly batsSpawned: Record<string, number>;
}
```

### SkyBlockPlayerStatsPets

```ts
interface SkyBlockPlayerStatsPets {
  readonly totalExpGained: number;
  readonly milestone: Record<string, number>;
}
```

---

## Collections

`collections` on the member is an open `Record<string, number>` read from raw `collection`, keyed by collection id. There is no dedicated interface.

---

## Jacob's contests (farming)

### SkyBlockJacobContests

Read from raw `jacobs_contest`.

```ts
interface SkyBlockJacobContests {
  readonly medalsInventory: Record<string, number>;
  readonly perks: SkyBlockJacobContestsPerks;
  readonly uniqueBrackets: Record<string, readonly string[]>;
  readonly personalBests: Record<string, number>;
  readonly talkedToJacob: boolean;
  readonly migration: boolean;
  readonly uniqueGolds2: readonly string[];
  readonly contests: Record<string, SkyBlockJacobContestEntry>;
}
```

`medalsInventory` is keyed by medal type; `uniqueBrackets` is keyed by bracket; `contests` is keyed by contest id.

### SkyBlockJacobContestsPerks

```ts
interface SkyBlockJacobContestsPerks {
  readonly doubleDrops: number;
  readonly farmingLevelCap: number;
  readonly personalBests: boolean;
}
```

### SkyBlockJacobContestEntry

```ts
interface SkyBlockJacobContestEntry {
  readonly collected: number;
  readonly claimedRewards: boolean;
  readonly claimedPosition: number;
  readonly claimedParticipants: number;
  readonly claimedMedal: string;
}
```

---

## Accessory bag

### SkyBlockAccessoryBag

Read from raw `accessory_bag_storage`. `selectedPower` is `null` when no power is selected. `tuningSlots` is a nested record (slot → stat → value); `tuningRefunds` is keyed by slot.

```ts
interface SkyBlockAccessoryBag {
  readonly selectedPower: string | null;
  readonly unlockedPowers: readonly string[];
  readonly bagUpgradesPurchased: number;
  readonly highestMagicalPower: number;
  readonly highestUnlockedTuningSlot: number;
  readonly tuningSlots: Record<string, Record<string, number>>;
  readonly tuningRefunds: Record<string, boolean>;
}
```

---

## Bestiary

### SkyBlockBestiary

Read from raw `bestiary`. Kills/deaths records are keyed by mob id; the `unmigrated*` records preserve pre-migration counts.

```ts
interface SkyBlockBestiary {
  readonly migration: boolean;
  readonly migratedStats: boolean;
  readonly lastClaimedMilestone: number;
  readonly maxKillsVisible: boolean;
  readonly milestonesNotifications: boolean;
  readonly kills: Record<string, number>;
  readonly deaths: Record<string, number>;
  readonly unmigratedKills: Record<string, number>;
  readonly unmigratedDeaths: Record<string, number>;
}
```

---

## Garden (member view)

### SkyBlockMemberGarden

Per-member garden state (distinct from the profile-wide garden endpoint). Read from raw `garden_player_data`.

```ts
interface SkyBlockMemberGarden {
  readonly copper: number;
  readonly larvaConsumed: number;
  readonly analyzedGreenhouseCrops: readonly string[];
  readonly discoveredGreenhouseCrops: readonly string[];
  readonly farmingToolkit: SkyBlockToolkit;
}
```

`farmingToolkit` is a [SkyBlockToolkit](#skyblocktoolkit).

---

## Mining core (Heart of the Mountain)

### SkyBlockMiningCore

Read from raw `mining_core`. `nodes` is an open record of perk levels (numbers) and toggles (booleans); `crystals` is keyed by crystal id.

```ts
interface SkyBlockMiningCore {
  readonly experience: number;
  readonly tokens: number;
  readonly tokensSpent: number;
  readonly receivedFreeTier: boolean;
  readonly powderMithril: number;
  readonly powderMithrilTotal: number;
  readonly powderSpentMithril: number;
  readonly powderGemstone: number;
  readonly powderGemstoneTotal: number;
  readonly powderSpentGemstone: number;
  readonly powderGlacite: number;
  readonly powderGlaciteTotal: number;
  readonly powderSpentGlacite: number;
  readonly selectedPickaxeAbility: string;
  readonly dailyEffect: string;
  readonly dailyEffectLastChanged: number;
  readonly retroactiveTier2Token: boolean;
  readonly hotmMigratorTreeResetSendMessage: boolean;
  readonly stashIfFullNotification: boolean;
  readonly lastReset: number;
  readonly dailyOresMined: number;
  readonly dailyOresMinedDay: number;
  readonly dailyOresMinedMithrilOre: number;
  readonly dailyOresMinedDayMithrilOre: number;
  readonly dailyOresMinedGemstone: number;
  readonly dailyOresMinedDayGemstone: number;
  readonly dailyOresMinedGlacite: number;
  readonly dailyOresMinedDayGlacite: number;
  readonly greaterMinesLastAccess: number;
  readonly nodes: Record<string, number | boolean>;
  readonly crystals: Record<string, SkyBlockMiningCrystal>;
  readonly biomes: SkyBlockMiningBiomes;
}
```

### SkyBlockMiningCrystal

```ts
interface SkyBlockMiningCrystal {
  readonly state: string;
  readonly totalPlaced: number;
  readonly totalFound: number;
}
```

### SkyBlockMiningBiomes

```ts
interface SkyBlockMiningBiomes {
  readonly precursor: SkyBlockMiningBiomePrecursor;
  readonly dwarven: SkyBlockMiningBiomeDwarven;
  readonly goblin: SkyBlockMiningBiomeGoblin;
}
```

### SkyBlockMiningBiomePrecursor

```ts
interface SkyBlockMiningBiomePrecursor {
  readonly partsDelivered: readonly string[];
}
```

### SkyBlockMiningBiomeDwarven

`statuesPlaced` is keyed by statue id.

```ts
interface SkyBlockMiningBiomeDwarven {
  readonly statuesPlaced: Record<string, string>;
}
```

### SkyBlockMiningBiomeGoblin

```ts
interface SkyBlockMiningBiomeGoblin {
  readonly kingQuestActive: boolean;
  readonly kingQuestsCompleted: number;
}
```

---

## Forge

### SkyBlockForge

Read from raw `forge`. `forgeProcesses` is a nested record (forge-tier → slot → process).

```ts
interface SkyBlockForge {
  readonly forgeProcesses: Record<string, Record<string, SkyBlockForgeProcess>>;
}
```

### SkyBlockForgeProcess

`oldItem` is `null` when absent.

```ts
interface SkyBlockForgeProcess {
  readonly type: string;
  readonly id: string;
  readonly startTime: number;
  readonly slot: number;
  readonly notified: boolean;
  readonly oldItem: string | null;
}
```

---

## Glacite player data

### SkyBlockGlacitePlayerData

Read from raw `glacite_player_data`. `corpsesLooted` is keyed by corpse type.

```ts
interface SkyBlockGlacitePlayerData {
  readonly fossilsDonated: readonly string[];
  readonly fossilDust: number;
  readonly corpsesLooted: Record<string, number>;
  readonly mineshaftsEntered: number;
}
```

---

## Pets

### SkyBlockPets

Read from raw `pets_data`.

```ts
interface SkyBlockPets {
  readonly pets: readonly SkyBlockPet[];
  readonly coinsSpentOnPetCare: number;
  readonly sacrificedPetTypes: readonly string[];
  readonly autopetRulesLimit: number;
  readonly autopetRules: readonly SkyBlockAutopetRule[];
  readonly autopetMigrated: boolean;
  readonly autopetMigrated2: boolean;
}
```

### SkyBlockPet

`uuid`, `uniqueId`, `heldItem`, `heldItemUuid`, and `skin` are `null` when absent. `extra` is an open numeric record of pet-specific extra data. Reused by the Rift's dead-cats Montezuma pet.

```ts
interface SkyBlockPet {
  readonly uuid: string | null;
  readonly uniqueId: string | null;
  readonly type: string;
  readonly experience: number;
  readonly active: boolean;
  readonly tier: string;
  readonly heldItem: string | null;
  readonly heldItemUuid: string | null;
  readonly candyUsed: number;
  readonly soulbound: boolean;
  readonly skin: string | null;
  readonly extra: Record<string, number>;
}
```

### SkyBlockAutopetRule

`data` is a scalar map of rule configuration.

```ts
interface SkyBlockAutopetRule {
  readonly uuid: string;
  readonly id: string;
  readonly name: string;
  readonly uniqueId: string;
  readonly exceptions: readonly SkyBlockAutopetRuleException[];
  readonly disabled: boolean;
  readonly data: SkyBlockScalarMap;
}
```

### SkyBlockAutopetRuleException

```ts
interface SkyBlockAutopetRuleException {
  readonly id: string;
  readonly data: SkyBlockScalarMap;
}
```

---

## Chocolate factory

### SkyBlockChocolateFactory

Read from raw `events.easter`. `employees` is keyed by employee id.

```ts
interface SkyBlockChocolateFactory {
  readonly chocolate: number;
  readonly chocolateSincePrestige: number;
  readonly totalChocolate: number;
  readonly prestigeLevel: number;
  readonly barnCapacityLevel: number;
  readonly supremeChocolateBars: number;
  readonly refinedDarkCacaoTruffles: number;
  readonly elDoradoProgress: number;
  readonly goldenClickAmount: number;
  readonly goldenClickYear: number;
  readonly rabbitSort: string;
  readonly rabbitFilter: string;
  readonly rabbitHotspotFiler: string;
  readonly lastViewed: number;
  readonly employees: Record<string, number>;
  readonly upgrades: SkyBlockChocolateUpgrades;
  readonly timeTower: SkyBlockChocolateTimeTower;
  readonly rabbitHitmen: SkyBlockChocolateHitmen;
  readonly rabbits: SkyBlockChocolateRabbits;
  readonly shop: SkyBlockChocolateShop;
}
```

`rabbitHotspotFiler` mirrors the raw (misspelled) API key.

### SkyBlockChocolateUpgrades

```ts
interface SkyBlockChocolateUpgrades {
  readonly clickUpgrades: number;
  readonly chocolateMultiplierUpgrades: number;
  readonly rabbitRarityUpgrades: number;
}
```

### SkyBlockChocolateTimeTower

```ts
interface SkyBlockChocolateTimeTower {
  readonly charges: number;
  readonly level: number;
  readonly activationTime: number;
  readonly lastChargeTime: number;
}
```

### SkyBlockChocolateHitmen

```ts
interface SkyBlockChocolateHitmen {
  readonly rabbitHitmenSlots: number;
  readonly missedUncollectedEggs: number;
  readonly eggSlotCooldownMark: number;
  readonly eggSlotCooldownSum: number;
}
```

### SkyBlockChocolateRabbits

`collectedEggs` is keyed by meal/location; `collectedLocations` maps each category to a list; `found` is keyed by rabbit id.

```ts
interface SkyBlockChocolateRabbits {
  readonly collectedEggs: SkyBlockChocolateCollectedEggs;
  readonly collectedLocations: Record<string, readonly string[]>;
  readonly found: Record<string, number>;
}
```

### SkyBlockChocolateCollectedEggs

```ts
type SkyBlockChocolateCollectedEggs = Record<string, number>;
```

### SkyBlockChocolateShop

```ts
interface SkyBlockChocolateShop {
  readonly year: number;
  readonly rabbits: readonly string[];
  readonly chocolateSpent: number;
  readonly cocoaFortuneUpgrades: number;
  readonly rabbitsPurchased: readonly string[];
}
```

---

## Crimson Isle (Nether)

### SkyBlockCrimsonIsle

Read from raw `nether_island_player_data`. `kuudraCompletedTiers` and `dojo` are open numeric records.

```ts
interface SkyBlockCrimsonIsle {
  readonly selectedFaction: string;
  readonly magesReputation: number;
  readonly magesReputationHighest: number;
  readonly barbariansReputation: number;
  readonly barbariansReputationHighest: number;
  readonly lastMinibossesKilled: readonly string[];
  readonly kuudraCompletedTiers: Record<string, number>;
  readonly kuudraPartyFinder: SkyBlockKuudraPartyFinder;
  readonly dojo: Record<string, number>;
  readonly abiphone: SkyBlockAbiphone;
  readonly matriarch: SkyBlockMatriarch;
  readonly npcPath: SkyBlockCrimsonIsleNpcPath;
  readonly quests: SkyBlockCrimsonIsleQuests;
}
```

### SkyBlockKuudraPartyFinder

```ts
interface SkyBlockKuudraPartyFinder {
  readonly searchTier: string;
  readonly groupBuildTier: string;
  readonly groupBuildNote: string;
  readonly groupBuildRequiredCombatLevel: number;
}
```

### SkyBlockAbiphone

`contactData` is keyed by contact id; `games` and `operatorChip` are open numeric records.

```ts
interface SkyBlockAbiphone {
  readonly contactData: Record<string, SkyBlockAbiphoneContact>;
  readonly activeContacts: readonly string[];
  readonly selectedRingtone: string;
  readonly selectedSort: string;
  readonly games: Record<string, number>;
  readonly operatorChip: Record<string, number>;
  readonly trioContactAddons: number;
  readonly hasUsedSiriusPersonalPhoneNumberItem: boolean;
  readonly lastDyeCalledYear: number;
}
```

### SkyBlockAbiphoneContact

```ts
interface SkyBlockAbiphoneContact {
  readonly talkedTo: boolean;
  readonly completedQuest: boolean;
  readonly incomingCallsCount: number;
  readonly lastCallIncoming: number;
}
```

### SkyBlockMatriarch

```ts
interface SkyBlockMatriarch {
  readonly pearlsCollected: number;
  readonly lastAttempt: number;
  readonly recentRefreshes: readonly number[];
}
```

### SkyBlockCrimsonIsleNpcPath

```ts
interface SkyBlockCrimsonIsleNpcPath {
  readonly npcId: string;
  readonly pathId: string;
  readonly skin: string;
  readonly pathIndex: number;
}
```

### SkyBlockCrimsonIsleQuests

The Crimson Isle quest log. Most quest fields are [SkyBlockScalarMap](#skyblockscalarmap)s mirroring the raw per-quest objects; `minibossKills` is keyed by miniboss id.

```ts
interface SkyBlockCrimsonIsleQuests {
  readonly questData: Record<string, SkyBlockCrimsonIsleQuestEntry>;
  readonly minibossKills: Record<string, boolean>;
  readonly minibossDaily: SkyBlockScalarMap;
  readonly kuudraBossDaily: SkyBlockScalarMap;
  readonly questRewards: SkyBlockScalarMap;
  readonly alchemistQuest: SkyBlockScalarMap;
  readonly rulenor: SkyBlockScalarMap;
  readonly chickenQuest: SkyBlockCrimsonIsleChickenQuest;
  readonly pomtairQuest: SkyBlockScalarMap;
  readonly suusQuest: SkyBlockScalarMap;
  readonly pabloQuest: SkyBlockScalarMap;
  readonly duelTrainingQuest: SkyBlockScalarMap;
  readonly sirihQuest: SkyBlockScalarMap;
  readonly edelisQuest: SkyBlockScalarMap;
  readonly mollimQuest: SkyBlockScalarMap;
  readonly aranyaQuest: SkyBlockScalarMap;
  readonly lastReset: number;
  readonly paidBruuh: boolean;
  readonly chickenQuestHandedIn: number;
  readonly foundKuudraBook: boolean;
  readonly foundKuudraLeggings: boolean;
  readonly foundKuudraBoots: boolean;
  readonly foundKuudraChestplate: boolean;
  readonly lastKuudraRelic: number;
  readonly kuudraLoremaster: boolean;
}
```

### SkyBlockCrimsonIsleQuestEntry

A generic quest-data entry: either a scalar map or a list of strings.

```ts
type SkyBlockCrimsonIsleQuestEntry = SkyBlockScalarMap | readonly string[];
```

### SkyBlockCrimsonIsleChickenQuest

```ts
interface SkyBlockCrimsonIsleChickenQuest {
  readonly start: boolean;
  readonly progress: number;
  readonly collected: readonly string[];
}
```

---

## Trophy fishing

### SkyBlockTrophyFish

Read from raw `trophy_fish`. `catches` is keyed by fish/tier id.

```ts
interface SkyBlockTrophyFish {
  readonly rewards: readonly number[];
  readonly totalCaught: number;
  readonly lastCaught: string;
  readonly catches: Record<string, number>;
}
```

---

## Objectives & quests

### SkyBlockObjectives

Read from raw `objectives`. `objectives` is keyed by objective id; each value is a [SkyBlockObjective](#skyblockobjective).

```ts
interface SkyBlockObjectives {
  readonly tutorial: readonly string[];
  readonly objectives: Record<string, SkyBlockObjective>;
}
```

### SkyBlockObjective

```ts
type SkyBlockObjective = SkyBlockScalarMap;
```

### SkyBlockQuests

Read from raw `quests`. `quests` is keyed by quest id, each a scalar map.

```ts
interface SkyBlockQuests {
  readonly trapper: SkyBlockTrapperQuest;
  readonly quests: Record<string, SkyBlockScalarMap>;
}
```

### SkyBlockTrapperQuest

```ts
interface SkyBlockTrapperQuest {
  readonly peltCount: number;
  readonly lastTaskTime: number;
}
```

### SkyBlockHarpQuest

The Melody's Harp quest (also reached via foraging songs). `songs` is keyed by song id.

```ts
interface SkyBlockHarpQuest {
  readonly selectedSong: string;
  readonly selectedSongEpoch: number;
  readonly claimedTalisman: boolean;
  readonly songs: Record<string, number>;
}
```

---

## Experimentation

### SkyBlockExperimentation

Read from raw `experimentation`. `pairings`, `simon`, and `numbers` are per-table scalar maps.

```ts
interface SkyBlockExperimentation {
  readonly claimsResets: number;
  readonly claimsResetsTimestamp: number;
  readonly serumsDrank: number;
  readonly claimedRetroactiveRng: boolean;
  readonly chargeTrackTimestamp: number;
  readonly pairings: SkyBlockScalarMap;
  readonly simon: SkyBlockScalarMap;
  readonly numbers: SkyBlockScalarMap;
}
```

---

## Skill tree (mining/foraging)

### SkyBlockSkillTree

Read from raw `mining_core.skill_tree` / foraging equivalent.

```ts
interface SkyBlockSkillTree {
  readonly nodes: SkyBlockSkillTreeNodes;
  readonly selectedAbility: SkyBlockSkillTreeAbilities;
  readonly tokensSpent: SkyBlockSkillTreeTokens;
  readonly experience: SkyBlockSkillTreeValues;
  readonly lastReset: SkyBlockSkillTreeValues;
  readonly refundAbilityFree: boolean;
}
```

### SkyBlockSkillTreeNodes

Each tree is an open record of node levels (numbers) or toggles (booleans).

```ts
interface SkyBlockSkillTreeNodes {
  readonly mining: Record<string, number | boolean>;
  readonly foraging: Record<string, number | boolean>;
}
```

### SkyBlockSkillTreeAbilities

```ts
interface SkyBlockSkillTreeAbilities {
  readonly mining: string;
  readonly foraging: string;
}
```

### SkyBlockSkillTreeTokens

```ts
interface SkyBlockSkillTreeTokens {
  readonly mountain: number;
  readonly forest: number;
}
```

### SkyBlockSkillTreeValues

Used for both `experience` and `lastReset`.

```ts
interface SkyBlockSkillTreeValues {
  readonly mining: number;
  readonly foraging: number;
}
```

---

## Rift

### SkyBlockRift

Read from raw `rift`. Each area is its own nested type; the slayer quest and inventories are reused from elsewhere. `enderChestPageIcons` is an array whose entries may be `null`.

```ts
interface SkyBlockRift {
  readonly access: SkyBlockRiftAccess;
  readonly villagePlaza: SkyBlockRiftVillagePlaza;
  readonly witherCage: SkyBlockRiftWitherCage;
  readonly blackLagoon: SkyBlockRiftBlackLagoon;
  readonly deadCats: SkyBlockRiftDeadCats;
  readonly wizardTower: SkyBlockRiftWizardTower;
  readonly enigma: SkyBlockRiftEnigma;
  readonly gallery: SkyBlockRiftGallery;
  readonly castle: SkyBlockRiftCastle;
  readonly westVillage: SkyBlockRiftWestVillage;
  readonly wyldWoods: SkyBlockRiftWyldWoods;
  readonly dreadFarm: SkyBlockRiftDreadFarm;
  readonly slayerQuest: SkyBlockSlayerQuest | null;
  readonly lifetimePurchasedBoundaries: readonly string[];
  readonly inventory: SkyBlockInventory | null;
  readonly enderChest: SkyBlockInventory | null;
  readonly enderChestPageIcons: readonly (SkyBlockInventory | null)[];
  readonly armor: SkyBlockInventory | null;
  readonly equipment: SkyBlockInventory | null;
}
```

### SkyBlockRiftAccess

```ts
interface SkyBlockRiftAccess {
  readonly lastFree: number;
  readonly chargeTrackTimestamp: number;
}
```

### SkyBlockRiftVillagePlaza

```ts
interface SkyBlockRiftVillagePlaza {
  readonly murder: SkyBlockRiftMurder;
  readonly barry: SkyBlockRiftBarry;
  readonly cowboy: SkyBlockRiftCowboy;
  readonly barterBank: SkyBlockScalarMap;
  readonly lonely: SkyBlockScalarMap;
  readonly seraphine: SkyBlockScalarMap;
  readonly gotScammed: boolean;
}
```

### SkyBlockRiftMurder

```ts
interface SkyBlockRiftMurder {
  readonly stepIndex: number;
  readonly roomClues: readonly string[];
  readonly stepIndexPt2: number;
  readonly stepIndexPt3: number;
}
```

### SkyBlockRiftBarry

```ts
interface SkyBlockRiftBarry {
  readonly firstTalkToBarry: boolean;
  readonly convinced: readonly string[];
  readonly receivedReward: boolean;
}
```

### SkyBlockRiftCowboy

```ts
interface SkyBlockRiftCowboy {
  readonly stage: number;
  readonly hayEaten: number;
  readonly rabbitName: string;
}
```

### SkyBlockRiftWitherCage

```ts
interface SkyBlockRiftWitherCage {
  readonly killedEyes: readonly string[];
}
```

### SkyBlockRiftBlackLagoon

```ts
interface SkyBlockRiftBlackLagoon {
  readonly talkedToEdwin: boolean;
  readonly receivedSciencePaper: boolean;
  readonly deliveredSciencePaper: boolean;
  readonly completedStep: number;
}
```

### SkyBlockRiftDeadCats

`montezuma` is a [SkyBlockPet](#skyblockpet).

```ts
interface SkyBlockRiftDeadCats {
  readonly talkedToJacquelle: boolean;
  readonly pickedUpDetector: boolean;
  readonly foundCats: readonly string[];
  readonly unlockedPet: boolean;
  readonly montezuma: SkyBlockPet;
}
```

### SkyBlockRiftWizardTower

```ts
interface SkyBlockRiftWizardTower {
  readonly wizardQuestStep: number;
  readonly crumbsLaidOut: number;
}
```

### SkyBlockRiftEnigma

```ts
interface SkyBlockRiftEnigma {
  readonly boughtCloak: boolean;
  readonly foundSouls: readonly string[];
  readonly claimedBonusIndex: number;
}
```

### SkyBlockRiftGallery

```ts
interface SkyBlockRiftGallery {
  readonly eliseStep: number;
  readonly sentTrophyDialogues: readonly string[];
  readonly securedTrophies: readonly SkyBlockRiftGalleryTrophy[];
}
```

### SkyBlockRiftGalleryTrophy

```ts
interface SkyBlockRiftGalleryTrophy {
  readonly type: string;
  readonly timestamp: number;
  readonly visits: number;
}
```

### SkyBlockRiftCastle

```ts
interface SkyBlockRiftCastle {
  readonly unlockedPathwaySkip: boolean;
  readonly fairyStep: number;
}
```

### SkyBlockRiftWestVillage

```ts
interface SkyBlockRiftWestVillage {
  readonly crazyKloon: SkyBlockRiftCrazyKloon;
  readonly mirrorverse: SkyBlockRiftMirrorverse;
  readonly katHouse: SkyBlockRiftKatHouse;
  readonly glyphs: SkyBlockRiftGlyphs;
}
```

### SkyBlockRiftCrazyKloon

`selectedColors` is keyed by terminal.

```ts
interface SkyBlockRiftCrazyKloon {
  readonly selectedColors: Record<string, string>;
  readonly talked: boolean;
  readonly hackedTerminals: readonly string[];
  readonly questComplete: boolean;
}
```

### SkyBlockRiftMirrorverse

```ts
interface SkyBlockRiftMirrorverse {
  readonly visitedRooms: readonly string[];
  readonly upsideDownHard: boolean;
  readonly claimedChestItems: readonly string[];
  readonly claimedReward: boolean;
}
```

### SkyBlockRiftKatHouse

```ts
interface SkyBlockRiftKatHouse {
  readonly binCollectedSilverfish: number;
  readonly binCollectedSpider: number;
  readonly binCollectedMosquito: number;
}
```

### SkyBlockRiftGlyphs

```ts
interface SkyBlockRiftGlyphs {
  readonly claimedWand: boolean;
  readonly currentGlyphDelivered: boolean;
  readonly currentGlyphCompleted: boolean;
  readonly currentGlyph: number;
  readonly completed: boolean;
  readonly claimedBracelet: boolean;
}
```

### SkyBlockRiftWyldWoods

```ts
interface SkyBlockRiftWyldWoods {
  readonly siriusStartedQA: boolean;
  readonly bughunterStep: number;
  readonly siriusQAChainDone: boolean;
  readonly talkedThreebrothers: readonly string[];
  readonly siriusCompletedQA: boolean;
  readonly siriusClaimedDoubloon: boolean;
}
```

### SkyBlockRiftDreadFarm

```ts
interface SkyBlockRiftDreadFarm {
  readonly shaniaStage: number;
  readonly caducousFeederUses: readonly number[];
}
```

---

## Inventories

### SkyBlockInventories

Every inventory field is a decoded [SkyBlockInventory](#skyblockinventory), `null` when its raw NBT blob is missing or empty. `backpackContents` / `backpackIcons` are keyed by backpack slot; `sacksCounts` is an open numeric record of sack item counts.

```ts
interface SkyBlockInventories {
  readonly inventory: SkyBlockInventory | null;
  readonly armor: SkyBlockInventory | null;
  readonly equipment: SkyBlockInventory | null;
  readonly enderChest: SkyBlockInventory | null;
  readonly personalVault: SkyBlockInventory | null;
  readonly wardrobe: SkyBlockInventory | null;
  readonly wardrobeEquippedSlot: number;
  readonly talismanBag: SkyBlockInventory | null;
  readonly potionBag: SkyBlockInventory | null;
  readonly fishingBag: SkyBlockInventory | null;
  readonly sacksBag: SkyBlockInventory | null;
  readonly quiver: SkyBlockInventory | null;
  readonly candyInventory: SkyBlockInventory | null;
  readonly carnivalMaskInventory: SkyBlockInventory | null;
  readonly backpackContents: Record<string, SkyBlockInventory>;
  readonly backpackIcons: Record<string, SkyBlockInventory>;
  readonly sacksCounts: Record<string, number>;
}
```

---

## Foraging

### SkyBlockForaging

Read from raw `foraging`. `huntingToolkit` is a [SkyBlockToolkit](#skyblocktoolkit).

```ts
interface SkyBlockForaging {
  readonly starlyn: SkyBlockForagingStarlyn;
  readonly fishFamily: readonly string[];
  readonly hina: SkyBlockForagingHina;
  readonly treeGifts: SkyBlockForagingTreeGifts;
  readonly songs: SkyBlockForagingSongs;
  readonly huntingToolkit: SkyBlockToolkit;
}
```

### SkyBlockForagingStarlyn

`personalBests` is keyed by record id.

```ts
interface SkyBlockForagingStarlyn {
  readonly personalBests: Record<string, number>;
}
```

### SkyBlockForagingHina

```ts
interface SkyBlockForagingHina {
  readonly tasks: SkyBlockForagingHinaTasks;
}
```

### SkyBlockForagingHinaTasks

`taskProgress` is keyed by task id.

```ts
interface SkyBlockForagingHinaTasks {
  readonly completedTasks: readonly string[];
  readonly taskProgress: Record<string, number>;
  readonly claimedRewards: readonly string[];
  readonly tierClaimed: number;
}
```

### SkyBlockForagingTreeGifts

Both records are keyed by gift/milestone id.

```ts
interface SkyBlockForagingTreeGifts {
  readonly gifts: Record<string, number>;
  readonly milestoneTierClaimed: Record<string, number>;
}
```

### SkyBlockForagingSongs

```ts
interface SkyBlockForagingSongs {
  readonly harp: SkyBlockHarpQuest;
}
```

`harp` is a [SkyBlockHarpQuest](#skyblockharpquest).

### SkyBlockForagingCore

Read from raw `foraging_core`. `dailyLogCut` is a string array of logs cut today.

```ts
interface SkyBlockForagingCore {
  readonly dailyTreesCutDay: number;
  readonly dailyTreesCut: number;
  readonly dailyGifts: number;
  readonly dailyLogCutDay: number;
  readonly dailyLogCut: readonly string[];
  readonly forestsWhispers: number;
  readonly forestsWhispersSpent: number;
  readonly currentDailyEffect: string;
  readonly currentDailyEffectLastChanged: number;
}
```

---

## Shards (Hunting)

### SkyBlockShards

Read from raw `shedder_data` / shard storage.

```ts
interface SkyBlockShards {
  readonly shardSort: string;
  readonly fusionResultSort: string;
  readonly fusionSort: string;
  readonly fused: number;
  readonly owned: readonly SkyBlockShardOwned[];
  readonly activeTraps: readonly SkyBlockShardTrap[];
}
```

### SkyBlockShardOwned

```ts
interface SkyBlockShardOwned {
  readonly type: string;
  readonly amountOwned: number;
  readonly captured: number;
}
```

### SkyBlockShardTrap

```ts
interface SkyBlockShardTrap {
  readonly trapItem: string;
  readonly captureTime: number;
  readonly mode: string;
  readonly location: string;
  readonly placedAt: number;
  readonly shard: string;
  readonly captured: boolean;
  readonly uuid: string;
}
```

---

## Miscellaneous member sections

### SkyBlockWinterPlayerData

Read from raw `winter_player_data`.

```ts
interface SkyBlockWinterPlayerData {
  readonly refinedJyrreUses: number;
}
```

### SkyBlockTemples

Read from raw `temples`.

```ts
interface SkyBlockTemples {
  readonly unlockedTemples: readonly string[];
}
```

### SkyBlockAttributes

Read from raw `attributes`. `stacks` is an open numeric record keyed by attribute id.

```ts
interface SkyBlockAttributes {
  readonly stacks: Record<string, number>;
}
```

### SkyBlockLoadout

Read from raw `loadout.armor`. `armor` is keyed by loadout slot.

```ts
interface SkyBlockLoadout {
  readonly armor: Record<string, SkyBlockLoadoutArmorSet>;
}
```

### SkyBlockLoadoutArmorSet

`pieces` maps each armor slot to a decoded inventory; the `id` raw key is excluded from `pieces`.

```ts
interface SkyBlockLoadoutArmorSet {
  readonly id: number;
  readonly pieces: Record<string, SkyBlockInventory>;
}
```
