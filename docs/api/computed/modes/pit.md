# Pit computed

Derived Pit statistics, attached as `.computed` on the raw `PitStats` parser block. It is always present (always-on), computed from the parsed profile and combat stats alone.

All ratios use the shared `ratio(a, b)` helper: the result is rounded to 2 decimals, and a zero denominator yields the numerator (K/D convention). `percent(part, whole)` yields a 0 to 100 value rounded to 2 decimals, with a zero whole yielding `0`. `neededForNextWholeRatio(n, d)` is the extra numerator needed, with the denominator unchanged, to reach the next whole ratio `floor(n / d) + 1` (it is `0` when the denominator is `0`).

## Leveling model

The Pit prestige is the `index` of the last entry in `profile.prestiges` (or `0` with no prestiges). Levels within a prestige are computed from the prestige-adjusted XP (total XP minus the cumulative XP consumed by earlier prestiges). Level costs come from a per-10-level block table (15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500 XP per level) multiplied by the prestige's XP multiplier (1x at prestige 0, up to 100,000x at prestige 50), with a level cap of 120.

## `PitComputed`

The root object returned by `computePit(raw: PitStats)`.

```ts
export interface PitComputed {
  readonly level: number;
  readonly prestige: number;
  readonly xpForNextLevel: number;
  readonly xpForNextPrestige: number;
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly kda: number;
  readonly playtimeSeconds: number;
  readonly damageRatio: number;
  readonly meleeAccuracy: number;
  readonly meleeDamageRatio: number;
  readonly bowAccuracy: number;
  readonly bowDamageRatio: number;
  readonly killsPerGame: number;
  readonly killsPerHour: number;
  readonly xpPerHour: number;
  readonly goldPerHour: number;
  readonly meleeDamageShare: number;
  readonly contractCompletionRate: number;
  readonly avgGameLengthMinutes: number;
  readonly damagePerKill: number;
  readonly launchedTotal: number;
}
```

| Field                    | Formula / meaning                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `level`                  | Level within the current prestige from the XP curve described above (0 to 120).                                                         |
| `prestige`               | The `index` of the last entry in `profile.prestiges`, `0` if the player never prestiged.                                                |
| `xpForNextLevel`         | `ceil(xp needed to reach level + 1 - prestige-adjusted XP)`, using the current prestige's multiplied level costs; `0` at level 120.     |
| `xpForNextPrestige`      | `max(0, prestige target sumXp - total XP)`: total XP still needed to be able to prestige again (`0` past the last prestige).            |
| `kdr`                    | `ratio(combat.kills, combat.deaths)`.                                                                                                   |
| `killsForNextKdr`        | Kills needed, with zero further deaths, to reach the next whole KDR.                                                                    |
| `kda`                    | `ratio(kills + assists, deaths)`.                                                                                                       |
| `playtimeSeconds`        | `combat.playtimeMinutes * 60`.                                                                                                          |
| `damageRatio`            | `ratio(damageDealt, damageReceived)`.                                                                                                   |
| `meleeAccuracy`          | `ratio(swordHits, leftClicks)`: fraction of left clicks that landed a sword hit.                                                        |
| `meleeDamageRatio`       | `ratio(meleeDamageDealt, meleeDamageReceived)`.                                                                                         |
| `bowAccuracy`            | `ratio(arrowHits, arrowsFired)`.                                                                                                        |
| `bowDamageRatio`         | `ratio(bowDamageDealt, bowDamageReceived)`.                                                                                             |
| `killsPerGame`           | `kills / joins`: kills per Pit join.                                                                                                    |
| `killsPerHour`           | `ratio(kills, playtimeMinutes / 60)`.                                                                                                   |
| `xpPerHour`              | `ratio(profile.xp, playtimeMinutes / 60)`: lifetime XP over lifetime hours.                                                             |
| `goldPerHour`            | `ratio(cashEarned, playtimeMinutes / 60)`.                                                                                              |
| `meleeDamageShare`       | `percent(meleeDamageDealt, meleeDamageDealt + bowDamageDealt)`: percentage of dealt melee-plus-bow damage that was melee (0 to 100).    |
| `contractCompletionRate` | `ratio(contractsCompleted, contractsStarted)`.                                                                                          |
| `avgGameLengthMinutes`   | `playtimeMinutes / joins`: average minutes per Pit session.                                                                             |
| `damagePerKill`          | `ratio(damageDealt, kills)`.                                                                                                            |
| `launchedTotal`          | `launchedByLaunchers + launchedByAngelSpawn + launchedByDemonSpawn`: total times launched into the air by map launchers and spawn pads. |

## `computePit`

```ts
export function computePit(raw: PitStats): PitComputed;
```

Builds the whole computed block from the parsed `PitStats` (`raw.profile` for leveling, `raw.combat` for everything else).

