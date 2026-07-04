# BedWars computed

Derived BedWars statistics, attached as `.computed` on the raw `BedWarsStats` parser block. It is always present (always-on), computed from the parsed stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `percent(part, whole)` yields a 0 to 100 value rounded to 2 decimals, with a zero whole yielding `0`. `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

## `BedWarsComputed`

The root object returned by `computeBedWars(raw: BedWarsStats)`.

```ts
export interface BedWarsComputed {
  readonly level: number;
  readonly prestige: BedwarsPrestige;
  readonly xpToNextLevel: number;
  readonly starsToNextPrestige: number;
  readonly xpForNextPrestige: number;
  readonly index: number;
  readonly finalsPerStar: number;
  readonly winsPerStar: number;
  readonly legendaryChestRate: number;
  readonly practice: BedWarsPracticeComputed;
  readonly overall: BedWarsModeComputed;
  readonly perMode: Readonly<Record<BedWarsSubmode, BedWarsModeComputed>>;
}
```

| Field                 | Formula / meaning                                                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level`               | Fractional BedWars star from the XP curve. Each 487,000 XP prestige cycle is 100 stars; the first four levels of a cycle cost 500 / 1,000 / 2,000 / 3,500 XP, every level after that costs 5,000 XP. Fractional progress within the current level is included.         |
| `prestige`            | `bedwarsPrestige(level)`: the prestige bracket for the star. `bracket` is `floor(level / 100)` clamped to 0..100; `name` and `colorCode` come from the 101-entry prestige table (Stone at 1, Iron at 100, Gold at 200, ... Rainbow at 1000, ... Prestigious at 10000). |
| `xpToNextLevel`       | XP still needed to reach the next whole star, from the same curve (early-level thresholds within the cycle, then `5000 - progress` in the flat region).                                                                                                                |
| `starsToNextPrestige` | Distance to the next prestige boundary: the first prestige table entry with `level > star`, minus the current star, rounded to 2 decimals. `0` once past the last entry (star 10000+).                                                                                 |
| `xpForNextPrestige`   | `487000 - (experience % 487000)`: XP remaining in the current 487,000 XP prestige cycle.                                                                                                                                                                               |
| `index`               | BedWars index: `round2(level * fkdr * fkdr)`, where `fkdr` is the overall final kills to final deaths ratio.                                                                                                                                                           |
| `finalsPerStar`       | `ratio(overall final kills, level)`: lifetime final kills per star.                                                                                                                                                                                                    |
| `winsPerStar`         | `ratio(overall wins, level)`: lifetime wins per star.                                                                                                                                                                                                                  |
| `legendaryChestRate`  | `ratio(boxes.openedLegendaries, boxes.openedChests)`: fraction of opened chests that were legendary.                                                                                                                                                                   |
| `practice`            | Per practice mode attempt totals and success ratios, see `BedWarsPracticeComputed`.                                                                                                                                                                                    |
| `overall`             | `BedWarsModeComputed` for the overall (all modes combined) stat block.                                                                                                                                                                                                 |
| `perMode`             | `BedWarsModeComputed` for each submode: `solo`, `doubles`, `threes`, `fours`, `fourVsFour`, `castle`.                                                                                                                                                                  |

## `BedWarsModeComputed`

Computed per stat block (overall and each submode).

```ts
export interface BedWarsModeComputed {
  readonly winLossRatio: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly finalKillsPerGame: number;
  readonly bedsBrokenPerGame: number;
  readonly resourcesPerGame: number;
  readonly ironPerGame: number;
  readonly goldPerGame: number;
  readonly diamondPerGame: number;
  readonly emeraldPerGame: number;
  readonly itemsPurchasedPerGame: number;
  readonly finalKillParticipation: number;
  readonly finalsForNextFkdr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly bedsForNextBblr: number;
  readonly beds: BedWarsBedRatios;
  readonly kills: BedWarsKillRatios;
  readonly finals: BedWarsFinalRatios;
}
```

