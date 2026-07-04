# SkyWars computed

Derived SkyWars statistics, attached as `.computed` on the raw `SkyWarsStats` parser block. It is always present (always-on), computed from the parsed stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `percent(part, whole)` yields a 0 to 100 value rounded to 2 decimals, with a zero whole yielding `0`. `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

## `SkyWarsComputed`

The root object returned by `computeSkyWars(raw: SkyWarsStats)`.

```ts
export interface SkyWarsComputed {
  readonly level: SkyWarsLevel;
  readonly xpForNextLevel: number;
  readonly levelFormatted: string;
  readonly weeklyKills: number;
  readonly monthlyKills: number;
  readonly lootBoxesTotal: number;
  readonly headsPerGame: number;
  readonly soulWellLegendaryRate: number;
  readonly soulWellRareRate: number;
  readonly soulsGatheredPerGame: number;
  readonly overall: SkyWarsModeComputed;
  readonly perMode: Readonly<Record<SkyWarsSubmode, SkyWarsModeComputed>>;
}
```

| Field                   | Formula / meaning                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level`                 | `skywarsLevel(experience)`: level object from the SkyWars XP curve. The first 19 levels use increasing per-level costs (0, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500 XP), after which every level costs a constant 5,000 XP, capped at level 10,000. See `SkyWarsLevel` below. |
| `xpForNextLevel`        | `max(0, level.required - level.currentXp)`: XP still needed to reach the next level (`0` at the level cap, where `required` is `0`).                                                                                                                                                                                                |
| `levelFormatted`        | The raw `levelFormatted` string cleaned of Minecraft formatting: `§l` becomes `**`, `§r` is removed, and color codes (`§0` to `§f`) are stripped.                                                                                                                                                                                   |
| `weeklyKills`           | The active one of the two oscillating weekly kill counters (`weeklyKillsA` / `weeklyKillsB`). Hypixel alternates the live bucket each week; the week parity is computed from the number of whole weeks since the oscillation epoch (timestamp `1417237200000`), odd weeks select `a`.                                               |
| `monthlyKills`          | The active one of `monthlyKillsA` / `monthlyKillsB`, selected by the current month's parity (odd zero-based month index selects `a`).                                                                                                                                                                                               |
| `lootBoxesTotal`        | `halloweenBoxes + christmasBoxes + lunarBoxes + easterBoxes`: total seasonal loot boxes.                                                                                                                                                                                                                                            |
| `headsPerGame`          | `ratio(headsCollected, overall.gamesPlayed)`: lifetime heads collected per game (top-level counter, distinct from the per-mode `headsPerGame`).                                                                                                                                                                                     |
| `soulWellLegendaryRate` | `ratio(soulWellLegendaries, soulWell)`: fraction of soul well uses that produced a legendary.                                                                                                                                                                                                                                       |
| `soulWellRareRate`      | `ratio(soulWellRares, soulWell)`: fraction of soul well uses that produced a rare.                                                                                                                                                                                                                                                  |
| `soulsGatheredPerGame`  | `ratio(soulsGathered, overall.gamesPlayed)`.                                                                                                                                                                                                                                                                                        |
| `overall`               | `SkyWarsModeComputed` for the overall (all modes combined) stat block.                                                                                                                                                                                                                                                              |
| `perMode`               | `SkyWarsModeComputed` for each submode: `solo`, `teams`, `mega`, `mini`, `ranked`, `lab`.                                                                                                                                                                                                                                           |

## `SkyWarsModeComputed`

Computed per stat block (overall and each submode).

```ts
export interface SkyWarsModeComputed {
  readonly winLossRatio: number;
  readonly winRate: number;
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly killsPerGame: number;
  readonly assistsPerGame: number;
  readonly bowAccuracy: number;
  readonly avgGameLength: number;
  readonly quitRate: number;
  readonly survivalEfficiency: number;
  readonly headsPerGame: number;
  readonly killShare: SkyWarsKillShare;
}
```

| Field                | Formula / meaning                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `winLossRatio`       | `ratio(wins, losses)` (WLR).                                                                    |
| `winRate`            | `ratio(wins, gamesPlayed)`: fraction of games won (0 to 1 scale).                               |
| `kdr`                | `ratio(kills.total, deaths)`.                                                                   |
| `killsForNextKdr`    | Kills needed, with zero further deaths, to reach the next whole KDR.                            |
| `winsForNextWlr`     | Wins needed, with zero further losses, to reach the next whole WLR.                             |
| `killsPerGame`       | `kills.total / gamesPlayed`.                                                                    |
| `assistsPerGame`     | `assists / gamesPlayed`.                                                                        |
| `bowAccuracy`        | `ratio(arrowsHit, arrowsShot)`: fraction of arrows that hit.                                    |
| `avgGameLength`      | `ratio(timePlayed, gamesPlayed)`: average time per game, in the unit `timePlayed` is stored in. |
| `quitRate`           | `ratio(quits, gamesPlayed)`: fraction of games quit.                                            |
| `survivalEfficiency` | `ratio(survivedPlayers, gamesPlayed)`: players outlived per game.                               |
| `headsPerGame`       | `heads.total / gamesPlayed` for this stat block.                                                |
| `killShare`          | Percentage breakdown of kills by cause, see `SkyWarsKillShare`.                                 |

## `SkyWarsKillShare`

```ts
export interface SkyWarsKillShare {
  readonly melee: number;
  readonly void: number;
  readonly bow: number;
  readonly mob: number;
  readonly fall: number;
}
```

Each field is a percentage (0 to 100) of the block's total kills (`kills.total`).

| Field   | Formula / meaning                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `melee` | `percent(kills.melee, kills.total)`.                                                                                        |
| `void`  | `percent(kills.void, kills.total)`: kills by knocking players into the void.                                                |
| `bow`   | `percent(kills.bow, kills.total)`.                                                                                          |
| `mob`   | `percent(kills.mob, kills.total)`.                                                                                          |
| `fall`  | `percent(fallKills, kills.total)` (fall kills are a separate counter on the mode block, not part of the `kills` breakdown). |

## `SkyWarsSubmode`

```ts
export type SkyWarsSubmode =
  | "solo"
  | "teams"
  | "mega"
  | "mini"
  | "ranked"
  | "lab";
```

The keys of `SkyWarsComputed.perMode`; each maps to a `SkyWarsModeComputed` for that submode.

## `SkyWarsLevel`

Re-exported from the shared leveling module and used as the type of `SkyWarsComputed.level`.

```ts
export interface SkyWarsLevel {
  readonly level: number;
  readonly currentXp: number;
  readonly required: number;
  readonly totalXp: number;
}
```

| Field       | Formula / meaning                                                                          |
| ----------- | ------------------------------------------------------------------------------------------ |
| `level`     | Whole SkyWars level from the XP curve described above (capped at 10,000).                  |
| `currentXp` | XP earned within the current level.                                                        |
| `required`  | XP the current level costs in total (`5000` in the constant region; `0` at the level cap). |
| `totalXp`   | The raw lifetime experience value.                                                         |

## `computeSkyWars`

```ts
export function computeSkyWars(raw: SkyWarsStats): SkyWarsComputed;
```

Builds the whole computed block from the parsed `SkyWarsStats`. The weekly and monthly oscillating counters are resolved against the current date at compute time.

