# Mega Walls computed stats

Computed Mega Walls statistics, derived from the parsed `MegaWallsStats` block. They are always present on an enriched player as `player.stats.megaWalls.computed` (when the raw `megaWalls` block exists), produced by `computeMegaWalls(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*Share` fields are percentages from 0 to 100 (0 when the whole is 0). `*ForNext*` fields are the additional amount needed to reach the next whole-number value of the corresponding ratio (0 when the denominator is 0).

Overall final kills, final deaths, final assists, and wither damage are the sum of the current stats block and the legacy top-level counters (`finalKillsLegacy`, `finalDeathsLegacy`, `finalAssistsLegacy`, `witherDamageLegacy`).

## `MegaWallsComputed`

```ts
export interface MegaWallsComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly fkdr: number;
  readonly finalKills: number;
  readonly finalDeaths: number;
  readonly finalAssists: number;
  readonly witherDamage: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly finalKillsPerGame: number;
  readonly kda: number;
  readonly meleeKillShare: number;
  readonly blockPlaceBreakRatio: number;
  readonly witherDamagePerGame: number;
  readonly finalsForNextFkdr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly favoriteKit: string;
  readonly modes: MegaWallsModesComputed;
  readonly byKit: Readonly<Record<string, MegaWallsRatioSet>>;
  readonly byClass: Readonly<Record<string, MegaWallsClassComputed>>;
}
```

In the table below, `kills`, `deaths`, `wins`, `losses`, `assists`, and `games` are the overall values from the stats block (`stats.kills.overall` and so on). `finalKills`, `finalDeaths`, `finalAssists`, and `witherDamage` include the legacy counters as described above.

| Field                  | Formula                                                                                          | Meaning                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `kdr`                  | `kills / deaths`                                                                                 | Kill/death ratio (bare ratio)                                                   |
| `wlr`                  | `wins / losses`                                                                                  | Win/loss ratio (bare ratio)                                                     |
| `fkdr`                 | `finalKills / finalDeaths`                                                                       | Final kill/final death ratio (bare ratio)                                       |
| `finalKills`           | `stats.finalKills.overall + finalKillsLegacy`                                                    | Total final kills including legacy                                              |
| `finalDeaths`          | `stats.finalDeaths.overall + finalDeathsLegacy`                                                  | Total final deaths including legacy                                             |
| `finalAssists`         | `stats.finalAssists.overall + finalAssistsLegacy`                                                | Total final assists including legacy                                            |
| `witherDamage`         | `stats.witherDamage.overall + witherDamageLegacy`                                                | Total wither damage including legacy                                            |
| `winRate`              | `wins / (wins + losses)`                                                                         | Fraction of games won (bare ratio, not a percent)                               |
| `killsPerGame`         | `kills / games`                                                                                  | Average kills per game played                                                   |
| `finalKillsPerGame`    | `finalKills / games`                                                                             | Average final kills per game played                                             |
| `kda`                  | `(kills + assists) / deaths`                                                                     | Kills plus assists per death (bare ratio)                                       |
| `meleeKillShare`       | `100 * stats.kills.melee.overall / kills`                                                        | Percent (0-100) of kills that were melee kills                                  |
| `blockPlaceBreakRatio` | `stats.blocksPlaced.overall / stats.blocksBroken.overall`                                        | Blocks placed per block broken (bare ratio)                                     |
| `witherDamagePerGame`  | `witherDamage / games`                                                                           | Average wither damage per game played                                           |
| `finalsForNextFkdr`    | `neededForNextWholeRatio(finalKills, finalDeaths)`                                               | Final kills needed to reach the next whole FKDR                                 |
| `killsForNextKdr`      | `neededForNextWholeRatio(kills, deaths)`                                                         | Kills needed to reach the next whole KDR                                        |
| `winsForNextWlr`       | `neededForNextWholeRatio(wins, losses)`                                                          | Wins needed to reach the next whole WLR                                         |
| `favoriteKit`          | kit name with the highest `stats.gamesPlayed.overall`, only counting kits with more than 0 games | Most-played kit; `""` when no kit has games                                     |
| `modes`                | see `MegaWallsModesComputed`                                                                     | Per-mode ratio sets (standard, faceOff, gvg)                                    |
| `byKit`                | `MegaWallsRatioSet` per kit, from each kit's overall stats                                       | Ratio set for every kit in `raw.kits`, keyed by kit name                        |
| `byClass`              | `MegaWallsClassComputed` per class                                                               | Extended per-class ratios for every class in `raw.byClass`, keyed by class name |

## `MegaWallsModesComputed`

```ts
export interface MegaWallsModesComputed {
  readonly standard: MegaWallsRatioSet;
  readonly faceOff: MegaWallsRatioSet;
  readonly gvg: MegaWallsRatioSet;
}
```

| Field      | Formula                                                 | Meaning                        |
| ---------- | ------------------------------------------------------- | ------------------------------ |
| `standard` | ratio set over the `standard` values of the stats block | Ratios for Standard mode       |
| `faceOff`  | ratio set over the `faceOff` values of the stats block  | Ratios for Face Off mode       |
| `gvg`      | ratio set over the `gvg` values of the stats block      | Ratios for Guild vs Guild mode |

## `MegaWallsRatioSet`

A compact ratio set. Used for each mode in `modes` (built from that mode's slice of the stats block) and for each kit in `byKit` (built from the kit's `overall` stats).

```ts
export interface MegaWallsRatioSet {
  readonly kdr: number;
  readonly wlr: number;
  readonly fkdr: number;
}
```

| Field  | Formula                                | Meaning                                                 |
| ------ | -------------------------------------- | ------------------------------------------------------- |
| `kdr`  | `kills[mode] / deaths[mode]`           | Kill/death ratio for the slice (bare ratio)             |
| `wlr`  | `wins[mode] / losses[mode]`            | Win/loss ratio for the slice (bare ratio)               |
| `fkdr` | `finalKills[mode] / finalDeaths[mode]` | Final kill/final death ratio for the slice (bare ratio) |

## `MegaWallsClassComputed`

Per-class ratios. One entry per class in `raw.byClass`; each formula uses that class's own `kills`, `deaths`, `wins`, `losses`, and `assists`.

```ts
export interface MegaWallsClassComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly kda: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
}
```

| Field             | Formula                                  | Meaning                                          |
| ----------------- | ---------------------------------------- | ------------------------------------------------ |
| `kdr`             | `kills / deaths`                         | Class kill/death ratio (bare ratio)              |
| `wlr`             | `wins / losses`                          | Class win/loss ratio (bare ratio)                |
| `winRate`         | `wins / (wins + losses)`                 | Fraction of the class's games won (bare ratio)   |
| `kda`             | `(kills + assists) / deaths`             | Class kills plus assists per death (bare ratio)  |
| `killsForNextKdr` | `neededForNextWholeRatio(kills, deaths)` | Kills needed to reach the class's next whole KDR |
| `winsForNextWlr`  | `neededForNextWholeRatio(wins, losses)`  | Wins needed to reach the class's next whole WLR  |

