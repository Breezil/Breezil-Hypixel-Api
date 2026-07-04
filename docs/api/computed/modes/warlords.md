# Warlords computed

Derived Warlords statistics, attached as `.computed` on the raw `WarlordsStats` parser block. It is always present (always-on), computed from the parsed stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `percent(part, whole)` yields a 0 to 100 value rounded to 2 decimals, with a zero whole yielding `0`. `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

Games played is derived as `wins + losses` (the parser exposes no combined games counter at the top level); all per-game fields divide by that.

## `WarlordsComputed`

The root object returned by `computeWarlords(raw: WarlordsStats)`.

```ts
export interface WarlordsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winsForNextWlr: number;
  readonly classWlr: Readonly<Record<string, number>>;
  readonly classWinsForNextWlr: Readonly<Record<string, number>>;
  readonly winRate: number;
  readonly kda: number;
  readonly assistRate: number;
  readonly killsPerGame: number;
  readonly mvpRate: number;
  readonly teamColorWinShare: number;
  readonly damageToHealingRatio: number;
  readonly damagePerGame: number;
  readonly healingPerGame: number;
  readonly damagePreventedPerGame: number;
  readonly mostPlayedClass: string;
  readonly flagEfficiency: number;
  readonly avgDominationScore: number;
}
```

| Field                    | Formula / meaning                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kdr`                    | `ratio(kills, deaths)`.                                                                                                                                                              |
| `killsForNextKdr`        | Kills needed, with zero further deaths, to reach the next whole KDR.                                                                                                                 |
| `wlr`                    | `ratio(wins, losses)`.                                                                                                                                                               |
| `winsForNextWlr`         | Wins needed, with zero further losses, to reach the next whole WLR.                                                                                                                  |
| `classWlr`               | `ratio(class wins, class losses)` for every class in `raw.classes`, keyed by class name.                                                                                             |
| `classWinsForNextWlr`    | Per class: wins needed, with zero further losses, to reach that class's next whole WLR. Same keys as `classWlr`.                                                                     |
| `winRate`                | `ratio(wins, wins + losses)`: fraction of games won (0 to 1 scale).                                                                                                                  |
| `kda`                    | `ratio(kills + assists, deaths)`.                                                                                                                                                    |
| `assistRate`             | `ratio(assists, kills + assists)`: share of the player's kill involvements that were assists (0 to 1).                                                                               |
| `killsPerGame`           | `kills / (wins + losses)`.                                                                                                                                                           |
| `mvpRate`                | `mvpCount / (wins + losses)`: MVP awards per game.                                                                                                                                   |
| `teamColorWinShare`      | `percent(winsBlu, winsBlu + winsRed)`: percentage of team-attributed wins earned on the blue team (0 to 100).                                                                        |
| `damageToHealingRatio`   | `ratio(damage, healing)`.                                                                                                                                                            |
| `damagePerGame`          | `damage / (wins + losses)`.                                                                                                                                                          |
| `healingPerGame`         | `healing / (wins + losses)`.                                                                                                                                                         |
| `damagePreventedPerGame` | `damagePrevented / (wins + losses)`.                                                                                                                                                 |
| `mostPlayedClass`        | The class in `raw.classes` with the highest `gamesPlayed`; `""` if there are no classes.                                                                                             |
| `flagEfficiency`         | `ratio(flagConquerSelf, flagConquerSelf + flagReturns)` from the Capture the Flag mode: share of the player's flag interactions that were own captures rather than returns (0 to 1). |
| `avgDominationScore`     | `ratio(domination.totalScore, domination.wins)`: average Domination score per Domination win.                                                                                        |

## `computeWarlords`

```ts
export function computeWarlords(raw: WarlordsStats): WarlordsComputed;
```

Builds the whole computed block from the parsed `WarlordsStats` (top-level counters, `raw.classes`, and `raw.modes.captureTheFlag` / `raw.modes.domination`).

