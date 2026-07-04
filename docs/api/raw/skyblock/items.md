# SkyBlock Items

The items module (`skyblock-items.ts`) converts the raw Hypixel SkyBlock item registry JSON into readonly, fully-typed objects. It exposes a single parser, `parseSkyBlockItems`, which mirrors the raw API field-for-field with no computation or derived values. Missing numbers become `0`, missing strings become `""`, and boolean fields are `true` only when the raw value is exactly `true`.

## parseSkyBlockItems

Parses the SkyBlock item registry (`/resources/skyblock/items`) into an array of `SkyBlockItem`.

```ts
function parseSkyBlockItems(items: unknown[]): SkyBlockItem[];
```

### Null / empty behavior

- Entries that are not non-array objects are skipped.
- Object-array fields (`salvages`, `gemstoneSlots`, `requirements`, `catacombsRequirements`, `components`, `recipes`, and each cost list) return `[]` when their raw field is missing or not an array; non-object entries are filtered out.
- `upgradeCosts` is a nested array: each inner entry is `[]` when not an array, with non-object elements filtered out.
- Map fields (`stats`, `enchantments`, `tieredStats`, `museumData.parent`, `museumData.armorSetDonationXp`, `recipe.ingredientSymbols`, `itemSpecific`) keep only entries whose values are of the expected type.
- `durability` is the raw `durability` when it is a string or number, otherwise `0`.
- `hasUuid` is the raw `has_uuid` when it is a string, otherwise the boolean `has_uuid === true`.
- Always returns an array (possibly empty), never `null`.

---

## Returned type tree

### SkyBlockItem

An entry returned by `parseSkyBlockItems`.

```ts
interface SkyBlockItem {
  readonly id: string;
  readonly name: string;
  readonly material: string;
  readonly durability: number | string;
  readonly skin: SkyBlockItemSkin;
  readonly itemModel: string;
  readonly category: string;
  readonly categoryDisplay: string;
  readonly tier: string;
  readonly rarity: string;
  readonly npcSellPrice: number;
  readonly motesSellPrice: number;
  readonly salvages: ReadonlyArray<SkyBlockItemCost>;
  readonly salvage: SkyBlockItemCost;
  readonly raritySalvageable: boolean;
  readonly salvageableFromRecipe: boolean;
  readonly stats: Readonly<Record<string, number>>;
  readonly tieredStats: Readonly<Record<string, ReadonlyArray<number>>>;
  readonly miningFortune: number;
  readonly unstackable: boolean;
  readonly museumData: SkyBlockItemMuseumData;
  readonly museum: boolean;
  readonly color: string;
  readonly soulbound: string;
  readonly hasUuid: boolean | string;
  readonly gemstoneSlots: ReadonlyArray<SkyBlockItemGemstoneSlot>;
  readonly glowing: boolean;
  readonly canAuction: boolean;
  readonly canTrade: boolean;
  readonly requirements: ReadonlyArray<SkyBlockItemRequirement>;
  readonly catacombsRequirements: ReadonlyArray<SkyBlockItemRequirement>;
  readonly canPlace: boolean;
  readonly generator: string;
  readonly generatorTier: number;
  readonly furniture: string;
  readonly components: ReadonlyArray<SkyBlockItemComponent>;
  readonly itemSpecific: Readonly<Record<string, SkyBlockJsonValue>>;
  readonly description: string;
  readonly upgradeCosts: ReadonlyArray<ReadonlyArray<SkyBlockItemCost>>;
  readonly gearScore: number;
  readonly dungeonItem: boolean;
  readonly dungeonItemConversionCost: SkyBlockItemCost;
  readonly canHaveAttributes: boolean;
  readonly canHaveBooster: boolean;
  readonly canRecombobulate: boolean;
  readonly cannotReforge: boolean;
  readonly forceWipeRecomb: boolean;
  readonly enchantments: Readonly<Record<string, number>>;
  readonly riftTransferrable: boolean;
  readonly loseMotesValueOnTransfer: boolean;
  readonly origin: string;
  readonly editioned: boolean;
  readonly hideFromApi: boolean;
  readonly doubleTapToDrop: boolean;
  readonly hideFromViewRecipeCommand: boolean;
  readonly swordType: string;
  readonly abilityDamageScaling: number;
  readonly crystal: string;
  readonly canBurnInFurnace: boolean;
  readonly serializable: boolean;
  readonly canInteract: boolean;
  readonly canInteractRightClick: boolean;
  readonly canInteractEntity: boolean;
  readonly privateIsland: string;
  readonly canHavePowerScroll: boolean;
  readonly isUpgradeableWithoutSoulbinding: boolean;
  readonly recipes: ReadonlyArray<SkyBlockItemRecipe>;
  readonly prestige: SkyBlockItemPrestige;
}
```

