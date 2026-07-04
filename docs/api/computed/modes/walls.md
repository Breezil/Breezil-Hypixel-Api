# Walls computed stats

Computed Walls statistics, derived from the parsed `WallsStats` block. They are always present on an enriched player as `player.stats.walls.computed` (when the raw `walls` block exists), produced by `computeWalls(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*ForNext*` fields are the additional amount needed to reach the next whole-number value of the corresponding ratio (0 when the denominator is 0).

## `WallsComputed`

```ts
export interface WallsComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly killsPerGame: number;
  readonly assistKillRatio: number;
  readonly combatParticipationPerGame: number;
  readonly totalMapVotes: number;
  readonly favoriteMap: string;
  readonly perksUnlocked: number;
  readonly monthlyWins: number;
  readonly weeklyWins: number;
  readonly monthlyKills: number;
  readonly weeklyKills: number;
}
```

In the table below, `games` is `wins + losses` (Walls has no dedicated games counter).

| Field                        | Formula                                                                    | Meaning                                                         |
| ---------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `kdr`                        | `kills / deaths`                                                           | Kill/death ratio (bare ratio)                                   |
| `wlr`                        | `wins / losses`                                                            | Win/loss ratio (bare ratio)                                     |
| `winRate`                    | `wins / (wins + losses)`                                                   | Fraction of games won (bare ratio, not a percent)               |
| `killsForNextKdr`            | `neededForNextWholeRatio(kills, deaths)`                                   | Kills needed to reach the next whole KDR                        |
| `winsForNextWlr`             | `neededForNextWholeRatio(wins, losses)`                                    | Wins needed to reach the next whole WLR                         |
| `killsPerGame`               | `kills / games`                                                            | Average kills per game                                          |
| `assistKillRatio`            | `assists / kills`                                                          | Assists per kill (bare ratio)                                   |
| `combatParticipationPerGame` | `(kills + assists) / games`                                                | Average kills plus assists per game                             |
| `totalMapVotes`              | sum of the 17 per-map vote counters                                        | Total map votes cast across all maps                            |
| `favoriteMap`                | map with the highest vote count, only counting maps with more than 0 votes | Most-voted map; `""` when no map has votes                      |
| `perksUnlocked`              | count of perk fields whose level is greater than 0                         | Number of distinct perks unlocked (out of 61 tracked perk keys) |
| `monthlyWins`                | `monthlyValue(monthlyWinsA, monthlyWinsB, now)`                            | Wins in the current monthly bucket                              |
| `weeklyWins`                 | `weeklyValue(weeklyWinsA, weeklyWinsB, now)`                               | Wins in the current weekly bucket                               |
| `monthlyKills`               | `monthlyValue(monthlyKillsA, monthlyKillsB, now)`                          | Kills in the current monthly bucket                             |
| `weeklyKills`                | `weeklyValue(weeklyKillsA, weeklyKillsB, now)`                             | Kills in the current weekly bucket                              |

### Map votes

`totalMapVotes` and `favoriteMap` are computed over these 17 raw vote counters, keyed by map name: `votesAztec` (Aztec), `votesCandyland` (Candyland), `votesCastle` (Castle), `votesDwarven` (Dwarven), `votesEgypt` (Egypt), `votesFantasy` (Fantasy), `votesHarmony` (Harmony), `votesIsland` (Island), `votesJungle` (Jungle), `votesLoveLand` (LoveLand), `votesModern` (Modern), `votesNordic` (Nordic), `votesOutback` (Outback), `votesSaraat` (Saraat), `votesShire` (Shire), `votesSpace` (Space), `votesWild` (Wild).

### Perk keys

`perksUnlocked` checks these 61 raw perk fields, counting each one that is greater than 0: `adrenaline`, `artisan`, `attractor`, `bacon`, `berserk`, `blacksmith`, `blacksmithStarter`, `bomberman`, `bossDigger`, `bossGuardian`, `bossSkills`, `burnBabyBurn`, `canadian`, `catsEye`, `chainkiller`, `chef`, `chemist`, `creeperEgg`, `dwarwenSkills`, `ecologist`, `einstein`, `escapist`, `excavator`, `expertMiner`, `farmer`, `finalForm`, `fireproof`, `fisherman`, `fortune`, `getToTheChoppa`, `goldRush`, `graveDigger`, `grimReaper`, `guitarist`, `haste`, `hunter`, `lazyman`, `leatherWorker`, `masterTroll`, `necromancer`, `opportunity`, `pyromaniac`, `ready`, `reallyShiny`, `redstoneExpert`, `sage`, `scotsman`, `skybaseKing`, `smartBoy`, `snackLover`, `soupDrinker`, `step`, `stoneGuardian`, `swift`, `tenacity`, `thatsHot`, `tragedy`, `trapEngineer`, `vampirism`, `veryFortunate`, `vitality`.

### Weekly and monthly buckets

Hypixel stores rolling weekly and monthly stats in two alternating buckets (`A` and `B`). The monthly bucket is chosen by the parity of the current month (odd months read `A`, even months read `B`); the weekly bucket alternates by whole weeks elapsed since a fixed epoch. The computed values return the bucket that is currently accumulating, evaluated at compute time.

