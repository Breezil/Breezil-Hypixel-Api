# TNT Games computed stats

Derived TNT Games metrics, attached as the always-on `computed` property of the raw stats
block: whenever `player.stats.tntGames` is present, `player.stats.tntGames.computed` is a
`TNTGamesComputed` built by `computeTNTGames(raw)` from
`src/computed/modes/tntgames.ts`. All inputs are fields of the raw `TNTGamesStats` block
(and its `tntRun`, `pvpRun`, `bowSpleef`, `tntTag`, and `wizards` sub-blocks).

Conventions used below:

- **Ratios** are bare (not percentages), rounded to 2 decimals. When the denominator is
  `0` the numerator is returned as-is (K/D convention).
- **`*Share`** fields are percentages from 0 to 100, rounded to 2 decimals; a zero whole
  yields `0`.
- **`*ForNext*`** fields are the additional amount of the numerator stat needed to reach
  the next whole ratio (`floor(num / den) + 1`); `0` when the denominator is `0`.

## `TNTGamesComputed`

The top-level object at `player.stats.tntGames.computed`.

```ts
export interface TNTGamesComputed {
  readonly tntRun: TNTGamesTNTRunComputed;
  readonly pvpRun: TNTGamesPVPRunComputed;
  readonly bowSpleef: TNTGamesBowSpleefComputed;
  readonly tntTag: TNTGamesTNTTagComputed;
  readonly wizards: TNTGamesWizardsComputed;
  readonly modeWinShare: TNTGamesModeWinShare;
}
```

