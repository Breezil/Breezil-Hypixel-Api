# Garden Computed

Source: `src/computed/skyblock-garden.ts`. Attached as `.computed` on the
[`EnrichedGarden`](./) returned by `skyblockGarden()`.

```ts
export function computeGarden(raw: SkyBlockGarden): GardenComputed;
```

## `GardenComputed`

```ts
interface GardenComputed {
  readonly level: XpLevel;
  readonly cropMilestones: Record<CropType, XpLevel>;
  readonly totalCropMilestoneLevel: number;
  readonly averageCropMilestoneLevel: number;
  readonly maxedCropCount: number;
  readonly highestCrop: CropType | null;
  readonly totalCropsCollected: number;
  readonly totalCropUpgradeLevel: number;
  readonly averageCropUpgrade: number;
  readonly unlockedPlotCount: number;
  readonly unlockedBarnSkinCount: number;
  readonly greenhouseSlotCount: number;
  readonly totalVisits: number;
  readonly activeVisitorCount: number;
  readonly visitorCompletionShare: number;
  readonly uniqueVisitorShare: number;
  readonly completionsPerUniqueVisitor: number;
  readonly composterUpgradeLevelTotal: number;
}
```

`XpLevel` is the shared leveling shape (`level`, `xpCurrent`, `xpForNext`, `progress`,
`totalXp`, `maxed`) documented in [Shared helpers](./shared#xplevel).

## Level

### `level`

`gardenLevel(raw.gardenExperience)`: garden level on the fixed 15-level garden curve
(70 xp for level 2 up through 10,000 xp steps for levels 11 to 15; see
[Shared helpers](./shared#gardenlevel)). `maxed` is `true` at level 15.

## Crop milestones

All milestone math runs over the thirteen crop types, in this fixed order:

```ts
type CropType =
  | "wheat"
  | "carrot"
  | "sugarCane"
  | "potato"
  | "pumpkin"
  | "melon"
  | "cactus"
  | "cocoaBeans"
  | "mushroom"
  | "netherWart"
  | "moonFlower"
  | "sunFlower"
  | "wildRose";
```

### `cropMilestones`

One `XpLevel` per crop, from `cropMilestoneLevel(crop, raw.cropMilestones[crop])`. The
"xp" here is the crop's collection count; each crop uses its own milestone table capped
at level 46 (see [Shared helpers](./shared#crop-milestones)).

### `totalCropMilestoneLevel`

The sum of the thirteen milestone `level` values.

### `averageCropMilestoneLevel`

`totalCropMilestoneLevel / 13`, rounded to 2 decimal places (`ratio()`).

### `maxedCropCount`

How many of the thirteen crops are at the milestone cap (`maxed === true`, level 46).

### `highestCrop`

The crop with the highest milestone `level`. Ties keep the earlier crop in the order
above. Because every milestone level is at least `0` and the tracker starts below zero,
this is always a crop, never `null`, for any real garden (the `null` case exists only in
the type).

### `totalCropsCollected`

The sum of the raw `raw.cropMilestones[crop]` counters across all thirteen crops: total
crops ever collected toward milestones.

## Crop upgrades

### `totalCropUpgradeLevel`

The sum of `raw.cropUpgrades[crop]` across all thirteen crops.

### `averageCropUpgrade`

`totalCropUpgradeLevel / 13`, rounded to 2 decimal places (`ratio()`).

## Unlocks

### `unlockedPlotCount`

`raw.unlockedPlots.length`.

### `unlockedBarnSkinCount`

`raw.unlockedBarnSkins.length`.

### `greenhouseSlotCount`

`raw.greenhouseSlots.length`.

## Visitors

### `totalVisits`

The sum of all per-NPC visit counters in `raw.visitors.visited`.

### `activeVisitorCount`

`raw.currentVisitors.length`: visitors standing in the garden right now.

### `visitorCompletionShare`

`percent(raw.visitors.totalCompleted, totalVisits)`: the share of all visits whose offer
was served, 0 to 100.

### `uniqueVisitorShare`

`percent(raw.visitors.uniqueNpcsServed, raw.visitors.totalCompleted)`: of all served
visits, the share represented by first-time (unique) NPCs, 0 to 100.

### `completionsPerUniqueVisitor`

`ratio(raw.visitors.totalCompleted, raw.visitors.uniqueNpcsServed)`: average number of
completed offers per distinct NPC served, a bare quotient.

## Composter

### `composterUpgradeLevelTotal`

The sum of the five composter upgrade levels:
`speed + multiDrop + fuelCap + organicMatterCap + costReduction`.

## Exports

| Export           | Kind      | Description                                 |
| ---------------- | --------- | ------------------------------------------- |
| `GardenComputed` | interface | The `.computed` shape on an enriched garden |
| `computeGarden`  | function  | `(raw: SkyBlockGarden) => GardenComputed`   |

