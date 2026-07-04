# SkyClash (computed)

Derived SkyClash statistics computed from the parsed `SkyClashStats` shape. Produced by `computeSkyClash(raw: SkyClashStats): SkyClashComputed` in `src/computed/modes/skyclash.ts`.

Conventions used on this page (from the shared ratio helpers):

- Ratios (`kdr`, `kadr`, `winLossRatio`, `winRate`, `bowAccuracy`, `quitRate`, `*PerGame`, `mobKillEfficiency`) are bare numbers rounded to 2 decimals. A zero denominator yields the numerator.
- `*Share` fields are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).
- `*ForNext*` fields are the additional amount of the numerator stat needed to reach the next whole-number ratio. They are `0` when the denominator is `0`.

## `SkyClashComputed`

```ts
export interface SkyClashComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly kadr: number;
  readonly winLossRatio: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly bowAccuracy: number;
  readonly quitRate: number;
  readonly bowKillShare: number;
  readonly meleeKillShare: number;
  readonly voidKillShare: number;
  readonly killsPerGame: number;
  readonly mobKillEfficiency: number;
  readonly assistsPerGame: number;
  readonly masteredKitsCount: number;
  readonly modes: Readonly<Record<string, SkyClashModeComputed>>;
}
```

| Field               | Formula / meaning                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kdr`               | Kill/death ratio: `kills / deaths` (bare ratio; equals `kills` when `deaths` is `0`).                                                                  |
| `killsForNextKdr`   | Kills needed to lift the KDR to the next whole number: `ceil((floor(kills / deaths) + 1) * deaths - kills)`, floored at `0`; `0` when `deaths` is `0`. |
| `kadr`              | Kill+assist/death ratio: `(kills + assists) / deaths`.                                                                                                 |
| `winLossRatio`      | `wins / losses`.                                                                                                                                       |
| `winsForNextWlr`    | Wins needed to lift the win/loss ratio to the next whole number (same rule as `killsForNextKdr`, applied to `wins` over `losses`).                     |
| `winRate`           | Wins per game played, as a bare ratio: `wins / gamesPlayed`.                                                                                           |
| `bowAccuracy`       | Bow hits per shot, as a bare ratio: `bowHits / bowShots`.                                                                                              |
| `quitRate`          | Quits per game played, as a bare ratio: `quits / gamesPlayed`.                                                                                         |
| `bowKillShare`      | Percentage (0 to 100) of kills scored with a bow: `percent(bowKills, kills)`.                                                                          |
| `meleeKillShare`    | Percentage (0 to 100) of kills scored in melee: `percent(meleeKills, kills)`.                                                                          |
| `voidKillShare`     | Percentage (0 to 100) of kills scored by void knockback: `percent(voidKills, kills)`.                                                                  |
| `killsPerGame`      | `kills / gamesPlayed`.                                                                                                                                 |
| `mobKillEfficiency` | Fraction of spawned mobs the player killed, as a bare ratio: `mobsKilled / mobsSpawned`.                                                               |
| `assistsPerGame`    | `assists / gamesPlayed`.                                                                                                                               |
| `masteredKitsCount` | Number of kits in `raw.kitMastery` whose `master` value is greater than `0`.                                                                           |
| `modes`             | Per-mode stats, see [`SkyClashModeComputed`](#skyclashmodecomputed). Only present for modes that exist on the raw stats.                               |

## `SkyClashModeComputed`

Per-mode ratios. Only the fixed mode set `solo`, `doubles`, `team_war`, and `mega` is considered, and a mode is included only when `raw.modes[name]` exists.

```ts
export interface SkyClashModeComputed {
  readonly kdr: number;
  readonly wlr: number;
}
```

| Field | Formula / meaning                        |
| ----- | ---------------------------------------- |
| `kdr` | Mode kill/death ratio: `kills / deaths`. |
| `wlr` | Mode win/loss ratio: `wins / losses`.    |

## `computeSkyClash`

```ts
export function computeSkyClash(raw: SkyClashStats): SkyClashComputed;
```

Takes the parsed `SkyClashStats` from `@breezil/hypixel-parsers` and returns the computed block above. All overall fields read from top-level counters on `raw`; kit mastery is scanned from `raw.kitMastery`; the `modes` record is built from `raw.modes` restricted to the four known mode keys.