| Field                             | Raw key / notes                                 |
| --------------------------------- | ----------------------------------------------- |
| `id`                              | `id`.                                           |
| `name`                            | `name`.                                         |
| `material`                        | `material`.                                     |
| `durability`                      | `durability` (string or number; otherwise `0`). |
| `skin`                            | `skin`.                                         |
| `itemModel`                       | `item_model`.                                   |
| `category`                        | `category`.                                     |
| `categoryDisplay`                 | `category_display`.                             |
| `tier`                            | `tier`.                                         |
| `rarity`                          | `rarity`.                                       |
| `npcSellPrice`                    | `npc_sell_price`.                               |
| `motesSellPrice`                  | `motes_sell_price`.                             |
| `salvages`                        | `salvages`.                                     |
| `salvage`                         | `salvage`.                                      |
| `raritySalvageable`               | `rarity_salvageable`.                           |
| `salvageableFromRecipe`           | `salvageable_from_recipe`.                      |
| `stats`                           | `stats` (number map).                           |
| `tieredStats`                     | `tiered_stats` (number-array map).              |
| `miningFortune`                   | `MINING_FORTUNE`.                               |
| `unstackable`                     | `unstackable`.                                  |
| `museumData`                      | `museum_data`.                                  |
| `museum`                          | `museum`.                                       |
| `color`                           | `color`.                                        |
| `soulbound`                       | `soulbound`.                                    |
| `hasUuid`                         | `has_uuid` (string when string, else boolean).  |
| `gemstoneSlots`                   | `gemstone_slots`.                               |
| `glowing`                         | `glowing`.                                      |
| `canAuction`                      | `can_auction`.                                  |
| `canTrade`                        | `can_trade`.                                    |
| `requirements`                    | `requirements`.                                 |
| `catacombsRequirements`           | `catacombs_requirements`.                       |
| `canPlace`                        | `can_place`.                                    |
| `generator`                       | `generator`.                                    |
| `generatorTier`                   | `generator_tier`.                               |
| `furniture`                       | `furniture`.                                    |
| `components`                      | `components`.                                   |
| `itemSpecific`                    | `item_specific` (arbitrary JSON map).           |
| `description`                     | `description`.                                  |
| `upgradeCosts`                    | `upgrade_costs` (array of cost arrays).         |
| `gearScore`                       | `gear_score`.                                   |
| `dungeonItem`                     | `dungeon_item`.                                 |
| `dungeonItemConversionCost`       | `dungeon_item_conversion_cost`.                 |
| `canHaveAttributes`               | `can_have_attributes`.                          |
| `canHaveBooster`                  | `can_have_booster`.                             |
| `canRecombobulate`                | `can_recombobulate`.                            |
| `cannotReforge`                   | `cannot_reforge`.                               |
| `forceWipeRecomb`                 | `force_wipe_recomb`.                            |
| `enchantments`                    | `enchantments` (number map).                    |
| `riftTransferrable`               | `rift_transferrable`.                           |
| `loseMotesValueOnTransfer`        | `lose_motes_value_on_transfer`.                 |
| `origin`                          | `origin`.                                       |
| `editioned`                       | `editioned`.                                    |
| `hideFromApi`                     | `hide_from_api`.                                |
| `doubleTapToDrop`                 | `double_tap_to_drop`.                           |
| `hideFromViewRecipeCommand`       | `hide_from_viewrecipe_command`.                 |
| `swordType`                       | `sword_type`.                                   |
| `abilityDamageScaling`            | `ability_damage_scaling`.                       |
| `crystal`                         | `crystal`.                                      |
| `canBurnInFurnace`                | `can_burn_in_furnace`.                          |
| `serializable`                    | `serializable`.                                 |
| `canInteract`                     | `can_interact`.                                 |
| `canInteractRightClick`           | `can_interact_right_click`.                     |
| `canInteractEntity`               | `can_interact_entity`.                          |
| `privateIsland`                   | `private_island`.                               |
| `canHavePowerScroll`              | `can_have_power_scroll`.                        |
| `isUpgradeableWithoutSoulbinding` | `is_upgradeable_without_soulbinding`.           |
| `recipes`                         | `recipes`.                                      |
| `prestige`                        | `prestige`.                                     |

