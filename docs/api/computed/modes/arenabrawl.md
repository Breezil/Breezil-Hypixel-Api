# Arena Brawl computed stats

Derived Arena Brawl metrics, attached as the always-on `computed` property of the raw
stats block: whenever `player.stats.arenaBrawl` is present,
`player.stats.arenaBrawl.computed` is an `ArenaBrawlComputed` built by
`computeArenaBrawl(raw)` from `src/computed/modes/arenabrawl.ts`. All inputs are fields
of the raw `ArenaBrawlStats` block (its `modes` record of `ArenaBrawlModeStats`, its
`upgrades` block, its `datedRatings` record, and top-level counters).

Conventions used below:

- **Ratios** are bare (not percentages), rounded to 2 decimals. When the denominator is
  `0` the numerator is returned as-is (K/D convention).
- **`*Share`** fields are percentages from 0 to 100, rounded to 2 decimals; a zero whole
  yields `0`.
- **`*ForNext*`** fields are the additional amount of the numerator stat needed to reach
  the next whole ratio (`floor(num / den) + 1`); `0` when the denominator is `0`.

## `ArenaBrawlComputed`

The top-level object at `player.stats.arenaBrawl.computed`. The totals below are summed
across every entry of `raw.modes`: `totalKills = sum(kills)`,
`totalDeaths = sum(deaths)`, `totalLosses = sum(losses)`, `totalGames = sum(games)`.
Overall wins use the top-level `raw.wins` counter directly.

```ts
export interface ArenaBrawlComputed {
  readonly modes: Readonly<Record<string, ArenaBrawlModeComputed>>;
  readonly totalKills: number;
  readonly totalDeaths: number;
  readonly totalLosses: number;
  readonly totalGames: number;
  readonly overallKdr: number;
  readonly killsForNextKdr: number;
  readonly overallWlr: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly bestWinStreak: number;
  readonly totalUpgradeLevel: number;
  readonly latestRating: number;
  readonly bestLadderPosition: number;
  readonly mostPlayedMode: string | null;
}
```

| Field                | Formula                                                                                                       | Meaning                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `modes`              | one entry per key of `raw.modes`                                                                              | Per-mode breakdown, same keys as the raw record; see [`ArenaBrawlModeComputed`](#arenabrawlmodecomputed) |
| `totalKills`         | `sum(mode.kills for each mode)`                                                                               | Kills summed across all modes                                                                            |
| `totalDeaths`        | `sum(mode.deaths for each mode)`                                                                              | Deaths summed across all modes                                                                           |
| `totalLosses`        | `sum(mode.losses for each mode)`                                                                              | Losses summed across all modes                                                                           |
| `totalGames`         | `sum(mode.games for each mode)`                                                                               | Games summed across all modes                                                                            |
| `overallKdr`         | `totalKills / totalDeaths`                                                                                    | Overall kill/death ratio                                                                                 |
| `killsForNextKdr`    | `neededForNextWholeRatio(totalKills, totalDeaths)`                                                            | Kills still needed to reach the next whole-number overall KDR                                            |
| `overallWlr`         | `raw.wins / totalLosses`                                                                                      | Overall win/loss ratio (top-level wins over summed losses)                                               |
| `winsForNextWlr`     | `neededForNextWholeRatio(raw.wins, totalLosses)`                                                              | Wins still needed to reach the next whole-number overall WLR                                             |
| `winRate`            | `raw.wins / totalGames`                                                                                       | Fraction of all games won (bare ratio, not a percentage)                                                 |
| `killsPerGame`       | `totalKills / totalGames`                                                                                     | Average kills per game across all modes                                                                  |
| `bestWinStreak`      | `max(0, ...mode.winStreak for each mode)`                                                                     | Highest win streak across all modes, never below `0`                                                     |
| `totalUpgradeLevel`  | `raw.upgrades.cooldown + raw.upgrades.damage + raw.upgrades.energy + raw.upgrades.health`                     | Sum of the four skill upgrade levels                                                                     |
| `latestRating`       | rating of the `raw.datedRatings` entry whose `month_year` key sorts latest (compared as `year * 100 + month`) | Most recent monthly ladder rating; `0` when there are no dated ratings                                   |
| `bestLadderPosition` | `minPositive(entry.position for each datedRatings entry)`                                                     | Best (lowest strictly positive) monthly ladder position ever held; `0` when no positive position exists  |
| `mostPlayedMode`     | `argMax(mode id -> mode.games, floor 0)`                                                                      | Key of the mode with the most games; `null` when no mode has more than `0` games                         |

## `ArenaBrawlModeComputed`

One entry per key of `raw.modes` (for example `1v1`, `2v2`, `4v4`), computed from that
mode's `ArenaBrawlModeStats`. The `winShare` denominator is the top-level `raw.wins`.

```ts
export interface ArenaBrawlModeComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
  readonly damagePerGame: number;
  readonly healPerGame: number;
  readonly damagePerKill: number;
  readonly winShare: number;
}
```

| Field             | Formula                                            | Meaning                                                                         |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `kdr`             | `mode.kills / mode.deaths`                         | Kill/death ratio in this mode                                                   |
| `killsForNextKdr` | `neededForNextWholeRatio(mode.kills, mode.deaths)` | Kills still needed in this mode to reach the next whole-number KDR              |
| `wlr`             | `mode.wins / mode.losses`                          | Win/loss ratio in this mode                                                     |
| `winsForNextWlr`  | `neededForNextWholeRatio(mode.wins, mode.losses)`  | Wins still needed in this mode to reach the next whole-number WLR               |
| `winRate`         | `mode.wins / mode.games`                           | Fraction of this mode's games won (bare ratio, not a percentage)                |
| `damagePerGame`   | `mode.damage / mode.games`                         | Average damage dealt per game in this mode                                      |
| `healPerGame`     | `mode.healed / mode.games`                         | Average healing done per game in this mode                                      |
| `damagePerKill`   | `mode.damage / mode.kills`                         | Average damage dealt per kill in this mode                                      |
| `winShare`        | `100 * mode.wins / raw.wins`                       | Percentage of the player's overall Arena Brawl wins earned in this mode (0-100) |