| Field                    | Formula / meaning                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `winLossRatio`           | `ratio(wins, losses)` (WLR).                                                                                          |
| `winRate`                | `ratio(wins, gamesPlayed)`: fraction of games won (0 to 1 scale).                                                     |
| `killsPerGame`           | `kills.total.kills / gamesPlayed`.                                                                                    |
| `finalKillsPerGame`      | `finals.total.kills / gamesPlayed`.                                                                                   |
| `bedsBrokenPerGame`      | `beds.broken / gamesPlayed`.                                                                                          |
| `resourcesPerGame`       | `resources.total / gamesPlayed`.                                                                                      |
| `ironPerGame`            | `resources.iron / gamesPlayed`.                                                                                       |
| `goldPerGame`            | `resources.gold / gamesPlayed`.                                                                                       |
| `diamondPerGame`         | `resources.diamond / gamesPlayed`.                                                                                    |
| `emeraldPerGame`         | `resources.emerald / gamesPlayed`.                                                                                    |
| `itemsPurchasedPerGame`  | `resources.itemsPurchased / gamesPlayed`.                                                                             |
| `finalKillParticipation` | `ratio(finalKills, finalKills + finalDeaths)`: share of the player's final fights that ended in their favor (0 to 1). |
| `finalsForNextFkdr`      | Final kills needed, with zero further final deaths, to reach the next whole FKDR.                                     |
| `killsForNextKdr`        | Kills needed, with zero further deaths, to reach the next whole KDR.                                                  |
| `winsForNextWlr`         | Wins needed, with zero further losses, to reach the next whole WLR.                                                   |
| `bedsForNextBblr`        | Beds broken needed, with zero further beds lost, to reach the next whole beds broken to beds lost ratio.              |
| `beds`                   | `{ ratio }` where `ratio = beds.broken / beds.lost` (BBLR).                                                           |
| `kills`                  | Per damage type kill/death ratio, one entry per key of `BedWarsCombatBreakdown` (e.g. `total`, void, fall, ...).      |
| `finals`                 | Per damage type final kill/death ratio plus each type's `share` of total final kills.                                 |

## `BedWarsKillRatios`

```ts
export type BedWarsKillRatios = Readonly<
  Record<BedWarsDamageType, { readonly ratio: number }>
>;
```

| Field                | Formula / meaning                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `[damageType].ratio` | `ratio(kills, deaths)` for that damage type of `BedWarsCombatBreakdown` (the keys are whatever the parser exposes, including `total`). |

## `BedWarsFinalRatios`

```ts
export type BedWarsFinalRatios = Readonly<
  Record<BedWarsDamageType, { readonly ratio: number; readonly share: number }>
>;
```

| Field                | Formula / meaning                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `[damageType].ratio` | `ratio(finalKills, finalDeaths)` for that damage type.                                                              |
| `[damageType].share` | `percent(finalKills of this type, total final kills)`: this damage type's percentage of all final kills (0 to 100). |

## `BedWarsBedRatios`

```ts
export interface BedWarsBedRatios {
  readonly ratio: number;
}
```

| Field   | Formula / meaning                                                 |
| ------- | ----------------------------------------------------------------- |
| `ratio` | `ratio(beds.broken, beds.lost)`: beds broken to beds lost (BBLR). |

## `BedWarsPracticeComputed`

```ts
export interface BedWarsPracticeComputed {
  readonly bridging: BedWarsPracticeModeComputed;
  readonly fireballJumping: BedWarsPracticeModeComputed;
  readonly mlg: BedWarsPracticeModeComputed;
  readonly pearlClutching: BedWarsPracticeModeComputed;
}
```

| Field             | Formula / meaning                                         |
| ----------------- | --------------------------------------------------------- |
| `bridging`        | Computed practice stats for the bridging drill.           |
| `fireballJumping` | Computed practice stats for the fireball jumping drill.   |
| `mlg`             | Computed practice stats for the MLG (water bucket) drill. |
| `pearlClutching`  | Computed practice stats for the pearl clutching drill.    |

## `BedWarsPracticeModeComputed`

```ts
export interface BedWarsPracticeModeComputed {
  readonly attempts: number;
  readonly successfulRatio: number;
}
```

| Field             | Formula / meaning                                                   |
| ----------------- | ------------------------------------------------------------------- |
| `attempts`        | `successfulAttempts + failedAttempts`: total attempts at the drill. |
| `successfulRatio` | `ratio(successfulAttempts, failedAttempts)`: successes per failure. |

## `BedWarsSubmode`

```ts
export type BedWarsSubmode =
  | "solo"
  | "doubles"
  | "threes"
  | "fours"
  | "fourVsFour"
  | "castle";
```

The keys of `BedWarsComputed.perMode`; each maps to a `BedWarsModeComputed` for that submode.

## `computeBedWars`

```ts
export function computeBedWars(raw: BedWarsStats): BedWarsComputed;
```

Builds the whole computed block from the parsed `BedWarsStats`.

