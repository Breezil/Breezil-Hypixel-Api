# Turbo Kart Racers computed stats

Derived Turbo Kart Racers metrics, attached as the always-on `computed` property of the
raw stats block: whenever `player.stats.turboKartRacers` is present,
`player.stats.turboKartRacers.computed` is a `TurboKartRacersComputed` built by
`computeTurboKartRacers(raw)` from `src/computed/modes/turbokartracers.ts`. All inputs
are fields of the raw `TurboKartRacersStats` block (its `maps` record, its
`monthlyPoints` record, its `periods` block of `TurboKartRacersPeriodStats`, and
top-level counters).

Conventions used below:

- **Ratios** are bare (not percentages), rounded to 2 decimals. When the denominator is
  `0` the numerator is returned as-is (K/D convention).
- **`*Share`** fields are percentages from 0 to 100, rounded to 2 decimals; a zero whole
  yields `0`.
- **Oscillating (monthly/weekly) fields** pick the live A or B bucket for the current
  date at compute time. Monthly: bucket A when `now.getMonth() % 2 === 1` (February,
  April, June, August, October, December), otherwise bucket B. Weekly: whole weeks
  elapsed since epoch `1417237200000`; bucket A when that count is odd, otherwise B.

## `TurboKartRacersComputed`

The top-level object at `player.stats.turboKartRacers.computed`. The derived inputs
below are `plays = sum(map.plays for each raw.maps entry)` and
`trophies = raw.goldTrophies + raw.silverTrophies + raw.bronzeTrophies`.

```ts
export interface TurboKartRacersComputed {
  readonly totalPlays: number;
  readonly winRate: number;
  readonly totalTrophies: number;
  readonly trophiesPerPlay: number;
  readonly goldTrophyShare: number;
  readonly lapsPerPlay: number;
  readonly boxPickupsPerLap: number;
  readonly coinsPickedUpPerGame: number;
  readonly netBananaHits: number;
  readonly bananaHitRatio: number;
  readonly blueTorpedoHitsPerPlay: number;
  readonly mostPlayedMap: string | null;
  readonly bestMonthlyPosition: number;
  readonly averageMonthlyPoints: number;
  readonly monthly: TurboKartRacersPeriodComputed;
  readonly weekly: TurboKartRacersPeriodComputed;
}
```

| Field                    | Formula                                                                                 | Meaning                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `totalPlays`             | `sum(map.plays for each raw.maps entry)`                                                | Total races played, summed across all maps                                                                                        |
| `winRate`                | `raw.wins / totalPlays`                                                                 | Fraction of races won (bare ratio, not a percentage)                                                                              |
| `totalTrophies`          | `raw.goldTrophies + raw.silverTrophies + raw.bronzeTrophies`                            | Lifetime trophies of all colors                                                                                                   |
| `trophiesPerPlay`        | `totalTrophies / totalPlays`                                                            | Average trophies (podium finishes) per race                                                                                       |
| `goldTrophyShare`        | `100 * raw.goldTrophies / totalTrophies`                                                | Percentage of all trophies that are gold (0-100)                                                                                  |
| `lapsPerPlay`            | `raw.completedLaps / totalPlays`                                                        | Average completed laps per race                                                                                                   |
| `boxPickupsPerLap`       | `raw.boxPickups / raw.completedLaps`                                                    | Average item box pickups per completed lap                                                                                        |
| `coinsPickedUpPerGame`   | `raw.coinsPickedUp / totalPlays`                                                        | Average coins picked up per race                                                                                                  |
| `netBananaHits`          | `raw.bananaHitsSent - raw.bananaHitsReceived`                                           | Banana hits dealt minus banana hits suffered (can be negative)                                                                    |
| `bananaHitRatio`         | `raw.bananaHitsSent / raw.bananaHitsReceived`                                           | Banana hits dealt per banana hit suffered                                                                                         |
| `blueTorpedoHitsPerPlay` | `raw.blueTorpedoHits / totalPlays`                                                      | Average blue torpedo hits per race                                                                                                |
| `mostPlayedMap`          | `argMax(map id -> map.plays, floor 0)`                                                  | Key of the map with the most plays; `null` when no map has more than `0` plays                                                    |
| `bestMonthlyPosition`    | `minPositive(month.position for each raw.monthlyPoints entry)`                          | Best (lowest strictly positive) monthly leaderboard position ever held; `0` when no positive position exists                      |
| `averageMonthlyPoints`   | `sum(month.points) / count(months)` over `raw.monthlyPoints`                            | Average points per recorded month; when there are no months, the sum (`0`) is returned                                            |
| `monthly`                | `computePeriod(monthBucket(now) === "a" ? raw.periods.monthlyA : raw.periods.monthlyB)` | This month's period stats from the live oscillation bucket; see [`TurboKartRacersPeriodComputed`](#turbokartracersperiodcomputed) |
| `weekly`                 | `computePeriod(weekBucket(now) === "a" ? raw.periods.weeklyA : raw.periods.weeklyB)`    | This week's period stats from the live oscillation bucket; see [`TurboKartRacersPeriodComputed`](#turbokartracersperiodcomputed)  |

## `TurboKartRacersPeriodComputed`

The shape of both `monthly` and `weekly`. Built from whichever
`TurboKartRacersPeriodStats` slot (`monthlyA`/`monthlyB` or `weeklyA`/`weeklyB`) is live
for the current date; the first four fields are copied through unchanged.

```ts
export interface TurboKartRacersPeriodComputed {
  readonly boxPickups: number;
  readonly goldTrophies: number;
  readonly silverTrophies: number;
  readonly bronzeTrophies: number;
  readonly totalTrophies: number;
}
```

| Field            | Formula                                                               | Meaning                                      |
| ---------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| `boxPickups`     | `period.boxPickups`                                                   | Item box pickups in the current period       |
| `goldTrophies`   | `period.goldTrophies`                                                 | Gold trophies earned in the current period   |
| `silverTrophies` | `period.silverTrophies`                                               | Silver trophies earned in the current period |
| `bronzeTrophies` | `period.bronzeTrophies`                                               | Bronze trophies earned in the current period |
| `totalTrophies`  | `period.goldTrophies + period.silverTrophies + period.bronzeTrophies` | All trophies earned in the current period    |

