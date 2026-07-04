# Smash Heroes computed stats

Computed Smash Heroes statistics, derived from the parsed `SmashHeroesStats` block. They are always present on an enriched player as `player.stats.smashHeroes.computed` (when the raw `smashHeroes` block exists), produced by `computeSmashHeroes(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*Share` fields are percentages from 0 to 100 (0 when the whole is 0). `*ForNext*` fields are the additional amount needed to reach the next whole-number value of the corresponding ratio (0 when the denominator is 0).

## `SmashHeroesComputed`

```ts
export interface SmashHeroesComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly killsPerGame: number;
  readonly smashRatio: number;
  readonly damagePerGame: number;
  readonly damagePerKill: number;
  readonly quitRate: number;
  readonly assistsPerGame: number;
  readonly averageHeroLevel: number;
  readonly totalPrestige: number;
  readonly favoriteHero: string;
  readonly modes: SmashHeroesModesComputed;
  readonly heroes: Readonly<Record<string, SmashHeroesHeroComputed>>;
}
```

| Field              | Formula                                                                                                  | Meaning                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `kdr`              | `kills / deaths`                                                                                         | Kill/death ratio (bare ratio)                                           |
| `wlr`              | `wins / losses`                                                                                          | Win/loss ratio (bare ratio)                                             |
| `winRate`          | `wins / games`                                                                                           | Fraction of games won (bare ratio, not a percent)                       |
| `killsForNextKdr`  | `neededForNextWholeRatio(kills, deaths)`                                                                 | Kills needed to reach the next whole KDR                                |
| `winsForNextWlr`   | `neededForNextWholeRatio(wins, losses)`                                                                  | Wins needed to reach the next whole WLR                                 |
| `killsPerGame`     | `kills / games`                                                                                          | Average kills per game                                                  |
| `smashRatio`       | `smashed / smasher`                                                                                      | Times the player smashed others per time they were smashed (bare ratio) |
| `damagePerGame`    | `damageDealt / games`                                                                                    | Average damage dealt per game                                           |
| `damagePerKill`    | `damageDealt / kills`                                                                                    | Average damage dealt per kill (bare ratio)                              |
| `quitRate`         | `quits / games`                                                                                          | Quits per game played (bare ratio, not a percent)                       |
| `assistsPerGame`   | `assists / games`                                                                                        | Average assists per game                                                |
| `averageHeroLevel` | mean of `lastLevel` across all heroes in `raw.heroes`, rounded to 2 decimals; 0 when there are no heroes | Average current level across all heroes                                 |
| `totalPrestige`    | sum of `prestige` across all heroes in `raw.heroes`                                                      | Combined prestige across all heroes                                     |
| `favoriteHero`     | hero with the highest `overall.games`, only counting heroes with more than 0 games                       | Most-played hero; `""` when no hero has games                           |
| `modes`            | see `SmashHeroesModesComputed`                                                                           | Per-mode computed stats (normal, twoVsTwo, teams)                       |
| `heroes`           | `SmashHeroesHeroComputed` per hero                                                                       | Per-hero ratios for every hero in `raw.heroes`, keyed by hero name      |

## `SmashHeroesModesComputed`

```ts
export interface SmashHeroesModesComputed {
  readonly normal: SmashHeroesModeComputed;
  readonly twoVsTwo: SmashHeroesModeComputed;
  readonly teams: SmashHeroesModeComputed;
}
```

| Field      | Formula                                                | Meaning                           |
| ---------- | ------------------------------------------------------ | --------------------------------- |
| `normal`   | computed from `raw.normal` against total `raw.games`   | Stats for the 1v1v1v1 normal mode |
| `twoVsTwo` | computed from `raw.twoVsTwo` against total `raw.games` | Stats for the 2v2 mode            |
| `teams`    | computed from `raw.teams` against total `raw.games`    | Stats for the teams mode          |

## `SmashHeroesModeComputed`

Per-mode stats. Each formula uses that mode's own `kills`, `deaths`, `wins`, `losses`, and `games`; `totalGames` is the overall `raw.games`.

```ts
export interface SmashHeroesModeComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly gameShare: number;
}
```

| Field             | Formula                                            | Meaning                                          |
| ----------------- | -------------------------------------------------- | ------------------------------------------------ |
| `kdr`             | `mode.kills / mode.deaths`                         | Mode kill/death ratio (bare ratio)               |
| `wlr`             | `mode.wins / mode.losses`                          | Mode win/loss ratio (bare ratio)                 |
| `killsForNextKdr` | `neededForNextWholeRatio(mode.kills, mode.deaths)` | Kills needed to reach the mode's next whole KDR  |
| `winsForNextWlr`  | `neededForNextWholeRatio(mode.wins, mode.losses)`  | Wins needed to reach the mode's next whole WLR   |
| `gameShare`       | `100 * mode.games / totalGames`                    | Percent (0-100) of all games played in this mode |

## `SmashHeroesHeroComputed`

Per-hero ratios. One entry per hero in `raw.heroes`; each formula uses that hero's `overall` stats.

```ts
export interface SmashHeroesHeroComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
}
```

| Field             | Formula                                                  | Meaning                                         |
| ----------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `kdr`             | `overall.kills / overall.deaths`                         | Hero kill/death ratio (bare ratio)              |
| `wlr`             | `overall.wins / overall.losses`                          | Hero win/loss ratio (bare ratio)                |
| `killsForNextKdr` | `neededForNextWholeRatio(overall.kills, overall.deaths)` | Kills needed to reach the hero's next whole KDR |
| `winsForNextWlr`  | `neededForNextWholeRatio(overall.wins, overall.losses)`  | Wins needed to reach the hero's next whole WLR  |

