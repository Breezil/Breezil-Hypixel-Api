# Arcade computed stats

Derived Arcade metrics, attached as the always-on `computed` property of the raw stats
block: whenever `player.stats.arcade` is present, `player.stats.arcade.computed` is an
`ArcadeComputed` built by `computeArcade(raw)` from `src/computed/modes/arcade.ts`. All
inputs are fields of the raw `ArcadeStats` block and its per-game sub-blocks
(`zombies`, `miniWalls`, `galaxyWars`, `dropper`, `hideAndSeek`, `bountyHunters`,
`throwOut`, `farmHunt`, `soccer`, `pixelParty`, `disasters`, `blockingDead`).

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

## `ArcadeComputed`

The top-level object at `player.stats.arcade.computed`.

```ts
export interface ArcadeComputed {
  readonly monthlyTokens: number;
  readonly weeklyTokens: number;
  readonly zombies: ArcadeZombiesComputed;
  readonly miniWalls: ArcadeMiniWallsComputed;
  readonly galaxyWars: ArcadeGalaxyWarsComputed;
  readonly dropper: ArcadeDropperComputed;
  readonly hideAndSeek: ArcadeHideAndSeekComputed;
  readonly bountyHunters: ArcadeBountyHuntersComputed;
  readonly throwOut: ArcadeThrowOutComputed;
  readonly farmHunt: ArcadeFarmHuntComputed;
  readonly soccer: ArcadeSoccerComputed;
  readonly pixelParty: ArcadePixelPartyComputed;
  readonly disasters: ArcadeDisastersComputed;
  readonly blockingDead: ArcadeBlockingDeadComputed;
}
```

