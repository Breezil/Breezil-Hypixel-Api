# True Combat / Crazy Walls (computed)

Derived True Combat (Crazy Walls) statistics computed from the parsed `TrueCombatStats` shape. Produced by `computeTrueCombat(raw: TrueCombatStats): TrueCombatComputed` in `src/computed/modes/truecombat.ts`.

Conventions used on this page (from the shared ratio helpers):

- Ratios (`kdr`, `wlr`, `winRate`, `*PerGame`, `arrowAccuracy`, `averageSurvivors`, `*Rate`) are bare numbers rounded to 2 decimals. A zero denominator yields the numerator.
- `*Share` fields are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).
- `*ForNext*` fields are the additional amount of the numerator stat needed to reach the next whole-number ratio. They are `0` when the denominator is `0`.

## `TrueCombatComputed`

```ts
export interface TrueCombatComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly arrowAccuracy: number;
  readonly averageSurvivors: number;
  readonly skullsPerGame: number;
  readonly goldenSkullConversionRate: number;
  readonly giantZombieRareLootRate: number;
  readonly totalCrazyWallsKills: number;
  readonly kitsUnlockedCount: number;
  readonly modes: Readonly<Record<string, TrueCombatModeComputed>>;
}
```

| Field                       | Formula / meaning                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kdr`                       | Kill/death ratio: `kills / deaths` (bare ratio; equals `kills` when `deaths` is `0`).                                                                  |
| `killsForNextKdr`           | Kills needed to lift the KDR to the next whole number: `ceil((floor(kills / deaths) + 1) * deaths - kills)`, floored at `0`; `0` when `deaths` is `0`. |
| `wlr`                       | Win/loss ratio: `wins / losses`.                                                                                                                       |
| `winsForNextWlr`            | Wins needed to lift the win/loss ratio to the next whole number (same rule, applied to `wins` over `losses`).                                          |
| `winRate`                   | Wins per game, as a bare ratio: `wins / games`.                                                                                                        |
| `killsPerGame`              | `kills / games`.                                                                                                                                       |
| `arrowAccuracy`             | Arrows hit per arrow shot, as a bare ratio: `arrowsHit / arrowsShot`.                                                                                  |
| `averageSurvivors`          | Average players outlived per game, as a bare ratio: `survivedPlayers / games`.                                                                         |
| `skullsPerGame`             | `skullsGathered / games`.                                                                                                                              |
| `goldenSkullConversionRate` | Golden skulls per gathered skull, as a bare ratio: `goldenSkulls / skullsGathered`.                                                                    |
| `giantZombieRareLootRate`   | Rare-or-better loot drops per giant zombie kill, as a bare ratio: `(giantZombieLegendaries + giantZombieRares) / giantZombie`.                         |
| `totalCrazyWallsKills`      | Sum of `kills` across all entries of `raw.crazyWalls` (the per-mode kill total used as the denominator for per-mode `killShare`).                      |
| `kitsUnlockedCount`         | Number of keys in `raw.kits` (each key is an unlocked kit).                                                                                            |
| `modes`                     | One [`TrueCombatModeComputed`](#truecombatmodecomputed) per mode key in `raw.crazyWalls`.                                                              |

## `TrueCombatModeComputed`

Per-mode Crazy Walls stats, computed for every entry of `raw.crazyWalls`.

```ts
export interface TrueCombatModeComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killShare: number;
}
```

| Field       | Formula / meaning                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `kdr`       | Mode kill/death ratio: `kills / deaths`.                                                                         |
| `wlr`       | Mode win/loss ratio: `wins / losses`.                                                                            |
| `winRate`   | Mode wins per game, as a bare ratio: `wins / games`.                                                             |
| `killShare` | Percentage (0 to 100) of all Crazy Walls kills scored in this mode: `percent(mode.kills, totalCrazyWallsKills)`. |

## `computeTrueCombat`

```ts
export function computeTrueCombat(raw: TrueCombatStats): TrueCombatComputed;
```

Takes the parsed `TrueCombatStats` from `@breezil/hypixel-parsers`. It first sums kills across `raw.crazyWalls` to get `totalCrazyWallsKills`, builds the per-mode `modes` record using that total for `killShare`, then fills the overall fields from top-level counters on `raw`.

