# Duels computed

Derived Duels statistics, attached as `.computed` on the raw `DuelsStats` parser block. It is always present (always-on), computed from the parsed stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

## Titles

Duels titles are computed in two ways:

- `title` is read from the parsed `titlePrestige` record: the highest division with a value greater than `0` wins, formatted as the division name plus the level as a Roman numeral (e.g. `"Diamond III"`). If no division has a value, the title is `""`.
- `winsForNextTitle` is computed from wins against the title threshold table. Each division has 5 levels; the threshold for a level is `(division.wins + division.winsPerLevel * level)`, with `level` from 0 to 4. The result is the first threshold above the current wins, minus the current wins, or `0` past all thresholds. For the overall block only, every threshold is doubled (`DUELS_OVERALL_WINS_MULTIPLIER = 2`).

| Division    | Base wins | Wins per level |
| ----------- | --------- | -------------- |
| Rookie      | 50        | 10             |
| Iron        | 100       | 30             |
| Gold        | 250       | 50             |
| Diamond     | 500       | 100            |
| Master      | 1,000     | 200            |
| Legend      | 2,000     | 600            |
| Grandmaster | 5,000     | 1,000          |
| Godlike     | 10,000    | 3,000          |
| Celestial   | 25,000    | 5,000          |
| Divine      | 50,000    | 10,000         |
| Ascended    | 100,000   | 10,000         |

The last division is keyed `worldElite` in `DuelsTitlePrestige` but is named `Ascended`.

## `DuelsCombatRatios`

The base ratio set shared by every computed Duels block. Also used on its own as the type of `DuelsComputed.arena`.

```ts
export interface DuelsCombatRatios {
  readonly KDR: number;
  readonly WLR: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly meleeAccuracy: number;
  readonly bowAccuracy: number;
}
```

| Field             | Formula / meaning                                                    |
| ----------------- | -------------------------------------------------------------------- |
| `KDR`             | `ratio(kills, deaths)`.                                              |
| `WLR`             | `ratio(wins, losses)`.                                               |
| `killsForNextKdr` | Kills needed, with zero further deaths, to reach the next whole KDR. |
| `winsForNextWlr`  | Wins needed, with zero further losses, to reach the next whole WLR.  |
| `meleeAccuracy`   | `ratio(meleeHits, meleeSwings)`: fraction of melee swings that hit.  |
| `bowAccuracy`     | `ratio(bowHits, bowShots)`: fraction of bow shots that hit.          |

## `DuelsModeComputed`

Computed for each standalone single mode (`blitz`, `bow`, `noDebuff`, `combo`, `bowSpleef`, `sumo`, `boxing`, `parkour`).

```ts
export interface DuelsModeComputed extends DuelsCombatRatios {
  readonly title: string;
  readonly winsForNextTitle: number;
}
```

| Field              | Formula / meaning                                                                   |
| ------------------ | ----------------------------------------------------------------------------------- |
| `title`            | Division title from the mode's `titlePrestige` (see Titles above).                  |
| `winsForNextTitle` | Wins needed to reach the next title threshold, from the mode's wins (multiplier 1). |
| (inherited)        | All `DuelsCombatRatios` fields, computed from the mode's own counters.              |

## `DuelsGroupTotals`

Counters summed across every submode of a mode group.

```ts
export interface DuelsGroupTotals {
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly playedGames: number;
  readonly swings: number;
  readonly hits: number;
  readonly bowShots: number;
  readonly bowHits: number;
  readonly blocksPlaced: number;
  readonly healthRegenerated: number;
  readonly goldenApplesEaten: number;
}
```

| Field               | Formula / meaning                           |
| ------------------- | ------------------------------------------- |
| `kills`             | Sum of `kills` across the group's submodes. |
| `deaths`            | Sum of `deaths`.                            |
| `wins`              | Sum of `wins`.                              |
| `losses`            | Sum of `losses`.                            |
| `playedGames`       | Sum of `roundsPlayed`.                      |
| `swings`            | Sum of `meleeSwings`.                       |
| `hits`              | Sum of `meleeHits`.                         |
| `bowShots`          | Sum of `bowShots`.                          |
| `bowHits`           | Sum of `bowHits`.                           |
| `blocksPlaced`      | Sum of `blocksPlaced`.                      |
| `healthRegenerated` | Sum of `healthRegenerated`.                 |
| `goldenApplesEaten` | Sum of `goldenApplesEaten`.                 |

## `DuelsGroupComputed`

Computed for each mode group. The group submodes summed are: `uhc` (`solo`, `doubles`, `fours`, `deathmatch`), `skywars` (`solo`, `doubles`), `megaWalls` (`solo`, `doubles`, `fours`), `overPowered` (`solo`, `doubles`), `classic` (`solo`, `doubles`).

```ts
export interface DuelsGroupComputed
  extends DuelsGroupTotals, DuelsCombatRatios {
  readonly title: string;
  readonly winsForNextTitle: number;
  readonly submodes: Readonly<Record<string, DuelsCombatRatios>>;
}
```