### SkyBlockItemSkin

Read from the raw `skin` object.

```ts
interface SkyBlockItemSkin {
  readonly value: string;
  readonly signature: string;
}
```

### SkyBlockItemCost

A single cost entry. Used by `salvages`, `salvage`, `gemstoneSlots[].costs`, `upgradeCosts`, `dungeonItemConversionCost`, and `prestige.costs`.

```ts
interface SkyBlockItemCost {
  readonly type: string;
  readonly essenceType: string;
  readonly itemId: string;
  readonly coins: number;
  readonly amount: number;
}
```

| Field         | Raw key        |
| ------------- | -------------- |
| `type`        | `type`         |
| `essenceType` | `essence_type` |
| `itemId`      | `item_id`      |
| `coins`       | `coins`        |
| `amount`      | `amount`       |

### SkyBlockItemMuseumData

Read from the raw `museum_data` object.

```ts
interface SkyBlockItemMuseumData {
  readonly donationXp: number;
  readonly category: string;
  readonly parent: Readonly<Record<string, string>>;
  readonly mappedItemIds: ReadonlyArray<string>;
  readonly gameStage: string;
  readonly armorSetDonationXp: Readonly<Record<string, number>>;
}
```

| Field                | Raw key                              |
| -------------------- | ------------------------------------ |
| `donationXp`         | `donation_xp`                        |
| `category`           | `category`                           |
| `parent`             | `parent` (string map)                |
| `mappedItemIds`      | `mapped_item_ids`                    |
| `gameStage`          | `game_stage`                         |
| `armorSetDonationXp` | `armor_set_donation_xp` (number map) |

### SkyBlockItemGemstoneSlot

An entry of `gemstoneSlots`.

```ts
interface SkyBlockItemGemstoneSlot {
  readonly slotType: string;
  readonly costs: ReadonlyArray<SkyBlockItemCost>;
  readonly requirements: ReadonlyArray<SkyBlockItemGemstoneSlotRequirement>;
}
```

| Field          | Raw key        |
| -------------- | -------------- |
| `slotType`     | `slot_type`    |
| `costs`        | `costs`        |
| `requirements` | `requirements` |

### SkyBlockItemGemstoneSlotRequirement

An entry of `SkyBlockItemGemstoneSlot.requirements`.

```ts
interface SkyBlockItemGemstoneSlotRequirement {
  readonly type: string;
  readonly dataKey: string;
  readonly value: string;
  readonly operator: string;
}
```

| Field      | Raw key    |
| ---------- | ---------- |
| `type`     | `type`     |
| `dataKey`  | `data_key` |
| `value`    | `value`    |
| `operator` | `operator` |

### SkyBlockItemRequirement

Used by `requirements` and `catacombsRequirements`. Self-referential: a requirement may contain nested `requirements`.

