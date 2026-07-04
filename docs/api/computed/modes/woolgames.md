# Wool Games (computed)

Derived Wool Games statistics computed from the parsed `WoolGamesStats` shape, covering the shared progression level plus the three sub-games: Wool Wars, Sheep Wars, and Capture the Wool. Produced by `computeWoolGames(raw: WoolGamesStats): WoolGamesComputed` in `src/computed/modes/woolgames.ts`.

Conventions used on this page (from the shared ratio helpers):

- Ratios (`kdr`, `wlr`, `winRate`, `*PerGame`, and friends) are bare numbers rounded to 2 decimals. A zero denominator yields the numerator (K/D convention), except `percent`-based fields which yield `0`.
- `*Share` and `*Percent` fields are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).
- `*ForNext*` fields are the additional amount of the numerator stat needed to reach the next whole-number ratio (for example, kills needed to push a 2.4 KDR to 3.0). They are `0` when the denominator is `0`.

## `WoolGamesComputed`

The top-level result. Progression level fields come from the Wool Games leveling curve (levels 1 to 5 use fixed XP thresholds of 0 / 1000 / 3000 / 6000 / 10000 / 15000; afterwards each level costs 5000 XP; the curve prestiges every 100 levels, one prestige being 490000 XP).

```ts
export interface WoolGamesComputed {
  readonly level: number;
  readonly exactLevel: number;
  readonly levelProgressPercent: number;
  readonly xpForNextLevel: number;
  readonly woolWars: WoolWarsComputed;
  readonly sheepWars: SheepWarsComputed;
  readonly captureTheWool: CaptureTheWoolComputed;
}
```