| Field              | Formula / meaning                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`            | Division title from the group's `titlePrestige` (see Titles above).                                                                               |
| `winsForNextTitle` | Wins needed to reach the next title threshold, from the group's summed wins (multiplier 1).                                                       |
| `submodes`         | `DuelsCombatRatios` for each individual submode, keyed by submode name (e.g. `solo`, `doubles`).                                                  |
| (inherited totals) | All `DuelsGroupTotals` fields, summed across the group's submodes.                                                                                |
| (inherited ratios) | All `DuelsCombatRatios` fields, computed from the group totals (`hits` / `swings` feed melee accuracy, `bowHits` / `bowShots` feed bow accuracy). |

## `DuelsBridgeGroupComputed`

The Bridge group, with two extra objective fields. Its submodes are `solo`, `doubles`, `threes`, `fours`, `teamsOfTwo`, `teamsOfThree`, `captureSolo`, `captureThrees`, `tournament`.

```ts
export interface DuelsBridgeGroupComputed extends DuelsGroupComputed {
  readonly goalsPerGame: number;
  readonly capturesPerGame: number;
}
```

| Field             | Formula / meaning                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `goalsPerGame`    | `bridge.goals / playedGames` (goals is a single top-level Bridge counter; games is the summed `roundsPlayed` across all Bridge submodes). |
| `capturesPerGame` | Sum of `captures` across all Bridge submodes, divided by `playedGames`.                                                                   |
| (inherited)       | All `DuelsGroupComputed` fields, built over the nine Bridge submodes.                                                                     |

## `DuelsOverallComputed`

Computed from the top-level (all Duels combined) counters.

```ts
export interface DuelsOverallComputed extends DuelsCombatRatios {
  readonly title: string;
  readonly winsForNextTitle: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly damageDealtPerGame: number;
  readonly blocksPlacedPerGame: number;
  readonly goldenApplesPerGame: number;
  readonly legendaryChestRate: number;
  readonly healPotsPerGame: number;
  readonly goldenHeadToAppleRatio: number;
  readonly favoriteKit: string;
}
```

| Field                    | Formula / meaning                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `title`                  | Division title from the overall `titlePrestige` (see Titles above).                                         |
| `winsForNextTitle`       | Wins needed to reach the next overall title threshold. Overall thresholds are doubled (multiplier 2).       |
| `winRate`                | `ratio(wins, wins + losses)`: fraction of decided games won (0 to 1 scale).                                 |
| `killsPerGame`           | `kills / gamesPlayed`.                                                                                      |
| `damageDealtPerGame`     | `damageDealt / gamesPlayed`.                                                                                |
| `blocksPlacedPerGame`    | `blocksPlaced / gamesPlayed`.                                                                               |
| `goldenApplesPerGame`    | `goldenApplesEaten / gamesPlayed`.                                                                          |
| `legendaryChestRate`     | `ratio(openedLegendaries, openedChests)`: fraction of opened chests that were legendary.                    |
| `healPotsPerGame`        | `healPotsUsed / gamesPlayed`.                                                                               |
| `goldenHeadToAppleRatio` | `ratio(goldenHeadsEaten, goldenApplesEaten)`.                                                               |
| `favoriteKit`            | The kit with the most wins in `kitWins` (the `total` key is excluded). `""` if no kit has more than 0 wins. |
| (inherited)              | All `DuelsCombatRatios` fields, computed from the top-level counters.                                       |

## `DuelsComputed`

The root object returned by `computeDuels(raw: DuelsStats)`.

```ts
export interface DuelsComputed {
  readonly overall: DuelsOverallComputed;
  readonly blitz: DuelsModeComputed;
  readonly bow: DuelsModeComputed;
  readonly noDebuff: DuelsModeComputed;
  readonly combo: DuelsModeComputed;
  readonly bowSpleef: DuelsModeComputed;
  readonly sumo: DuelsModeComputed;
  readonly boxing: DuelsModeComputed;
  readonly parkour: DuelsModeComputed;
  readonly arena: DuelsCombatRatios;
  readonly uhc: DuelsGroupComputed;
  readonly skywars: DuelsGroupComputed;
  readonly megaWalls: DuelsGroupComputed;
  readonly overPowered: DuelsGroupComputed;
  readonly classic: DuelsGroupComputed;
  readonly bridge: DuelsBridgeGroupComputed;
}
```

| Field                                                                         | Formula / meaning                                                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `overall`                                                                     | Overall computed stats (title thresholds doubled).                                               |
| `blitz`, `bow`, `noDebuff`, `combo`, `bowSpleef`, `sumo`, `boxing`, `parkour` | Per single mode computed stats (`DuelsModeComputed`).                                            |
| `arena`                                                                       | Arena duel combat ratios only (Arena has no title prestige, so no `title` / `winsForNextTitle`). |
| `uhc`                                                                         | UHC Duels group over `solo`, `doubles`, `fours`, `deathmatch`.                                   |
| `skywars`                                                                     | SkyWars Duels group over `solo`, `doubles`.                                                      |
| `megaWalls`                                                                   | Mega Walls Duels group over `solo`, `doubles`, `fours`.                                          |
| `overPowered`                                                                 | OP Duels group over `solo`, `doubles`.                                                           |
| `classic`                                                                     | Classic Duels group over `solo`, `doubles`.                                                      |
| `bridge`                                                                      | Bridge group over all nine Bridge submodes, plus `goalsPerGame` and `capturesPerGame`.           |

## `computeDuels`

```ts
export function computeDuels(raw: DuelsStats): DuelsComputed;
```

Builds the whole computed block from the parsed `DuelsStats`.