| Field          | Formula                                                       | Meaning                                                       |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `tntRun`       | see [`TNTGamesTNTRunComputed`](#tntgamestntruncomputed)       | Derived TNT Run metrics                                       |
| `pvpRun`       | see [`TNTGamesPVPRunComputed`](#tntgamespvpruncomputed)       | Derived PVP Run metrics                                       |
| `bowSpleef`    | see [`TNTGamesBowSpleefComputed`](#tntgamesbowspleefcomputed) | Derived Bow Spleef metrics                                    |
| `tntTag`       | see [`TNTGamesTNTTagComputed`](#tntgamestnttagcomputed)       | Derived TNT Tag metrics                                       |
| `wizards`      | see [`TNTGamesWizardsComputed`](#tntgameswizardscomputed)     | Derived Wizards metrics, including per-class breakdowns       |
| `modeWinShare` | see [`TNTGamesModeWinShare`](#tntgamesmodewinshare)           | Each mode's percentage of the player's overall TNT Games wins |

## `TNTGamesTNTRunComputed`

```ts
export interface TNTGamesTNTRunComputed {
  readonly wlr: number;
  readonly potionsPerWin: number;
}
```

| Field           | Formula                                                        | Meaning                                                    |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `wlr`           | `tntRun.wins / tntRun.deaths`                                  | Win/loss ratio for TNT Run; deaths stand in for losses     |
| `potionsPerWin` | `(tntRun.slownessPotions + tntRun.speedPotions) / tntRun.wins` | Total potions (slowness plus speed) thrown per TNT Run win |

## `TNTGamesPVPRunComputed`

```ts
export interface TNTGamesPVPRunComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly killsPerWin: number;
}
```

| Field             | Formula                                                | Meaning                                                |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `kdr`             | `pvpRun.kills / pvpRun.deaths`                         | Kill/death ratio in PVP Run                            |
| `killsForNextKdr` | `neededForNextWholeRatio(pvpRun.kills, pvpRun.deaths)` | Kills still needed to reach the next whole-number KDR  |
| `wlr`             | `pvpRun.wins / pvpRun.deaths`                          | Win/loss ratio for PVP Run; deaths stand in for losses |
| `killsPerWin`     | `pvpRun.kills / pvpRun.wins`                           | Average kills per PVP Run win                          |

## `TNTGamesBowSpleefComputed`

```ts
export interface TNTGamesBowSpleefComputed {
  readonly wlr: number;
  readonly tagsPerWin: number;
}
```

| Field        | Formula                             | Meaning                                                   |
| ------------ | ----------------------------------- | --------------------------------------------------------- |
| `wlr`        | `bowSpleef.wins / bowSpleef.deaths` | Win/loss ratio for Bow Spleef; deaths stand in for losses |
| `tagsPerWin` | `bowSpleef.tags / bowSpleef.wins`   | Average tags landed per Bow Spleef win                    |

## `TNTGamesTNTTagComputed`

```ts
export interface TNTGamesTNTTagComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly killsPerWin: number;
}
```

| Field             | Formula                                                | Meaning                                                |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `kdr`             | `tntTag.kills / tntTag.deaths`                         | Kill/death ratio in TNT Tag                            |
| `killsForNextKdr` | `neededForNextWholeRatio(tntTag.kills, tntTag.deaths)` | Kills still needed to reach the next whole-number KDR  |
| `wlr`             | `tntTag.wins / tntTag.deaths`                          | Win/loss ratio for TNT Tag; deaths stand in for losses |
| `killsPerWin`     | `tntTag.kills / tntTag.wins`                           | Average kills per TNT Tag win                          |

## `TNTGamesWizardsComputed`

```ts
export interface TNTGamesWizardsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly kad: number;
  readonly assistRatio: number;
  readonly pointsPerWin: number;
  readonly killsPerWin: number;
  readonly classes: Readonly<Record<string, TNTGamesWizardClassComputed>>;
}
```

| Field             | Formula                                                  | Meaning                                                                                |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `kdr`             | `wizards.kills / wizards.deaths`                         | Overall Wizards kill/death ratio                                                       |
| `killsForNextKdr` | `neededForNextWholeRatio(wizards.kills, wizards.deaths)` | Kills still needed to reach the next whole-number KDR                                  |
| `wlr`             | `wizards.wins / wizards.deaths`                          | Win/loss ratio for Wizards; deaths stand in for losses                                 |
| `kad`             | `(wizards.kills + wizards.assists) / wizards.deaths`     | Kills-and-assists per death                                                            |
| `assistRatio`     | `wizards.assists / wizards.kills`                        | Assists per kill                                                                       |
| `pointsPerWin`    | `wizards.points / wizards.wins`                          | Average capture points per Wizards win                                                 |
| `killsPerWin`     | `wizards.kills / wizards.wins`                           | Average kills per Wizards win                                                          |
| `classes`         | one entry per class name                                 | Per-class breakdown; see [`TNTGamesWizardClassComputed`](#tntgameswizardclasscomputed) |

The `classes` record always contains exactly these ten keys, in this order: `ancient`,
`arcane`, `blood`, `fire`, `hydro`, `ice`, `kinetic`, `storm`, `toxic`, `wither`.

## `TNTGamesWizardClassComputed`

One entry per wizard class, computed from that class's `TNTGamesWizardBase` raw stats.

```ts
export interface TNTGamesWizardClassComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly mitigationPerDeath: number;
}
```

| Field                | Formula                                              | Meaning                                                             |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| `kdr`                | `class.kills / class.deaths`                         | Kill/death ratio on this class                                      |
| `killsForNextKdr`    | `neededForNextWholeRatio(class.kills, class.deaths)` | Kills still needed on this class to reach the next whole-number KDR |
| `mitigationPerDeath` | `(class.healing + class.damageTaken) / class.deaths` | Damage soaked (healing plus damage taken) per death on this class   |

## `TNTGamesModeWinShare`

Each field is a percentage (0-100) of the player's overall TNT Games wins (`raw.wins`)
earned in that mode. `0` when `raw.wins` is `0`.

```ts
export interface TNTGamesModeWinShare {
  readonly tntRun: number;
  readonly pvpRun: number;
  readonly bowSpleef: number;
  readonly tntTag: number;
  readonly wizards: number;
}
```

| Field       | Formula                           | Meaning                                         |
| ----------- | --------------------------------- | ----------------------------------------------- |
| `tntRun`    | `100 * tntRun.wins / raw.wins`    | Share of overall TNT Games wins from TNT Run    |
| `pvpRun`    | `100 * pvpRun.wins / raw.wins`    | Share of overall TNT Games wins from PVP Run    |
| `bowSpleef` | `100 * bowSpleef.wins / raw.wins` | Share of overall TNT Games wins from Bow Spleef |
| `tntTag`    | `100 * tntTag.wins / raw.wins`    | Share of overall TNT Games wins from TNT Tag    |
| `wizards`   | `100 * wizards.wins / raw.wins`   | Share of overall TNT Games wins from Wizards    |