| Field                  | Formula / meaning                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `level`                | Whole Wool Games level: `floor(exactLevel)`, derived from `progression.experience` via the leveling curve above. |
| `exactLevel`           | Fractional Wool Games level from the same curve, rounded to 2 decimals.                                          |
| `levelProgressPercent` | Progress into the current level, 0 to 100: `percent(exactLevel - level, 1)`.                                     |
| `xpForNextLevel`       | XP still needed to reach the next whole level: `xpRequiredFor(level + 1) - experience`, floored at `0`.          |
| `woolWars`             | Wool Wars sub-game stats, see [`WoolWarsComputed`](#woolwarscomputed).                                           |
| `sheepWars`            | Sheep Wars sub-game stats, see [`SheepWarsComputed`](#sheepwarscomputed).                                        |
| `captureTheWool`       | Capture the Wool sub-game stats, see [`CaptureTheWoolComputed`](#capturethewoolcomputed).                        |

## `WoolWarsComputed`

Computed from `raw.woolWars.stats` and `raw.woolWars.classes`. Wool Wars has no raw losses counter, so losses are derived from games played minus wins.

```ts
export interface WoolWarsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly placeBreakRatio: number;
  readonly losses: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly assistsPerGame: number;
  readonly classes: Readonly<Record<string, WoolWarsClassComputed>>;
}
```

| Field             | Formula / meaning                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kdr`             | Kill/death ratio: `kills / deaths` (bare ratio; equals `kills` when `deaths` is `0`).                                                                  |
| `killsForNextKdr` | Kills needed to lift the KDR to the next whole number: `ceil((floor(kills / deaths) + 1) * deaths - kills)`, floored at `0`; `0` when `deaths` is `0`. |
| `placeBreakRatio` | Wool blocks placed per block broken: `woolPlaced / blocksBroken`.                                                                                      |
| `losses`          | Derived losses: `max(0, gamesPlayed - wins)`.                                                                                                          |
| `wlr`             | Win/loss ratio: `wins / losses` (using the derived `losses`).                                                                                          |
| `winRate`         | Wins per game played, as a bare ratio: `wins / gamesPlayed`.                                                                                           |
| `killsPerGame`    | `kills / gamesPlayed`.                                                                                                                                 |
| `assistsPerGame`  | `assists / gamesPlayed`.                                                                                                                               |
| `classes`         | One [`WoolWarsClassComputed`](#woolwarsclasscomputed) per class name in `raw.woolWars.classes`.                                                        |

## `WoolWarsClassComputed`

Per-class Wool Wars stats. `usageShare` is relative to overall Wool Wars games played.

```ts
export interface WoolWarsClassComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly placeBreakRatio: number;
  readonly usageShare: number;
}
```

| Field             | Formula / meaning                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `kdr`             | Class kill/death ratio: `kills / deaths`.                                                                                 |
| `killsForNextKdr` | Class kills needed to reach the next whole KDR (same rule as the overall field).                                          |
| `placeBreakRatio` | Class `woolPlaced / blocksBroken`.                                                                                        |
| `usageShare`      | Percentage (0 to 100) of overall Wool Wars games played on this class: `percent(class.gamesPlayed, overall.gamesPlayed)`. |

## `SheepWarsComputed`

Computed from `raw.sheepWars.stats`. Sheep Wars has a raw losses counter, so `wlr` uses it directly.

```ts
export interface SheepWarsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly damagePerGame: number;
  readonly killShareByMethod: SheepWarsKillShare;
}
```

| Field               | Formula / meaning                                                              |
| ------------------- | ------------------------------------------------------------------------------ |
| `kdr`               | `kills / deaths`.                                                              |
| `killsForNextKdr`   | Kills needed to reach the next whole KDR.                                      |
| `wlr`               | `wins / losses`.                                                               |
| `winRate`           | `wins / gamesPlayed` (bare ratio).                                             |
| `killsPerGame`      | `kills / gamesPlayed`.                                                         |
| `damagePerGame`     | `damageDealt / gamesPlayed`.                                                   |
| `killShareByMethod` | Breakdown of kills by method, see [`SheepWarsKillShare`](#sheepwarskillshare). |

## `SheepWarsKillShare`

Each field is the percentage (0 to 100) of total Sheep Wars kills scored with that method.

```ts
export interface SheepWarsKillShare {
  readonly void: number;
  readonly bow: number;
  readonly explosive: number;
  readonly melee: number;
}
```

| Field       | Formula / meaning                                                              |
| ----------- | ------------------------------------------------------------------------------ |
| `void`      | `percent(killsVoid, kills)`: share of kills by knocking players into the void. |
| `bow`       | `percent(killsBow, kills)`: share of bow kills.                                |
| `explosive` | `percent(killsExplosive, kills)`: share of explosive kills.                    |
| `melee`     | `percent(killsMelee, kills)`: share of melee kills.                            |

## `CaptureTheWoolComputed`

Computed from `raw.captureTheWool.stats`. The game total used by `winRate` and `goldPerGame` is `participatedWins + participatedLosses + participatedDraws`.

```ts
export interface CaptureTheWoolComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly kdrWithWool: number;
  readonly woolholderKdr: number;
  readonly woolCaptureStolenRatio: number;
  readonly winRate: number;
  readonly goldNet: number;
  readonly goldPerGame: number;
}
```

| Field                    | Formula / meaning                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `kdr`                    | `kills / deaths`.                                                                                                           |
| `killsForNextKdr`        | Kills needed to reach the next whole KDR.                                                                                   |
| `kdrWithWool`            | KDR while carrying wool: `killsWithWool / deathsWithWool`.                                                                  |
| `woolholderKdr`          | KDR against wool holders: `killsOnWoolholder / deathsToWoolholder`.                                                         |
| `woolCaptureStolenRatio` | Wools captured per wool stolen: `woolsCaptured / woolsStolen` (a measure of how often a steal is converted into a capture). |
| `winRate`                | `participatedWins / games` where `games = participatedWins + participatedLosses + participatedDraws` (bare ratio).          |
| `goldNet`                | Net gold: `goldEarned + goldSpent` (the raw `goldSpent` counter is added as-is by the source).                              |
| `goldPerGame`            | `goldEarned / games` using the same derived game total.                                                                     |

## `computeWoolGames`

```ts
export function computeWoolGames(raw: WoolGamesStats): WoolGamesComputed;
```

Takes the parsed `WoolGamesStats` from `@breezil/hypixel-parsers` and returns the full computed tree: level fields from `raw.progression.experience`, plus the three sub-game blocks computed from `raw.woolWars`, `raw.sheepWars`, and `raw.captureTheWool`.

