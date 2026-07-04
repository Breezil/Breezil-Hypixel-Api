# Build Battle computed stats

Computed Build Battle statistics, derived from the parsed `BuildBattleStats` block. They are always present on an enriched player as `player.stats.buildBattle.computed` (when the raw `buildBattle` block exists), produced by `computeBuildBattle(raw)`.

All ratios are rounded to 2 decimals. A ratio with a zero denominator yields the numerator (K/D convention). `*Share` and `*Percent` fields are percentages from 0 to 100 (0 when the whole is 0). `progressToNextTitle` is the additional score needed for the next title.

## `BuildBattleComputed`

```ts
export interface BuildBattleComputed {
  readonly winRate: number;
  readonly votesPerGame: number;
  readonly superVoteShare: number;
  readonly correctGuessesPerGame: number;
  readonly firstGuessShare: number;
  readonly scorePerWin: number;
  readonly scorePerGame: number;
  readonly seasonalWinShare: number;
  readonly modeWinShare: BuildBattleModeWinShare;
  readonly title: BuildBattleTitle;
  readonly progressToNextTitle: number;
  readonly titleProgressPercent: number;
  readonly monthlyTokens: number;
  readonly weeklyTokens: number;
  readonly mostVotedTheme: string | null;
  readonly mostWonBackdrop: string | null;
}
```

| Field                   | Formula                                                                                              | Meaning                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `winRate`               | `wins / gamesPlayed`                                                                                 | Fraction of games won (bare ratio, not a percent)                    |
| `votesPerGame`          | `totalVotes / gamesPlayed`                                                                           | Average votes cast per game                                          |
| `superVoteShare`        | `100 * superVotes / totalVotes`                                                                      | Percent (0-100) of votes that were super votes                       |
| `correctGuessesPerGame` | `correctGuesses / gamesPlayed`                                                                       | Average correct Guess The Build guesses per game                     |
| `firstGuessShare`       | `100 * firstGuesses / correctGuesses`                                                                | Percent (0-100) of correct guesses that were the first correct guess |
| `scorePerWin`           | `score / wins`                                                                                       | Average score earned per win (bare ratio)                            |
| `scorePerGame`          | `score / gamesPlayed`                                                                                | Average score earned per game                                        |
| `seasonalWinShare`      | `100 * seasonalWins / wins`                                                                          | Percent (0-100) of wins from seasonal modes                          |
| `modeWinShare`          | see `BuildBattleModeWinShare`                                                                        | Percent of wins per mode                                             |
| `title`                 | highest title whose score requirement is at or below `raw.score`                                     | Current Build Battle title                                           |
| `progressToNextTitle`   | `nextTitleRequirement - score`; 0 at the top title (Ascended)                                        | Score still needed to reach the next title                           |
| `titleProgressPercent`  | `100 * (score - currentRequirement) / (nextRequirement - currentRequirement)`; 100 at the top title  | Percent (0-100) of the way from the current title to the next        |
| `monthlyTokens`         | `monthlyValue(monthlyCoins.coinsA, monthlyCoins.coinsB, now)`                                        | Tokens earned in the current monthly bucket                          |
| `weeklyTokens`          | `weeklyValue(weeklyCoins.coinsA, weeklyCoins.coinsB, now)`                                           | Tokens earned in the current weekly bucket                           |
| `mostVotedTheme`        | theme in `raw.votesByTheme` with the highest count, only counting themes with more than 0 votes      | Most-voted theme; `null` when no theme has votes                     |
| `mostWonBackdrop`       | backdrop in `raw.backdropWins` with the highest count, only counting backdrops with more than 0 wins | Most-won backdrop; `null` when no backdrop has wins                  |

## `BuildBattleModeWinShare`

Each field is the percent (0-100) of total wins earned in that mode: `100 * modeWins / wins` (0 when `wins` is 0).

```ts
export interface BuildBattleModeWinShare {
  readonly soloNormal: number;
  readonly soloPro: number;
  readonly teamsNormal: number;
  readonly speedBuilders: number;
  readonly guessTheBuild: number;
  readonly halloween: number;
}
```

| Field           | Formula                          | Meaning                                 |
| --------------- | -------------------------------- | --------------------------------------- |
| `soloNormal`    | `100 * winsSoloNormal / wins`    | Percent of wins from Solo Normal        |
| `soloPro`       | `100 * winsSoloPro / wins`       | Percent of wins from Solo Pro           |
| `teamsNormal`   | `100 * winsTeamsNormal / wins`   | Percent of wins from Teams Normal       |
| `speedBuilders` | `100 * winsSpeedBuilders / wins` | Percent of wins from Speed Builders     |
| `guessTheBuild` | `100 * winsGuessTheBuild / wins` | Percent of wins from Guess The Build    |
| `halloween`     | `100 * winsHalloween / wins`     | Percent of wins from the Halloween mode |

## `BuildBattleTitle`

The union of all title names, in ascending order of score requirement.

```ts
export type BuildBattleTitle =
  | "Rookie"
  | "Untrained"
  | "Amatuer"
  | "Prospect"
  | "Apprentice"
  | "Experienced"
  | "Seasoned"
  | "Trained"
  | "Skilled"
  | "Talented"
  | "Professional"
  | "Artisan"
  | "Expert"
  | "Master"
  | "Legend"
  | "Grandmaster"
  | "Celestial"
  | "Divine"
  | "Ascended";
```

Note: `"Amatuer"` is spelled exactly as in the source's title table; match that spelling when comparing against `title`.

### Title requirements

| Title        | Score required |
| ------------ | -------------- |
| Rookie       | 0              |
| Untrained    | 100            |
| Amatuer      | 250            |
| Prospect     | 550            |
| Apprentice   | 1000           |
| Experienced  | 2000           |
| Seasoned     | 3500           |
| Trained      | 5000           |
| Skilled      | 7500           |
| Talented     | 10000          |
| Professional | 15000          |
| Artisan      | 20000          |
| Expert       | 30000          |
| Master       | 50000          |
| Legend       | 100000         |
| Grandmaster  | 200000         |
| Celestial    | 300000         |
| Divine       | 400000         |
| Ascended     | 500000         |

### Weekly and monthly buckets

Hypixel stores rolling weekly and monthly stats in two alternating buckets (`A` and `B`). The monthly bucket is chosen by the parity of the current month (odd months read `A`, even months read `B`); the weekly bucket alternates by whole weeks elapsed since a fixed epoch. The computed values return the bucket that is currently accumulating, evaluated at compute time.

