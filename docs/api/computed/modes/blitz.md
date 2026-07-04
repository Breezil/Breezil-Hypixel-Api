# Blitz Survival Games computed stats

Derived Blitz Survival Games metrics, attached as the always-on `computed` property of
the raw stats block: whenever `player.stats.blitz` is present,
`player.stats.blitz.computed` is a `BlitzComputed` built by `computeBlitz(raw)` from
`src/computed/modes/blitz.ts`. All inputs are fields of the raw `BlitzStats` block and
its `kits` record of `BlitzCombatStats`.

Conventions used below:

- **Ratios** are bare (not percentages), rounded to 2 decimals. When the denominator is
  `0` the numerator is returned as-is (K/D convention).
- **`*Share`** fields are percentages from 0 to 100, rounded to 2 decimals; a zero whole
  yields `0`.
- **`*ForNext*`** fields are the additional amount of the numerator stat needed to reach
  the next whole ratio (`floor(num / den) + 1`); `0` when the denominator is `0`.
- **Oscillating (monthly/weekly) fields** pick the live A or B bucket for the current
  date at compute time. Monthly: bucket A when `now.getMonth() % 2 === 1` (February,
  April, June, August, October, December), otherwise bucket B. Weekly: whole weeks
  elapsed since epoch `1417237200000`; bucket A when that count is odd, otherwise B.

## `BlitzComputed`

The top-level object at `player.stats.blitz.computed`. The win-share denominator is
`modeWins = raw.winsSoloNormal + raw.winsSoloChaos + raw.winsTeamsNormal`.

```ts
export interface BlitzComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly bowAccuracy: number;
  readonly damageRatio: number;
  readonly avgGameDuration: number;
  readonly damagePerGame: number;
  readonly chestsPerGame: number;
  readonly potionsPerGame: number;
  readonly tauntKillRate: number;
  readonly soloWinShare: number;
  readonly teamWinShare: number;
  readonly monthlyKills: number;
  readonly weeklyKills: number;
  readonly mostPlayedKit: string | null;
  readonly kits: Readonly<Record<string, BlitzKitComputed>>;
}
```

| Field             | Formula                                                     | Meaning                                                                                     |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `kdr`             | `raw.kills / raw.deaths`                                    | Overall kill/death ratio                                                                    |
| `killsForNextKdr` | `neededForNextWholeRatio(raw.kills, raw.deaths)`            | Kills still needed to reach the next whole-number KDR                                       |
| `bowAccuracy`     | `raw.arrowsHit / raw.arrowsFired`                           | Fraction of arrows fired that hit (bare ratio, not a percentage)                            |
| `damageRatio`     | `raw.damage / raw.damageTaken`                              | Damage dealt per point of damage taken                                                      |
| `avgGameDuration` | `raw.timePlayed / raw.gamesPlayed`                          | Average time played per game (same unit as the raw `timePlayed` counter)                    |
| `damagePerGame`   | `raw.damage / raw.gamesPlayed`                              | Average damage dealt per game                                                               |
| `chestsPerGame`   | `raw.chestsOpened / raw.gamesPlayed`                        | Average chests opened per game                                                              |
| `potionsPerGame`  | `raw.potionsDrunk / raw.gamesPlayed`                        | Average potions drunk per game                                                              |
| `tauntKillRate`   | `raw.tauntKills / raw.kills`                                | Fraction of kills scored while taunting (bare ratio)                                        |
| `soloWinShare`    | `100 * (raw.winsSoloNormal + raw.winsSoloChaos) / modeWins` | Percentage of mode wins earned in solo queues, normal plus chaos (0-100)                    |
| `teamWinShare`    | `100 * raw.winsTeamsNormal / modeWins`                      | Percentage of mode wins earned in teams (0-100)                                             |
| `monthlyKills`    | `monthlyValue(raw.monthlyKillsA, raw.monthlyKillsB, now)`   | Kills this month, from the live monthly oscillation bucket                                  |
| `weeklyKills`     | `weeklyValue(raw.weeklyKillsA, raw.weeklyKillsB, now)`      | Kills this week, from the live weekly oscillation bucket                                    |
| `mostPlayedKit`   | `argMax(kit id -> kit.gamesPlayed, floor 0)`                | Key of the kit with the most games played; `null` when no kit has more than `0` games       |
| `kits`            | one entry per key of `raw.kits`                             | Per-kit breakdown, same keys as the raw record; see [`BlitzKitComputed`](#blitzkitcomputed) |

## `BlitzKitComputed`

One entry per key of `raw.kits`, computed from that kit's `BlitzCombatStats`. The kit's
losses are derived first: `losses = max(0, kit.gamesPlayed - kit.wins)`.

```ts
export interface BlitzKitComputed {
  readonly losses: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly bowAccuracy: number;
}
```

| Field          | Formula                              | Meaning                                                                 |
| -------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `losses`       | `max(0, kit.gamesPlayed - kit.wins)` | Derived losses with this kit (games played minus wins, never below `0`) |
| `wlr`          | `kit.wins / losses`                  | Win/loss ratio with this kit                                            |
| `winRate`      | `kit.wins / kit.gamesPlayed`         | Fraction of this kit's games won (bare ratio, not a percentage)         |
| `killsPerGame` | `kit.kills / kit.gamesPlayed`        | Average kills per game with this kit                                    |
| `bowAccuracy`  | `kit.arrowsHit / kit.arrowsFired`    | Fraction of arrows fired with this kit that hit (bare ratio)            |

