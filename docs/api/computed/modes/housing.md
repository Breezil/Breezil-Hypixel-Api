# Housing (computed)

Derived Housing statistics (cosmetic packages, kill messages, custom layouts) computed from the parsed `HousingStats` shape. Produced by `computeHousing(raw: HousingStats): HousingComputed` in `src/computed/modes/housing.ts`.

Package categorization rule: for a package id, if it contains `_pack`, the category is everything before `_pack` (for example `specialoccasions_pack_a` becomes `specialoccasions`); otherwise the category is the first `_`-separated segment (for example `flags_green` becomes `flags`), falling back to the whole id when the first segment is empty.

## `HousingComputed`

```ts
export interface HousingComputed {
  readonly packagesOwnedCount: number;
  readonly packageCategoryBreakdown: Readonly<Record<string, number>>;
  readonly activeKillMessageName: string;
  readonly hasActiveKillMessage: boolean;
  readonly customLayoutCount: number;
  readonly placedLayoutItemsTotal: number;
  readonly distinctLayoutItemTypesCount: number;
  readonly usesCustomLeaderboardReset: boolean;
}
```

| Field                          | Formula / meaning                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packagesOwnedCount`           | `raw.packages.length`: total Housing packages owned.                                                                                                                                                                 |
| `packageCategoryBreakdown`     | Count of owned packages per category, keyed by the category derived from each package id using the rule above.                                                                                                       |
| `activeKillMessageName`        | `raw.activeKillMessages` with a leading `killmessages_` prefix stripped when present; otherwise the raw value unchanged (so an empty string stays empty).                                                            |
| `hasActiveKillMessage`         | Whether `raw.activeKillMessages` is a non-empty string.                                                                                                                                                              |
| `customLayoutCount`            | Number of keys in `raw.layoutItemsById` (each key is a stored custom layout).                                                                                                                                        |
| `placedLayoutItemsTotal`       | Number of keys in `raw.layoutItems` (the default layout) plus the number of keys in every layout of `raw.layoutItemsById`.                                                                                           |
| `distinctLayoutItemTypesCount` | Number of distinct item types placed across the default layout and all custom layouts. An item type is the part of each non-empty string layout value before the first `;` (non-string or empty values are ignored). |
| `usesCustomLeaderboardReset`   | Whether `raw.leaderboardSettings.resetType` is set to something other than the empty string and `"NEVER"`.                                                                                                           |

## `computeHousing`

```ts
export function computeHousing(raw: HousingStats): HousingComputed;
```

Takes the parsed `HousingStats` from `@breezil/hypixel-parsers` and returns the computed block above. Layout scanning walks `raw.layoutItems` and every layout in `raw.layoutItemsById` once, counting placed slots and collecting distinct item type prefixes into a set.

