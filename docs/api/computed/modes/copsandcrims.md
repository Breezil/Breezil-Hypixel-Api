# Cops and Crims computed

Derived Cops and Crims statistics, attached as `.computed` on the raw `CopsAndCrimsStats` parser block. It is always present (always-on), computed from the parsed stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `percent(part, whole)` yields a 0 to 100 value rounded to 2 decimals, with a zero whole yielding `0`. `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

## `CopsAndCrimsComputed`

The root object returned by `computeCopsAndCrims(raw: CopsAndCrimsStats)`.

```ts
export interface CopsAndCrimsComputed {
  readonly weeklyKills: number;
  readonly monthlyKills: number;
  readonly favoriteMap: string;
  readonly overall: CopsAndCrimsOverallComputed;
  readonly deathmatch: CopsAndCrimsRecord;
  readonly gungame: CopsAndCrimsRecord;
  readonly guns: Readonly<Record<string, CopsAndCrimsGunComputed>>;
}
```

| Field          | Formula / meaning                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `weeklyKills`  | The active one of the two oscillating weekly kill counters (`weeklyKillsA` / `weeklyKillsB`). Hypixel alternates the live bucket each week; the week parity is computed from the number of whole weeks since the oscillation epoch (timestamp `1417237200000`), odd weeks select `a`. |
| `monthlyKills` | The active one of `monthlyKillsA` / `monthlyKillsB`, selected by the current month's parity (odd zero-based month index selects `a`).                                                                                                                                                 |
| `favoriteMap`  | The map with the most wins in `winsByMap`; `""` if no map has more than 0 wins.                                                                                                                                                                                                       |
| `overall`      | Overall (Defusal) computed record plus extra per-game stats, from the top-level counters.                                                                                                                                                                                             |
| `deathmatch`   | `CopsAndCrimsRecord` from the Deathmatch mode counters.                                                                                                                                                                                                                               |
| `gungame`      | `CopsAndCrimsRecord` from the Gun Game mode counters.                                                                                                                                                                                                                                 |
| `guns`         | Per-gun headshot ratios, keyed by gun name. The eleven guns covered are `smg`, `rifle`, `carbine`, `magnum`, `shotgun`, `sniper`, `scopedRifle`, `autoShotgun`, `bullpup`, `handgun`, `pistol`.                                                                                       |

## `CopsAndCrimsRecord`

The base win/kill record, computed from `kills`, `deaths`, `wins`, and `gamePlays`.

```ts
export interface CopsAndCrimsRecord {
  readonly losses: number;
  readonly KDR: number;
  readonly killsForNextKdr: number;
  readonly WLR: number;
  readonly winsForNextWlr: number;
  readonly winRate: number;
}
```

| Field             | Formula / meaning                                                              |
| ----------------- | ------------------------------------------------------------------------------ |
| `losses`          | `gamePlays - wins`: the parser exposes no loss counter, so losses are derived. |
| `KDR`             | `ratio(kills, deaths)`.                                                        |
| `killsForNextKdr` | Kills needed, with zero further deaths, to reach the next whole KDR.           |
| `WLR`             | `ratio(wins, losses)` with the derived losses.                                 |
| `winsForNextWlr`  | Wins needed, with zero further losses, to reach the next whole WLR.            |
| `winRate`         | `ratio(wins, gamePlays)`: fraction of games won (0 to 1 scale).                |

## `CopsAndCrimsOverallComputed`

```ts
export interface CopsAndCrimsOverallComputed extends CopsAndCrimsRecord {
  readonly criminalKillShare: number;
  readonly shotsFiredPerKill: number;
  readonly bombsDefusedPerGame: number;
  readonly bombsPlantedPerGame: number;
  readonly roundWinsPerGame: number;
  readonly assistsPerGame: number;
}
```

| Field                 | Formula / meaning                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `criminalKillShare`   | `percent(criminalKills, criminalKills + copKills)`: percentage of side-attributed kills made while playing Criminal (0 to 100). |
| `shotsFiredPerKill`   | `ratio(shotsFired, kills)`.                                                                                                     |
| `bombsDefusedPerGame` | `bombsDefused / gamePlays`.                                                                                                     |
| `bombsPlantedPerGame` | `bombsPlanted / gamePlays`.                                                                                                     |
| `roundWinsPerGame`    | `roundWins / gamePlays`.                                                                                                        |
| `assistsPerGame`      | `assists / gamePlays`.                                                                                                          |
| (inherited)           | All `CopsAndCrimsRecord` fields, from the top-level `kills`, `deaths`, `wins`, `gamePlays`.                                     |

## `CopsAndCrimsGunComputed`

```ts
export interface CopsAndCrimsGunComputed {
  readonly headshotRatio: number;
}
```

| Field           | Formula / meaning                                                                    |
| --------------- | ------------------------------------------------------------------------------------ |
| `headshotRatio` | `ratio(gun.headshots, gun.kills)`: fraction of this gun's kills that were headshots. |

## `computeCopsAndCrims`

```ts
export function computeCopsAndCrims(
  raw: CopsAndCrimsStats,
): CopsAndCrimsComputed;
```

Builds the whole computed block from the parsed `CopsAndCrimsStats`. The weekly and monthly oscillating counters are resolved against the current date at compute time.

