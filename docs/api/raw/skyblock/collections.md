# Museum, Garden, Fire Sales, News & Bingo

These parsers cover a group of SkyBlock endpoints: the museum (`skyblock-museum.ts`), the garden and fire sales (`skyblock-misc.ts`), the news feed (`skyblock-news.ts`), and bingo (`skyblock-bingo.ts` for a player's bingo card, plus the bingo event resource in `skyblock-resources.ts`). Each function mirrors the raw Hypixel API JSON field-for-field into readonly, fully-typed objects with no computation or derived values. Missing numbers become `0`, missing strings become `""`, boolean fields are `true` only when the raw value is exactly `true`, and epoch-ms timestamps become `Date` or `null`.

## parseMuseum

Parses a SkyBlock museum (`/skyblock/museum`) into a typed object keyed by member uuid.

```ts
function parseMuseum(members: Record<string, unknown>): SkyBlockMuseum;
```

### Null / empty behavior

- Every key in the raw `members` object becomes an entry in the returned `members` map; non-object member values are read as empty objects (so the member is still present with defaults).
- Within a member, `items` is built from the keys of the raw `items` object; `special` is `[]` when raw `special` is missing or not an array, with non-object entries skipped.
- `featuredSlot` and `data` are `null` when the raw value is empty.
- Donation `items` are NBT items decoded from the donation `data`; they may be empty when the data is missing or cannot be decoded.
- The function always returns a `SkyBlockMuseum`, never `null`.

## parseGarden

Parses a SkyBlock garden (`/skyblock/garden`) into a typed object.

```ts
function parseGarden(garden: Record<string, unknown>): SkyBlockGarden;
```

### Null / empty behavior

- `currentVisitors` is built from the raw `active_commissions` object; only non-array object values become visitors. Each visitor's `requirements` and `bonusRewards` are `[]` when the raw `requirement` / `bonus_rewards` fields are missing or not arrays (non-object entries are filtered out).
- `unlockedBarnSkins` and `unlockedPlots` are `[]` when their raw arrays are absent; non-string entries are filtered.
- `greenhouseSlots` is `[]` when raw `greenhouse_slots` is missing or not an array.
- Timestamp fields are exposed both as a raw number (`*Timestamp` / `lastSaveTimestamp`) and as a `Date | null` (`*At`).
- The function always returns a `SkyBlockGarden`, never `null`.

## parseFireSales

Parses the SkyBlock fire sales (`/skyblock/firesales`) into an array.

```ts
function parseFireSales(sales: unknown[]): SkyBlockFireSale[];
```

### Null / empty behavior

- Entries that are not non-array objects are skipped.
- Each entry exposes the start/end timestamps both as raw numbers (`startTimestamp` / `endTimestamp`) and as `Date | null` (`startAt` / `endAt`).
- Always returns an array (possibly empty), never `null`.

## parseSkyBlockNews

Parses the SkyBlock news (`/skyblock/news`) into an array.

```ts
function parseSkyBlockNews(items: unknown[]): SkyBlockNewsItem[];
```

### Null / empty behavior

- Entries that are not non-array objects are skipped.
- `item.material` reads the raw nested `item.material`; missing strings become `""`.
- Always returns an array (possibly empty), never `null`.

## parsePlayerBingo

Parses a player's SkyBlock bingo (`/skyblock/bingo`) into an array of bingo events.

```ts
function parsePlayerBingo(
  data: Record<string, unknown>,
): readonly PlayerBingoEvent[];
```

### Null / empty behavior

- Reads the raw `events` array; when it is missing or not an array the result is empty. Non-object entries are filtered out.
- `completedGoals` is `[]` when the raw `completed_goals` is missing or not an array; non-string entries are filtered.
- Always returns an array (possibly empty), never `null`.

## parseSkyBlockBingo

Parses the SkyBlock bingo event resource (`/resources/skyblock/bingo`) into a typed object. This parser is exported from the resources module (`skyblock-resources.ts`).

```ts
function parseSkyBlockBingo(
  raw: Record<string, unknown>,
): SkyBlockBingoResource | null;
```

### Null / empty behavior

- Returns `null` when `raw` is not a non-array object.
- `goals` is built from the raw `goals` array (non-object entries skipped); each goal's `fullLore` and `tiers` are `[]` when missing or not arrays.
- A goal's `requiredAmount` is the raw `requiredAmount` when it is a number, otherwise `null`.
- `lastUpdated`, `start`, and `end` are `null` when their epoch-ms timestamps are absent or unparseable.

---

## Returned type tree

### SkyBlockMuseum

The object returned by `parseMuseum`.

```ts
interface SkyBlockMuseum {
  readonly members: Record<string, SkyBlockMuseumMember>;
}
```

### SkyBlockMuseumMember

```ts
interface SkyBlockMuseumMember {
  readonly value: number;
  readonly appraisal: boolean;
  readonly items: readonly SkyBlockMuseumItem[];
  readonly special: readonly SkyBlockMuseumDonation[];
}
```

| Field       | Notes                                           |
| ----------- | ----------------------------------------------- |
| `value`     | Total appraisal value (raw `value`).            |
| `appraisal` | Whether appraisal is enabled (raw `appraisal`). |
| `items`     | One entry per key of the raw `items` object.    |
| `special`   | Special donations from raw `special`.           |

### SkyBlockMuseumDonation

The base shape of a museum donation. Also the element type of `SkyBlockMuseumMember.special`.

```ts
interface SkyBlockMuseumDonation {
  readonly donatedAt: Date | null;
  readonly featuredSlot: string | null;
  readonly borrowing: boolean;
  readonly type: number;
  readonly data: string | null;
  readonly items: readonly NbtItem[];
}
```

| Field          | Notes                                                      |
| -------------- | ---------------------------------------------------------- |
| `donatedAt`    | Donation timestamp (raw `donated_time`).                   |
| `featuredSlot` | Featured slot (raw `featured_slot`), or `null` when empty. |
| `borrowing`    | Whether the item is borrowed (raw `borrowing`).            |
| `type`         | Raw `items.type`.                                          |
| `data`         | Raw base64/gzip item bytes (raw `items.data`), or `null`.  |
| `items`        | NBT items decoded from `data`.                             |

### SkyBlockMuseumItem

Extends `SkyBlockMuseumDonation` with the item's name (the key under the raw `items` object). The element type of `SkyBlockMuseumMember.items`.

```ts
interface SkyBlockMuseumItem extends SkyBlockMuseumDonation {
  readonly name: string;
}
```

The donation `items` field uses the `NbtItem` tree, documented on the [Bazaar & Auctions](./economy.md#decoded-nbt-item-types) page.

### SkyBlockGarden

The object returned by `parseGarden`.

```ts
interface SkyBlockGarden {
  readonly uuid: string;
  readonly gardenExperience: number;
  readonly barnSkin: string;
  readonly unlockedBarnSkins: readonly string[];
  readonly unlockedPlots: readonly string[];
  readonly visitors: SkyBlockGardenVisitors;
  readonly currentVisitors: readonly SkyBlockGardenActiveVisitor[];
  readonly cropMilestones: SkyBlockGardenCropMilestones;
  readonly composter: SkyBlockGardenComposter;
  readonly cropUpgrades: SkyBlockGardenCropMilestones;
  readonly gardenUpgrades: SkyBlockGardenUpgrades;
  readonly greenhouseSlots: readonly SkyBlockGardenGreenhouseSlot[];
  readonly lastGrowthStageTimestamp: number;
  readonly lastGrowthStageAt: Date | null;
}
```

| Field                                            | Notes                                                 |
| ------------------------------------------------ | ----------------------------------------------------- |
| `uuid`                                           | Garden uuid (raw `uuid`).                             |
| `gardenExperience`                               | Raw `garden_experience`.                              |
| `barnSkin`                                       | Selected barn skin (raw `selected_barn_skin`).        |
| `unlockedBarnSkins`                              | Raw `unlocked_barn_skins`.                            |
| `unlockedPlots`                                  | Raw `unlocked_plots_ids`.                             |
| `visitors`                                       | Aggregate visitor stats (raw `commission_data`).      |
| `currentVisitors`                                | Active visitors (raw `active_commissions`).           |
| `cropMilestones`                                 | Crop milestone amounts (raw `resources_collected`).   |
| `composter`                                      | Composter state (raw `composter_data`).               |
| `cropUpgrades`                                   | Crop upgrade levels (raw `crop_upgrade_levels`).      |
| `gardenUpgrades`                                 | Garden-wide upgrades (raw `garden_upgrades`).         |
| `greenhouseSlots`                                | Greenhouse slot coordinates (raw `greenhouse_slots`). |
| `lastGrowthStageTimestamp` / `lastGrowthStageAt` | Raw `last_growth_stage_time` as number and `Date`.    |

### SkyBlockGardenVisitors

Aggregate garden visitor counters, read from the raw `commission_data` object.

```ts
interface SkyBlockGardenVisitors {
  readonly visited: Record<string, number>;
  readonly completed: Record<string, number>;
  readonly totalCompleted: number;
  readonly uniqueNpcsServed: number;
}
```

| Field              | Notes                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| `visited`          | Per-visitor visit counts (raw `visits`); non-number values dropped.         |
| `completed`        | Per-visitor completion counts (raw `completed`); non-number values dropped. |
| `totalCompleted`   | Raw `total_completed`.                                                      |
| `uniqueNpcsServed` | Raw `unique_npcs_served`.                                                   |

### SkyBlockGardenActiveVisitor

An entry of `currentVisitors`. The `visitor` field is the key from the raw `active_commissions` object.

```ts
interface SkyBlockGardenActiveVisitor {
  readonly visitor: string;
  readonly requirements: readonly SkyBlockGardenVisitorRequirement[];
  readonly bonusRewards: readonly SkyBlockGardenVisitorReward[];
  readonly status: string;
  readonly position: number;
}
```

| Field          | Notes                                        |
| -------------- | -------------------------------------------- |
| `visitor`      | Visitor npc name (the raw map key).          |
| `requirements` | Required items (raw `requirement`).          |
| `bonusRewards` | Bonus rewards granted (raw `bonus_rewards`). |
| `status`       | Raw `status`.                                |
| `position`     | Raw `position`.                              |

### SkyBlockGardenVisitorRequirement

```ts
interface SkyBlockGardenVisitorRequirement {
  readonly originalItem: string;
  readonly originalAmount: number;
  readonly item: string;
  readonly amount: number;
}
```

| Field            | Notes                  |
| ---------------- | ---------------------- |
| `originalItem`   | Raw `original_item`.   |
| `originalAmount` | Raw `original_amount`. |
| `item`           | Raw `item`.            |
| `amount`         | Raw `amount`.          |

### SkyBlockGardenVisitorReward

An entry of `bonusRewards`.

```ts
interface SkyBlockGardenVisitorReward {
  readonly itemId: string;
  readonly amount: number;
}
```

| Field    | Notes          |
| -------- | -------------- |
| `itemId` | Raw `item_id`. |
| `amount` | Raw `amount`.  |

### SkyBlockGardenCrops

Per-crop amounts, read from raw vanilla item keys.

```ts
interface SkyBlockGardenCrops {
  readonly wheat: number;
  readonly carrot: number;
  readonly sugarCane: number;
  readonly potato: number;
  readonly pumpkin: number;
  readonly melon: number;
  readonly cactus: number;
  readonly cocoaBeans: number;
  readonly mushroom: number;
  readonly netherWart: number;
}
```

| Field        | Raw key               |
| ------------ | --------------------- |
| `wheat`      | `WHEAT`               |
| `carrot`     | `CARROT_ITEM`         |
| `sugarCane`  | `SUGAR_CANE`          |
| `potato`     | `POTATO_ITEM`         |
| `pumpkin`    | `PUMPKIN`             |
| `melon`      | `MELON`               |
| `cactus`     | `CACTUS`              |
| `cocoaBeans` | `INK_SACK:3`          |
| `mushroom`   | `MUSHROOM_COLLECTION` |
| `netherWart` | `NETHER_STALK`        |

### SkyBlockGardenCropMilestones

Extends `SkyBlockGardenCrops` with three flower crops. Used for both `cropMilestones` (raw `resources_collected`) and `cropUpgrades` (raw `crop_upgrade_levels`).

```ts
interface SkyBlockGardenCropMilestones extends SkyBlockGardenCrops {
  readonly moonFlower: number;
  readonly sunFlower: number;
  readonly wildRose: number;
}
```

| Field        | Raw key        |
| ------------ | -------------- |
| `moonFlower` | `MOONFLOWER`   |
| `sunFlower`  | `DOUBLE_PLANT` |
| `wildRose`   | `WILD_ROSE`    |

### SkyBlockGardenComposter

Composter state, read from the raw `composter_data` object.

```ts
interface SkyBlockGardenComposter {
  readonly organicMatter: number;
  readonly fuelUnits: number;
  readonly compostUnits: number;
  readonly compostItems: number;
  readonly conversionTicks: number;
  readonly lastSaveTimestamp: number;
  readonly lastSaveAt: Date | null;
  readonly upgrades: SkyBlockGardenComposterUpgrades;
}
```

| Field                              | Notes                                      |
| ---------------------------------- | ------------------------------------------ |
| `organicMatter`                    | Raw `organic_matter`.                      |
| `fuelUnits`                        | Raw `fuel_units`.                          |
| `compostUnits`                     | Raw `compost_units`.                       |
| `compostItems`                     | Raw `compost_items`.                       |
| `conversionTicks`                  | Raw `conversion_ticks`.                    |
| `lastSaveTimestamp` / `lastSaveAt` | Raw `last_save` as number and `Date`.      |
| `upgrades`                         | Composter upgrade levels (raw `upgrades`). |

### SkyBlockGardenComposterUpgrades

```ts
interface SkyBlockGardenComposterUpgrades {
  readonly speed: number;
  readonly multiDrop: number;
  readonly fuelCap: number;
  readonly organicMatterCap: number;
  readonly costReduction: number;
}
```

| Field              | Raw key              |
| ------------------ | -------------------- |
| `speed`            | `speed`              |
| `multiDrop`        | `multi_drop`         |
| `fuelCap`          | `fuel_cap`           |
| `organicMatterCap` | `organic_matter_cap` |
| `costReduction`    | `cost_reduction`     |

### SkyBlockGardenUpgrades

Garden-wide upgrades, read from the raw `garden_upgrades` object.

```ts
interface SkyBlockGardenUpgrades {
  readonly growthSpeed: number;
  readonly yield: number;
  readonly plotLimit: number;
}
```

| Field         | Raw key        |
| ------------- | -------------- |
| `growthSpeed` | `GROWTH_SPEED` |
| `yield`       | `YIELD`        |
| `plotLimit`   | `PLOT_LIMIT`   |

### SkyBlockGardenGreenhouseSlot

```ts
interface SkyBlockGardenGreenhouseSlot {
  readonly x: number;
  readonly z: number;
}
```

### SkyBlockFireSale

An entry returned by `parseFireSales`.

```ts
interface SkyBlockFireSale {
  readonly itemId: string;
  readonly amount: number;
  readonly price: number;
  readonly startTimestamp: number;
  readonly startAt: Date | null;
  readonly endTimestamp: number;
  readonly endAt: Date | null;
}
```

| Field                        | Notes                             |
| ---------------------------- | --------------------------------- |
| `itemId`                     | Raw `item_id`.                    |
| `amount`                     | Raw `amount`.                     |
| `price`                      | Raw `price`.                      |
| `startTimestamp` / `startAt` | Raw `start` as number and `Date`. |
| `endTimestamp` / `endAt`     | Raw `end` as number and `Date`.   |

### SkyBlockNewsItem

An entry returned by `parseSkyBlockNews`.

```ts
interface SkyBlockNewsItem {
  readonly title: string;
  readonly link: string;
  readonly text: string;
  readonly item: SkyBlockNewsDisplayItem;
}
```

### SkyBlockNewsDisplayItem

```ts
interface SkyBlockNewsDisplayItem {
  readonly material: string;
}
```

### PlayerBingoEvent

An entry returned by `parsePlayerBingo`.

```ts
interface PlayerBingoEvent {
  readonly key: number;
  readonly points: number;
  readonly completedGoals: readonly string[];
}
```

| Field            | Notes                                       |
| ---------------- | ------------------------------------------- |
| `key`            | Event key (raw `key`).                      |
| `points`         | Points earned (raw `points`).               |
| `completedGoals` | Completed goal ids (raw `completed_goals`). |

### SkyBlockBingoResource

The object returned by `parseSkyBlockBingo`.

```ts
interface SkyBlockBingoResource {
  readonly lastUpdated: Date | null;
  readonly id: number;
  readonly name: string;
  readonly start: Date | null;
  readonly end: Date | null;
  readonly modifier: string;
  readonly goals: SkyBlockBingoGoal[];
}
```

| Field           | Notes                            |
| --------------- | -------------------------------- |
| `lastUpdated`   | Resource last-updated timestamp. |
| `id`            | Event id (raw `id`).             |
| `name`          | Event name (raw `name`).         |
| `start` / `end` | Event start / end timestamps.    |
| `modifier`      | Event modifier (raw `modifier`). |
| `goals`         | Goal definitions (raw `goals`).  |

### SkyBlockBingoGoal

```ts
interface SkyBlockBingoGoal {
  readonly id: string;
  readonly name: string;
  readonly lore: string;
  readonly fullLore: string[];
  readonly progress: number;
  readonly tiers: number[];
  readonly requiredAmount: number | null;
}
```

| Field            | Notes                                                |
| ---------------- | ---------------------------------------------------- |
| `id`             | Goal id (raw `id`).                                  |
| `name`           | Goal name (raw `name`).                              |
| `lore`           | Single-line lore (raw `lore`).                       |
| `fullLore`       | Multi-line lore (raw `fullLore`).                    |
| `progress`       | Raw `progress`.                                      |
| `tiers`          | Tier thresholds (raw `tiers`).                       |
| `requiredAmount` | Raw `requiredAmount` when numeric, otherwise `null`. |
