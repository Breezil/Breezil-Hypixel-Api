# UHC computed

Derived UHC Champions statistics, attached as `.computed` on the raw `UHCStats` parser block. It is always present (always-on), computed from the parsed stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `percent(part, whole)` yields a 0 to 100 value rounded to 2 decimals, with a zero whole yielding `0`. `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

## Scoring, stars and titles

UHC score is `kills + wins * 10`, summed over the seven scoring modes: `solo`, `team`, `redVsBlue`, `noDiamonds`, `brawl`, `soloBrawl`, `duoBrawl`. The `vanillaDoubles` mode is excluded from the score, the star, and the main totals (it only appears in `totalsIncludingVanillaDoubles` and `favoriteMode`).

The star level is the index of the first score threshold above the current score. The thresholds (base values times 10) are:

| Star | Score threshold below | Title     |
| ---- | --------------------- | --------- |
| 1    | 10                    | Recruit   |
| 2    | 60                    | Initiate  |
| 3    | 210                   | Soldier   |
| 4    | 460                   | Sergeant  |
| 5    | 960                   | Knight    |
| 6    | 1,710                 | Captain   |
| 7    | 2,710                 | Centurion |
| 8    | 5,210                 | Gladiator |
| 9    | 10,210                | Warlord   |
| 10   | 13,210                | Champion  |
| 11   | 16,210                | Champion  |
| 12   | 19,210                | Champion  |
| 13   | 22,210                | Champion  |
| 14   | 25,210                | Champion  |
| 15   | unbounded             | Champion  |

There are only ten titles; the title index is the star level clamped to 1..10, so stars 10 and above all read `Champion`.

## `UHCComputed`

The root object returned by `computeUHC(raw: UHCStats)`.

```ts
export interface UHCComputed extends UHCTotals {
  readonly starLevel: number;
  readonly starTitle: string;
  readonly KDR: number;
  readonly killsForNextKdr: number;
  readonly scoreForNextStar: number;
  readonly killsPerWin: number;
  readonly headsPerWin: number;
  readonly extraUltimateRatio: number;
  readonly modes: Readonly<Record<string, UHCModeComputed>>;
  readonly totalsIncludingVanillaDoubles: UHCTotals;
  readonly favoriteMode: string;
  readonly perksUnlocked: number;
  readonly mostUsedKit: string;
}
```

| Field                           | Formula / meaning                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `starLevel`                     | Index of the first score threshold above `kills + wins * 10` (see table above).                                                                                                                  |
| `starTitle`                     | Title for the star level, clamped to the ten titles (Recruit through Champion).                                                                                                                  |
| `KDR`                           | `ratio(total kills, total deaths)` over the scoring modes.                                                                                                                                       |
| `killsForNextKdr`               | Kills needed, with zero further deaths, to reach the next whole KDR.                                                                                                                             |
| `scoreForNextStar`              | Next star's score threshold minus the current score; `0` at the top (infinite) threshold.                                                                                                        |
| `killsPerWin`                   | `ratio(total kills, total wins)`.                                                                                                                                                                |
| `headsPerWin`                   | `ratio(total headsEaten, total wins)`.                                                                                                                                                           |
| `extraUltimateRatio`            | `ratio(total extraUltimatesCrafted, total ultimatesCrafted)`.                                                                                                                                    |
| `modes`                         | Per scoring mode computed stats, keyed by mode name (`solo`, `team`, `redVsBlue`, `noDiamonds`, `brawl`, `soloBrawl`, `duoBrawl`). See `UHCModeComputed`.                                        |
| `totalsIncludingVanillaDoubles` | The same six counters summed over all eight modes, i.e. the scoring modes plus `vanillaDoubles`.                                                                                                 |
| `favoriteMode`                  | The mode (of all eight, including `vanillaDoubles`) with the highest activity score `kills + wins + deaths`; `""` if all are below 0 (floor is -1, so any mode with activity 0 or more can win). |
| `perksUnlocked`                 | Number of keys in `raw.perks`.                                                                                                                                                                   |
| `mostUsedKit`                   | `argMax` over `raw.kits` (kit name with the highest use count); `""` if none.                                                                                                                    |
| (inherited)                     | All `UHCTotals` fields, summed over the seven scoring modes.                                                                                                                                     |

## `UHCTotals`

```ts
export interface UHCTotals {
  readonly kills: number;
  readonly wins: number;
  readonly deaths: number;
  readonly headsEaten: number;
  readonly ultimatesCrafted: number;
  readonly extraUltimatesCrafted: number;
}
```

| Field                   | Formula / meaning                         |
| ----------------------- | ----------------------------------------- |
| `kills`                 | Sum of `kills` across the included modes. |
| `wins`                  | Sum of `wins`.                            |
| `deaths`                | Sum of `deaths`.                          |
| `headsEaten`            | Sum of `headsEaten` (golden heads eaten). |
| `ultimatesCrafted`      | Sum of `ultimatesCrafted`.                |
| `extraUltimatesCrafted` | Sum of `extraUltimatesCrafted`.           |

On `UHCComputed` itself these cover the seven scoring modes; on `totalsIncludingVanillaDoubles` they also include `vanillaDoubles`.

## `UHCModeComputed`

Computed per scoring mode (in `UHCComputed.modes`).

```ts
export interface UHCModeComputed {
  readonly KDR: number;
  readonly killsForNextKdr: number;
  readonly winShare: number;
}
```

| Field             | Formula / meaning                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `KDR`             | `ratio(mode kills, mode deaths)`.                                                                      |
| `killsForNextKdr` | Kills needed in this mode, with zero further deaths, to reach the next whole KDR.                      |
| `winShare`        | `percent(mode wins, total scoring-mode wins)`: this mode's percentage of the player's wins (0 to 100). |

## `computeUHC`

```ts
export function computeUHC(raw: UHCStats): UHCComputed;
```

Builds the whole computed block from the parsed `UHCStats`.

