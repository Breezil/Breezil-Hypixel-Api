# Murder Mystery computed stats

Computed Murder Mystery statistics, derived from the parsed `MurderMysteryStats` block. They are always present on an enriched player as `player.stats.murderMystery.computed` (when the raw `murderMystery` block exists), produced by `computeMurderMystery(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*Share` fields are percentages from 0 to 100 (0 when the whole is 0). `*ForNext*` fields are the additional amount needed to reach the next whole-number value of the corresponding ratio (0 when the denominator is 0).

## `MurderMysteryComputed`

```ts
export interface MurderMysteryComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly knifeKillShare: number;
  readonly bowKillShare: number;
  readonly thrownKnifeKillShare: number;
  readonly trapKillShare: number;
  readonly murdererKillShare: number;
  readonly avgTimeSurvivedPerGame: number;
  readonly detectiveWinShare: number;
  readonly murdererWinShare: number;
  readonly survivorWinShare: number;
  readonly legendaryChestRate: number;
  readonly coinsPerGame: number;
  readonly heroRate: number;
  readonly mostPlayedMap: string | null;
  readonly mostPlayedGamemode: string | null;
}
```

| Field                    | Formula                                                                                              | Meaning                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `kdr`                    | `kills / deaths`                                                                                     | Kill/death ratio (bare ratio)                                             |
| `killsForNextKdr`        | `neededForNextWholeRatio(kills, deaths)`                                                             | Kills needed to reach the next whole KDR                                  |
| `winRate`                | `wins / games`                                                                                       | Fraction of games won (bare ratio, not a percent)                         |
| `killsPerGame`           | `kills / games`                                                                                      | Average kills per game                                                    |
| `knifeKillShare`         | `100 * knifeKills / kills`                                                                           | Percent (0-100) of kills made with the knife                              |
| `bowKillShare`           | `100 * bowKills / kills`                                                                             | Percent (0-100) of kills made with the bow                                |
| `thrownKnifeKillShare`   | `100 * thrownKnifeKills / kills`                                                                     | Percent (0-100) of kills made with a thrown knife                         |
| `trapKillShare`          | `100 * trapKills / kills`                                                                            | Percent (0-100) of kills made with traps                                  |
| `murdererKillShare`      | `100 * killsAsMurderer / kills`                                                                      | Percent (0-100) of kills made while playing as the murderer               |
| `avgTimeSurvivedPerGame` | `totalTimeSurvivedSeconds / games`                                                                   | Average survival time per game, in seconds                                |
| `detectiveWinShare`      | `100 * detectiveWins / wins`                                                                         | Percent (0-100) of wins earned as the detective                           |
| `murdererWinShare`       | `100 * murdererWins / wins`                                                                          | Percent (0-100) of wins earned as the murderer                            |
| `survivorWinShare`       | `100 * survivorWins / wins`                                                                          | Percent (0-100) of wins earned as a survivor                              |
| `legendaryChestRate`     | `openedLegendaries / openedChests`                                                                   | Legendary pulls per chest opened (bare ratio, not a percent)              |
| `coinsPerGame`           | `coinsPickedUp / games`                                                                              | Average coins picked up per game                                          |
| `heroRate`               | `wasHero / games`                                                                                    | Times the player was the hero per game played (bare ratio, not a percent) |
| `mostPlayedMap`          | map in `raw.maps` with the highest `games`, only counting maps with more than 0 games                | Most-played map; `null` when no map has games                             |
| `mostPlayedGamemode`     | gamemode in `raw.gamemodes` with the highest `games`, only counting gamemodes with more than 0 games | Most-played gamemode; `null` when no gamemode has games                   |

