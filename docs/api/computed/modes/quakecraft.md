# Quakecraft computed stats

Computed Quakecraft statistics, derived from the parsed `QuakecraftStats` block. They are always present on an enriched player as `player.stats.quakecraft.computed` (when the raw `quakecraft` block exists), produced by `computeQuakecraft(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*Share` fields are percentages from 0 to 100 (0 when the whole is 0). `*ForNext*` fields are the additional amount needed to reach the next whole-number value of the corresponding ratio (0 when the denominator is 0).

Quakecraft raw stats are split into `solo` and `teams` mode blocks. The overall totals below are the sum of both modes: `kills = solo.kills + teams.kills`, `deaths = solo.deaths + teams.deaths`, `wins = solo.wins + teams.wins`, `killStreaks = solo.killstreaks + teams.killstreaks`, `distanceTraveled = solo.distanceTravelled + teams.distanceTravelled`, `shotsFired = solo.shotsFired + teams.shotsFired`, `headShots = solo.headshots + teams.headshots`.

## `QuakecraftComputed`

```ts
export interface QuakecraftComputed {
  readonly kdr: number;
  readonly soloKdr: number;
  readonly teamsKdr: number;
  readonly killsForNextKdr: number;
  readonly soloKillsForNextKdr: number;
  readonly teamsKillsForNextKdr: number;
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly killStreaks: number;
  readonly distanceTraveled: number;
  readonly shotsFired: number;
  readonly headShots: number;
  readonly shotAccuracy: number;
  readonly headshotRate: number;
  readonly headshotsPerKill: number;
  readonly killsPerWin: number;
  readonly distancePerKill: number;
  readonly soloKillShare: number;
  readonly deathmatchKillShare: number;
}
```

| Field                  | Formula                                              | Meaning                                                     |
| ---------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `kdr`                  | `kills / deaths`                                     | Overall kill/death ratio across solo and teams (bare ratio) |
| `soloKdr`              | `solo.kills / solo.deaths`                           | Solo kill/death ratio (bare ratio)                          |
| `teamsKdr`             | `teams.kills / teams.deaths`                         | Teams kill/death ratio (bare ratio)                         |
| `killsForNextKdr`      | `neededForNextWholeRatio(kills, deaths)`             | Kills needed to reach the next whole overall KDR            |
| `soloKillsForNextKdr`  | `neededForNextWholeRatio(solo.kills, solo.deaths)`   | Solo kills needed to reach the next whole solo KDR          |
| `teamsKillsForNextKdr` | `neededForNextWholeRatio(teams.kills, teams.deaths)` | Teams kills needed to reach the next whole teams KDR        |
| `kills`                | `solo.kills + teams.kills`                           | Total kills across both modes                               |
| `deaths`               | `solo.deaths + teams.deaths`                         | Total deaths across both modes                              |
| `wins`                 | `solo.wins + teams.wins`                             | Total wins across both modes                                |
| `killStreaks`          | `solo.killstreaks + teams.killstreaks`               | Total kill streaks across both modes                        |
| `distanceTraveled`     | `solo.distanceTravelled + teams.distanceTravelled`   | Total distance traveled across both modes                   |
| `shotsFired`           | `solo.shotsFired + teams.shotsFired`                 | Total shots fired across both modes                         |
| `headShots`            | `solo.headshots + teams.headshots`                   | Total headshots across both modes                           |
| `shotAccuracy`         | `kills / shotsFired`                                 | Kills per shot fired (bare ratio, not a percent)            |
| `headshotRate`         | `headShots / shotsFired`                             | Headshots per shot fired (bare ratio, not a percent)        |
| `headshotsPerKill`     | `headShots / kills`                                  | Headshots per kill (bare ratio)                             |
| `killsPerWin`          | `kills / wins`                                       | Average kills per win (bare ratio)                          |
| `distancePerKill`      | `distanceTraveled / kills`                           | Distance traveled per kill (bare ratio)                     |
| `soloKillShare`        | `100 * solo.kills / kills`                           | Percent (0-100) of total kills earned in solo               |
| `deathmatchKillShare`  | `100 * killsDeathmatch / kills`                      | Percent (0-100) of total kills earned in deathmatch         |

