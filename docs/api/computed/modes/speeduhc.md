# Speed UHC computed stats

Derived Speed UHC metrics, attached as the always-on `computed` property of the raw
stats block: whenever `player.stats.speedUHC` is present,
`player.stats.speedUHC.computed` is a `SpeedUHCComputed` built by `computeSpeedUHC(raw)`
from `src/computed/modes/speeduhc.ts`. All inputs are fields of the raw `SpeedUHCStats`
block and its `modeStats` record of suffixed counters.

Conventions used below:

- **Ratios** are bare (not percentages), rounded to 2 decimals. When the denominator is
  `0` the numerator is returned as-is (K/D convention).
- **`*Share` and `*Percent`** fields are percentages from 0 to 100, rounded to
  2 decimals; a zero whole yields `0`.
- **`*ForNext*`** fields are the additional amount of the numerator stat needed to reach
  the next whole ratio (`floor(num / den) + 1`); `0` when the denominator is `0`.

## `SpeedUHCTitle`

The Speed UHC title ladder, resolved from the raw `score`. The player's title is the
highest entry whose requirement the score meets.

```ts
export type SpeedUHCTitle =
  (typeof SPEED_UHC_TITLE_REQUIREMENTS)[number]["title"];
```

Equivalent to the union of these title strings, with their score requirements:

| Title         | Score required |
| ------------- | -------------- |
| `"Hiker"`     | 0              |
| `"Jogger"`    | 50             |
| `"Runner"`    | 300            |
| `"Sprinter"`  | 1050           |
| `"Turbo"`     | 2550           |
| `"Sanic"`     | 5550           |
| `"Hot Rod"`   | 15550          |
| `"Bolt"`      | 30550          |
| `"Zoom"`      | 55550          |
| `"God Speed"` | 85550          |

## `SpeedUHCComputed`

The top-level object at `player.stats.speedUHC.computed`.

```ts
export interface SpeedUHCComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly arrowAccuracy: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly averageSurvivors: number;
  readonly kadr: number;
  readonly quitRate: number;
  readonly tearsPerGame: number;
  readonly assistShare: number;
  readonly title: SpeedUHCTitle;
  readonly scoreToNextTitle: number;
  readonly titleProgressPercent: number;
  readonly modes: Readonly<Record<string, SpeedUHCModeComputed>>;
}
```

| Field                  | Formula                                                                                                   | Meaning                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `kdr`                  | `raw.kills / raw.deaths`                                                                                  | Overall kill/death ratio                                                |
| `killsForNextKdr`      | `neededForNextWholeRatio(raw.kills, raw.deaths)`                                                          | Kills still needed to reach the next whole-number KDR                   |
| `wlr`                  | `raw.wins / raw.losses`                                                                                   | Overall win/loss ratio                                                  |
| `winsForNextWlr`       | `neededForNextWholeRatio(raw.wins, raw.losses)`                                                           | Wins still needed to reach the next whole-number WLR                    |
| `arrowAccuracy`        | `raw.arrowsHit / raw.arrowsShot`                                                                          | Fraction of arrows shot that hit (bare ratio, not a percentage)         |
| `winRate`              | `raw.wins / raw.games`                                                                                    | Fraction of games won (bare ratio)                                      |
| `killsPerGame`         | `raw.kills / raw.games`                                                                                   | Average kills per game                                                  |
| `averageSurvivors`     | `raw.survivedPlayers / raw.games`                                                                         | Average players outlived per game                                       |
| `kadr`                 | `(raw.kills + raw.assists) / raw.deaths`                                                                  | Kills-and-assists per death                                             |
| `quitRate`             | `raw.quits / raw.games`                                                                                   | Quits per game (bare ratio)                                             |
| `tearsPerGame`         | `raw.tearsGathered / raw.games`                                                                           | Average tears gathered per game                                         |
| `assistShare`          | `100 * raw.assists / (raw.kills + raw.assists)`                                                           | Percentage of kill involvements that were assists (0-100)               |
| `title`                | highest ladder entry with `raw.score >= requirement`                                                      | Current Speed UHC title; see [`SpeedUHCTitle`](#speeduhctitle)          |
| `scoreToNextTitle`     | `nextRequirement - raw.score`; `0` at the top title                                                       | Score still needed to reach the next title                              |
| `titleProgressPercent` | `100 * (raw.score - currentRequirement) / (nextRequirement - currentRequirement)`; `100` at the top title | Progress through the current title bracket (0-100)                      |
| `modes`                | one entry per named mode (see below)                                                                      | Per-mode breakdown; see [`SpeedUHCModeComputed`](#speeduhcmodecomputed) |

## `SpeedUHCModeComputed`

The `modes` record always contains exactly these six keys, each reading the suffixed
counters `kills_<suffix>`, `deaths_<suffix>`, `wins_<suffix>`, and `losses_<suffix>`
from `raw.modeStats` (a missing counter counts as `0`):

| Key          | Raw stat suffix |
| ------------ | --------------- |
| `solo`       | `solo`          |
| `soloNormal` | `solo_normal`   |
| `soloInsane` | `solo_insane`   |
| `team`       | `team`          |
| `teamNormal` | `team_normal`   |
| `teamInsane` | `team_insane`   |

```ts
export interface SpeedUHCModeComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
}
```

| Field             | Formula                                                    | Meaning                                                            |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `kdr`             | `kills_<suffix> / deaths_<suffix>`                         | Kill/death ratio in this mode                                      |
| `killsForNextKdr` | `neededForNextWholeRatio(kills_<suffix>, deaths_<suffix>)` | Kills still needed in this mode to reach the next whole-number KDR |
| `wlr`             | `wins_<suffix> / losses_<suffix>`                          | Win/loss ratio in this mode                                        |
| `winsForNextWlr`  | `neededForNextWholeRatio(wins_<suffix>, losses_<suffix>)`  | Wins still needed in this mode to reach the next whole-number WLR  |