| Field           | Formula                                                           | Meaning                                                                  |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `monthlyTokens` | `monthlyValue(raw.monthlyTokensA, raw.monthlyTokensB, now)`       | Arcade coins earned this month, from the live monthly oscillation bucket |
| `weeklyTokens`  | `weeklyValue(raw.weeklyTokensA, raw.weeklyTokensB, now)`          | Arcade coins earned this week, from the live weekly oscillation bucket   |
| `zombies`       | see [`ArcadeZombiesComputed`](#arcadezombiescomputed)             | Derived Zombies metrics and per-map best times                           |
| `miniWalls`     | see [`ArcadeMiniWallsComputed`](#arcademiniwallscomputed)         | Derived Mini Walls metrics                                               |
| `galaxyWars`    | see [`ArcadeGalaxyWarsComputed`](#arcadegalaxywarscomputed)       | Derived Galaxy Wars metrics                                              |
| `dropper`       | see [`ArcadeDropperComputed`](#arcadedroppercomputed)             | Derived Dropper metrics                                                  |
| `hideAndSeek`   | see [`ArcadeHideAndSeekComputed`](#arcadehideandseekcomputed)     | Derived Hide and Seek metrics                                            |
| `bountyHunters` | see [`ArcadeBountyHuntersComputed`](#arcadebountyhunterscomputed) | Derived Bounty Hunters metrics                                           |
| `throwOut`      | see [`ArcadeThrowOutComputed`](#arcadethrowoutcomputed)           | Derived Throw Out metrics                                                |
| `farmHunt`      | see [`ArcadeFarmHuntComputed`](#arcadefarmhuntcomputed)           | Derived Farm Hunt metrics                                                |
| `soccer`        | see [`ArcadeSoccerComputed`](#arcadesoccercomputed)               | Derived Soccer metrics                                                   |
| `pixelParty`    | see [`ArcadePixelPartyComputed`](#arcadepixelpartycomputed)       | Derived Pixel Party metrics                                              |
| `disasters`     | see [`ArcadeDisastersComputed`](#arcadedisasterscomputed)         | Derived Disasters metrics                                                |
| `blockingDead`  | see [`ArcadeBlockingDeadComputed`](#arcadeblockingdeadcomputed)   | Derived Blocking Dead metrics                                            |

## `ArcadeZombiesComputed`

```ts
export interface ArcadeZombiesComputed {
  readonly bulletAccuracy: number;
  readonly headshotRate: number;
  readonly reviveReliability: number;
  readonly killsPerRound: number;
  readonly badBlood: ArcadeZombiesMapTimesComputed;
  readonly deadEnd: ArcadeZombiesMapTimesComputed;
  readonly prison: ArcadeZombiesMapTimesComputed;
}
```

| Field               | Formula                                             | Meaning                                                                                              |
| ------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `bulletAccuracy`    | `zombies.bulletsHit / zombies.bulletsShot`          | Fraction of bullets fired that hit (bare ratio, not a percentage)                                    |
| `headshotRate`      | `zombies.headshots / zombies.bulletsHit`            | Fraction of landed bullets that were headshots (bare ratio)                                          |
| `reviveReliability` | `zombies.playersRevived / zombies.timesKnockedDown` | Teammates revived per time the player was knocked down                                               |
| `killsPerRound`     | `zombies.zombieKills / zombies.totalRoundsSurvived` | Average zombie kills per round survived                                                              |
| `badBlood`          | `mapTimes(zombies.badBlood)`                        | Best round times on Bad Blood; see [`ArcadeZombiesMapTimesComputed`](#arcadezombiesmaptimescomputed) |
| `deadEnd`           | `mapTimes(zombies.deadEnd)`                         | Best round times on Dead End; see [`ArcadeZombiesMapTimesComputed`](#arcadezombiesmaptimescomputed)  |
| `prison`            | `mapTimes(zombies.prison)`                          | Best round times on Prison; see [`ArcadeZombiesMapTimesComputed`](#arcadezombiesmaptimescomputed)    |

## `ArcadeZombiesMapTimesComputed`

Per-map best times. Each field takes the fastest strictly positive time across that
map's three difficulties (`normal`, `hard`, `rip`); `0` means no recorded time on any
difficulty.

```ts
export interface ArcadeZombiesMapTimesComputed {
  readonly fastestTime10: number;
  readonly fastestTime20: number;
  readonly fastestTime30: number;
}
```

| Field           | Formula                                                                                  | Meaning                                             |
| --------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `fastestTime10` | `minPositive([map.normal.fastestTime10, map.hard.fastestTime10, map.rip.fastestTime10])` | Best time to reach round 10 across all difficulties |
| `fastestTime20` | `minPositive([map.normal.fastestTime20, map.hard.fastestTime20, map.rip.fastestTime20])` | Best time to reach round 20 across all difficulties |
| `fastestTime30` | `minPositive([map.normal.fastestTime30, map.hard.fastestTime30, map.rip.fastestTime30])` | Best time to reach round 30 across all difficulties |

## `ArcadeMiniWallsComputed`

```ts
export interface ArcadeMiniWallsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly arrowAccuracy: number;
  readonly finalKillRate: number;
}
```

| Field             | Formula                                                                             | Meaning                                                        |
| ----------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `kdr`             | `(miniWalls.kills + miniWalls.finalKills) / miniWalls.deaths`                       | Kill/death ratio counting final kills as kills                 |
| `killsForNextKdr` | `neededForNextWholeRatio(miniWalls.kills + miniWalls.finalKills, miniWalls.deaths)` | Combined kills still needed to reach the next whole-number KDR |
| `arrowAccuracy`   | `miniWalls.arrowsHit / miniWalls.arrowsShot`                                        | Fraction of arrows shot that hit (bare ratio)                  |
| `finalKillRate`   | `miniWalls.finalKills / (miniWalls.kills + miniWalls.finalKills)`                   | Fraction of all kills that were final kills (bare ratio)       |

## `ArcadeGalaxyWarsComputed`

```ts
export interface ArcadeGalaxyWarsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly empireKillShare: number;
  readonly shotsPerKill: number;
  readonly monthlyKills: number;
  readonly weeklyKills: number;
}
```

| Field             | Formula                                                                           | Meaning                                                    |
| ----------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `kdr`             | `galaxyWars.kills / galaxyWars.deaths`                                            | Kill/death ratio in Galaxy Wars                            |
| `killsForNextKdr` | `neededForNextWholeRatio(galaxyWars.kills, galaxyWars.deaths)`                    | Kills still needed to reach the next whole-number KDR      |
| `empireKillShare` | `100 * galaxyWars.empireKills / (galaxyWars.empireKills + galaxyWars.rebelKills)` | Percentage of faction kills scored as the Empire (0-100)   |
| `shotsPerKill`    | `galaxyWars.shotsFired / galaxyWars.kills`                                        | Average shots fired per kill                               |
| `monthlyKills`    | `monthlyValue(galaxyWars.monthlyKillsA, galaxyWars.monthlyKillsB, now)`           | Kills this month, from the live monthly oscillation bucket |
| `weeklyKills`     | `weeklyValue(galaxyWars.weeklyKillsA, galaxyWars.weeklyKillsB, now)`              | Kills this week, from the live weekly oscillation bucket   |

## `ArcadeDropperComputed`

```ts
export interface ArcadeDropperComputed {
  readonly flawlessRate: number;
  readonly failsPerGame: number;
}
```

| Field          | Formula                                         | Meaning                                                          |
| -------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `flawlessRate` | `dropper.flawlessGames / dropper.gamesFinished` | Fraction of finished games completed without a fail (bare ratio) |
| `failsPerGame` | `dropper.fails / dropper.gamesPlayed`           | Average fails per game played                                    |

## `ArcadeHideAndSeekComputed`

Uses the combined total
`hideAndSeekWins = hiderWins + seekerWins + propHuntHiderWins + propHuntSeekerWins + partyPooperHiderWins + partyPooperSeekerWins`.

```ts
export interface ArcadeHideAndSeekComputed {
  readonly totalWins: number;
  readonly hiderWinShare: number;
}
```

| Field           | Formula                                                                                                              | Meaning                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `totalWins`     | `hideAndSeekWins` (sum of all six win counters)                                                                      | Total wins across both roles of all three Hide and Seek variants |
| `hiderWinShare` | `100 * (hideAndSeek.hiderWins + hideAndSeek.propHuntHiderWins + hideAndSeek.partyPooperHiderWins) / hideAndSeekWins` | Percentage of all Hide and Seek wins earned as a hider (0-100)   |

## `ArcadeBountyHuntersComputed`

```ts
export interface ArcadeBountyHuntersComputed {
  readonly kdr: number;
  readonly bowKillShare: number;
}
```

| Field          | Formula                                              | Meaning                                         |
| -------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `kdr`          | `bountyHunters.kills / bountyHunters.deaths`         | Kill/death ratio in Bounty Hunters              |
| `bowKillShare` | `100 * bountyHunters.bowKills / bountyHunters.kills` | Percentage of kills scored with the bow (0-100) |

## `ArcadeThrowOutComputed`

```ts
export interface ArcadeThrowOutComputed {
  readonly kdr: number;
}
```

| Field | Formula                            | Meaning                       |
| ----- | ---------------------------------- | ----------------------------- |
| `kdr` | `throwOut.kills / throwOut.deaths` | Kill/death ratio in Throw Out |

## `ArcadeFarmHuntComputed`

```ts
export interface ArcadeFarmHuntComputed {
  readonly hunterWinShare: number;
}
```

| Field            | Formula                                     | Meaning                                                 |
| ---------------- | ------------------------------------------- | ------------------------------------------------------- |
| `hunterWinShare` | `100 * farmHunt.hunterWins / farmHunt.wins` | Percentage of Farm Hunt wins earned as a hunter (0-100) |

## `ArcadeSoccerComputed`

```ts
export interface ArcadeSoccerComputed {
  readonly goalsPerKick: number;
}
```

| Field          | Formula                       | Meaning               |
| -------------- | ----------------------------- | --------------------- |
| `goalsPerKick` | `soccer.goals / soccer.kicks` | Goals scored per kick |

## `ArcadePixelPartyComputed`

```ts
export interface ArcadePixelPartyComputed {
  readonly winRate: number;
}
```

| Field     | Formula                                    | Meaning                                                          |
| --------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `winRate` | `pixelParty.wins / pixelParty.gamesPlayed` | Fraction of Pixel Party games won (bare ratio, not a percentage) |

## `ArcadeDisastersComputed`

```ts
export interface ArcadeDisastersComputed {
  readonly winRate: number;
}
```

| Field     | Formula                                  | Meaning                                                        |
| --------- | ---------------------------------------- | -------------------------------------------------------------- |
| `winRate` | `disasters.wins / disasters.gamesPlayed` | Fraction of Disasters games won (bare ratio, not a percentage) |

## `ArcadeBlockingDeadComputed`

```ts
export interface ArcadeBlockingDeadComputed {
  readonly headshotsPerKill: number;
}
```

| Field              | Formula                                       | Meaning                                     |
| ------------------ | --------------------------------------------- | ------------------------------------------- |
| `headshotsPerKill` | `blockingDead.headshots / blockingDead.kills` | Average headshots per kill in Blocking Dead |

