# Paintball computed stats

Computed Paintball statistics, derived from the parsed `PaintballStats` block. They are always present on an enriched player as `player.stats.paintball.computed` (when the raw `paintball` block exists), produced by `computePaintball(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*Percent` fields are percentages from 0 to 100 (0 when the whole is 0). `*ForNext*` fields are the additional amount needed to reach the next whole-number value of the corresponding ratio (0 when the denominator is 0).

## `PaintballComputed`

```ts
export interface PaintballComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly shotsPerKill: number;
  readonly killAccuracyPercent: number;
  readonly perksTotalLevel: number;
  readonly killsPerWin: number;
  readonly totalMapVotes: number;
  readonly favoriteMap: string;
  readonly weeklyKills: number;
  readonly monthlyKills: number;
  readonly killStreaksPerWin: number;
}
```

| Field                 | Formula                                                                                      | Meaning                                          |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `kdr`                 | `kills / deaths`                                                                             | Kill/death ratio (bare ratio)                    |
| `killsForNextKdr`     | `neededForNextWholeRatio(kills, deaths)`                                                     | Kills needed to reach the next whole KDR         |
| `shotsPerKill`        | `shotsFired / kills`                                                                         | Average shots fired per kill (bare ratio)        |
| `killAccuracyPercent` | `100 * kills / shotsFired`                                                                   | Percent (0-100) of shots that resulted in a kill |
| `perksTotalLevel`     | sum of all values in `raw.perks`                                                             | Combined level across all perks                  |
| `killsPerWin`         | `kills / wins`                                                                               | Average kills per win (bare ratio)               |
| `totalMapVotes`       | sum of all counts in `raw.mapVotes`                                                          | Total map votes cast across all maps             |
| `favoriteMap`         | map in `raw.mapVotes` with the highest vote count, only counting maps with more than 0 votes | Most-voted map; `""` when no map has votes       |
| `weeklyKills`         | `weeklyValue(weekly.killsA, weekly.killsB, now)`                                             | Kills in the current weekly bucket               |
| `monthlyKills`        | `monthlyValue(monthly.killsA, monthly.killsB, now)`                                          | Kills in the current monthly bucket              |
| `killStreaksPerWin`   | `killstreaks / wins`                                                                         | Average kill streaks per win (bare ratio)        |

### Weekly and monthly buckets

Hypixel stores rolling weekly and monthly stats in two alternating buckets (`A` and `B`). The monthly bucket is chosen by the parity of the current month (odd months read `A`, even months read `B`); the weekly bucket alternates by whole weeks elapsed since a fixed epoch. The computed values return the bucket that is currently accumulating, evaluated at compute time.