```ts
interface SkyBlockItemRequirement {
  readonly type: string;
  readonly skill: string;
  readonly level: number;
  readonly tier: number;
  readonly dungeonType: string;
  readonly slayerBossType: string;
  readonly collection: string;
  readonly reward: string;
  readonly faction: string;
  readonly reputation: number;
  readonly trophyType: string;
  readonly rabbit: string;
  readonly mode: string;
  readonly kuudraTier: string;
  readonly profileType: string;
  readonly amount: number;
  readonly loreIndex: number;
  readonly minimumAge: number;
  readonly minimumAgeUnit: string;
  readonly requirements: ReadonlyArray<SkyBlockItemRequirement>;
}
```

| Field            | Raw key               |
| ---------------- | --------------------- |
| `type`           | `type`                |
| `skill`          | `skill`               |
| `level`          | `level`               |
| `tier`           | `tier`                |
| `dungeonType`    | `dungeon_type`        |
| `slayerBossType` | `slayer_boss_type`    |
| `collection`     | `collection`          |
| `reward`         | `reward`              |
| `faction`        | `faction`             |
| `reputation`     | `reputation`          |
| `trophyType`     | `trophy_type`         |
| `rabbit`         | `rabbit`              |
| `mode`           | `mode`                |
| `kuudraTier`     | `kuudra_tier`         |
| `profileType`    | `profile_type`        |
| `amount`         | `amount`              |
| `loreIndex`      | `lore_index`          |
| `minimumAge`     | `minimum_age`         |
| `minimumAgeUnit` | `minimum_age_unit`    |
| `requirements`   | nested `requirements` |

### SkyBlockItemComponent

An entry of `components`.

```ts
interface SkyBlockItemComponent {
  readonly type: string;
  readonly showItemsFirst: ReadonlyArray<string>;
  readonly showItemsLast: ReadonlyArray<string>;
  readonly excludedItems: ReadonlyArray<string>;
  readonly sortByCategory: boolean;
  readonly allowDuplicates: boolean;
  readonly sortByAccessoryTier: boolean;
}
```

| Field                 | Raw key                  |
| --------------------- | ------------------------ |
| `type`                | `type`                   |
| `showItemsFirst`      | `show_items_first`       |
| `showItemsLast`       | `show_items_last`        |
| `excludedItems`       | `excluded_items`         |
| `sortByCategory`      | `sort_by_category`       |
| `allowDuplicates`     | `allow_duplicates`       |
| `sortByAccessoryTier` | `sort_by_accessory_tier` |

### SkyBlockItemRecipe

An entry of `recipes`.

```ts
interface SkyBlockItemRecipe {
  readonly output: SkyBlockItemRecipeOutput;
  readonly ingredientSymbols: Readonly<Record<string, string>>;
  readonly matrix: ReadonlyArray<string>;
  readonly allowQuickCrafting: boolean;
}
```

| Field                | Raw key                           |
| -------------------- | --------------------------------- |
| `output`             | `output`                          |
| `ingredientSymbols`  | `ingredient_symbols` (string map) |
| `matrix`             | `matrix`                          |
| `allowQuickCrafting` | `allow_quick_crafting`            |

### SkyBlockItemRecipeOutput

```ts
interface SkyBlockItemRecipeOutput {
  readonly itemId: string;
}
```

`itemId` is read from the raw `output.item_id`.

### SkyBlockItemPrestige

Read from the raw `prestige` object.

```ts
interface SkyBlockItemPrestige {
  readonly itemId: string;
  readonly costs: ReadonlyArray<SkyBlockItemCost>;
}
```

| Field    | Raw key   |
| -------- | --------- |
| `itemId` | `item_id` |
| `costs`  | `costs`   |

### SkyBlockJsonValue

The recursive JSON value type used by `SkyBlockItem.itemSpecific`, preserving arbitrary per-item data verbatim.

```ts
type SkyBlockJsonValue =
  | string
  | number
  | boolean
  | null
  | readonly SkyBlockJsonValue[]
  | { readonly [key: string]: SkyBlockJsonValue };
```
