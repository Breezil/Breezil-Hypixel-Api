# VampireZ computed stats

Derived VampireZ metrics, attached as the always-on `computed` property of the raw stats
block: whenever `player.stats.vampireZ` is present, `player.stats.vampireZ.computed` is a
`VampireZComputed` built by `computeVampireZ(raw)` from
`src/computed/modes/vampirez.ts`. All inputs are fields of the raw `VampireZStats` block
(and its `human`, `vampire`, `perks`, `votes`, `monthly`, and `weekly` sub-blocks).

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

## `VampireZComputed`

The top-level object at `player.stats.vampireZ.computed`. The combined totals below use
`kills = human.kills + vampire.kills`, `deaths = human.deaths + vampire.deaths`, and
`wins = human.wins + vampire.wins`.

```ts
export interface VampireZComputed {
  readonly human: VampireZRoleComputed;
  readonly vampire: VampireZRoleComputed;
  readonly kills: number;
  readonly deaths: number;
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wins: number;
  readonly killsPerWin: number;
  readonly vampireKillShare: number;
  readonly humanWinShare: number;
  readonly zombieKillsPerWin: number;
  readonly totalPerkLevels: number;
  readonly totalMapVotes: number;
  readonly bestVampireKills: number;
  readonly monthlyWins: VampireZPeriodWinsComputed;
  readonly weeklyWins: VampireZPeriodWinsComputed;
}
```

| Field               | Formula                                                 | Meaning                                                                                       |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `human`             | `computeRole(raw.human)`                                | Derived stats while playing as a human; see [`VampireZRoleComputed`](#vampirezrolecomputed)   |
| `vampire`           | `computeRole(raw.vampire)`                              | Derived stats while playing as a vampire; see [`VampireZRoleComputed`](#vampirezrolecomputed) |
| `kills`             | `raw.human.kills + raw.vampire.kills`                   | Combined kills across both roles                                                              |
| `deaths`            | `raw.human.deaths + raw.vampire.deaths`                 | Combined deaths across both roles                                                             |
| `kdr`               | `kills / deaths`                                        | Combined kill/death ratio                                                                     |
| `killsForNextKdr`   | `neededForNextWholeRatio(kills, deaths)`                | Combined kills still needed to reach the next whole-number KDR                                |
| `wins`              | `raw.human.wins + raw.vampire.wins`                     | Combined wins across both roles                                                               |
| `killsPerWin`       | `kills / wins`                                          | Combined kills per combined win                                                               |
| `vampireKillShare`  | `100 * raw.vampire.kills / kills`                       | Percentage of combined kills scored as a vampire (0-100)                                      |
| `humanWinShare`     | `100 * raw.human.wins / wins`                           | Percentage of combined wins earned as a human (0-100)                                         |
| `zombieKillsPerWin` | `raw.zombieKills / wins`                                | Zombie kills per combined win                                                                 |
| `totalPerkLevels`   | `sum(Object.values(raw.perks))`                         | Sum of all purchased perk levels                                                              |
| `totalMapVotes`     | `sum(Object.values(raw.votes))`                         | Sum of all map votes cast                                                                     |
| `bestVampireKills`  | `max(raw.mostVampireKills, raw.mostVampireKillsLegacy)` | Best single-game vampire kill record, taking the higher of the modern and legacy counters     |
| `monthlyWins`       | current month bucket of `raw.monthly`                   | This month's wins per role; see [`VampireZPeriodWinsComputed`](#vampirezperiodwinscomputed)   |
| `weeklyWins`        | current week bucket of `raw.weekly`                     | This week's wins per role; see [`VampireZPeriodWinsComputed`](#vampirezperiodwinscomputed)    |

## `VampireZRoleComputed`

Computed once for the human role (from `raw.human`) and once for the vampire role (from
`raw.vampire`).

```ts
export interface VampireZRoleComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly killsPerWin: number;
}
```

| Field             | Formula                                            | Meaning                                                            |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| `kdr`             | `role.kills / role.deaths`                         | Kill/death ratio in this role                                      |
| `killsForNextKdr` | `neededForNextWholeRatio(role.kills, role.deaths)` | Kills still needed in this role to reach the next whole-number KDR |
| `killsPerWin`     | `role.kills / role.wins`                           | Average kills per win in this role                                 |

## `VampireZPeriodWinsComputed`

The shape of both `monthlyWins` and `weeklyWins`. Each value is the raw counter from the
A or B oscillation slot that is live for the current date (see the conventions above);
no arithmetic is applied beyond the bucket pick.

```ts
export interface VampireZPeriodWinsComputed {
  readonly human: number;
  readonly vampire: number;
}
```

| Field     | Formula                                                                                                                                                        | Meaning                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `human`   | monthly: `monthlyValue(raw.monthly.humanWinsA, raw.monthly.humanWinsB, now)`; weekly: `weeklyValue(raw.weekly.humanWinsA, raw.weekly.humanWinsB, now)`         | Wins as a human in the current period   |
| `vampire` | monthly: `monthlyValue(raw.monthly.vampireWinsA, raw.monthly.vampireWinsB, now)`; weekly: `weeklyValue(raw.weekly.vampireWinsA, raw.weekly.vampireWinsB, now)` | Wins as a vampire in the current period |

