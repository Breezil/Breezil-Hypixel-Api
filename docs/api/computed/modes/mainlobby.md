# Main Lobby (computed)

Derived Main Lobby statistics (fishing, zones, relics, Become Rabbit) computed from the parsed `MainLobbyStats` shape. Produced by `computeMainLobby(raw: MainLobbyStats): MainLobbyComputed` in `src/computed/modes/mainlobby.ts`.

Fishing catch totals aggregate the three permanent liquid types: `water`, `lava`, and `ice`, read from `raw.fishing.stats.permanent.counts`. When `permanent` is missing, each count record is treated as empty (all totals `0`).

Conventions used on this page:

- Ratios (`treasureCatchRate`, `junkCatchRate`, `treasureToJunkRatio`) are bare numbers rounded to 2 decimals. A zero denominator yields the numerator.
- `*Share` fields are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).

## `MainLobbyComputed`

```ts
export interface MainLobbyComputed {
  readonly totalFishingCatches: number;
  readonly treasureCatchRate: number;
  readonly junkCatchRate: number;
  readonly lavaCatchShare: number;
  readonly totalOrbsCollected: number;
  readonly zonesDiscoveredCount: number;
  readonly relicsCollectedCount: number;
  readonly specialFishCaughtCount: number;
  readonly totalFishingEnchantLevels: number;
  readonly becomeRabbitTotalEaten: number;
  readonly treasureToJunkRatio: number;
  readonly uniqueFishSpeciesCaught: number;
}
```

| Field                       | Formula / meaning                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `totalFishingCatches`       | Sum of every category count across the `water`, `lava`, and `ice` permanent count records: `sum(water) + sum(lava) + sum(ice)`.                                         |
| `treasureCatchRate`         | Treasure catches per catch, as a bare ratio: `totalTreasure / totalFishingCatches`, where `totalTreasure` is the `"treasure"` category summed across the three liquids. |
| `junkCatchRate`             | Junk catches per catch, as a bare ratio: `totalJunk / totalFishingCatches`, where `totalJunk` is the `"junk"` category summed across the three liquids.                 |
| `lavaCatchShare`            | Percentage (0 to 100) of all catches made in lava: `percent(sum(lava), totalFishingCatches)`.                                                                           |
| `totalOrbsCollected`        | Sum of all values in `raw.fishing.orbs.counts`.                                                                                                                         |
| `zonesDiscoveredCount`      | Number of `true` flags in `raw.discoveredZones`.                                                                                                                        |
| `relicsCollectedCount`      | Number of `true` flags in `raw.relics`.                                                                                                                                 |
| `specialFishCaughtCount`    | Number of `true` flags in `raw.fishing.specialFish`.                                                                                                                    |
| `totalFishingEnchantLevels` | Sum of `enchant.level` across all entries of `raw.fishing.enchants`.                                                                                                    |
| `becomeRabbitTotalEaten`    | Sum of all values in `raw.becomeRabbit.eaten`.                                                                                                                          |
| `treasureToJunkRatio`       | Treasure per junk catch, as a bare ratio: `totalTreasure / totalJunk` (equals `totalTreasure` when `totalJunk` is `0`).                                                 |
| `uniqueFishSpeciesCaught`   | Number of fish species with a positive catch count in `raw.fishing.stats.permanent.individual.fish` (empty record when `permanent` is missing).                         |

## `computeMainLobby`

```ts
export function computeMainLobby(raw: MainLobbyStats): MainLobbyComputed;
```

Takes the parsed `MainLobbyStats` from `@breezil/hypixel-parsers` and returns the computed block above. Category totals such as treasure and junk are computed per category name by summing `water[category] + lava[category] + ice[category]` with missing categories treated as `0`.

