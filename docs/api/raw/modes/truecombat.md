# TrueCombat

The TrueCombat module exposes a single parser, `parseTrueCombat`, which mirrors the raw `stats.TrueCombat` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals. TrueCombat is the retired "Crazy Walls" mode, but it is still typed here because old players retain the data.

## parseTrueCombat

Parses a player's TrueCombat ("Crazy Walls") stats into a typed object.

```ts
function parseTrueCombat(
  block: Record<string, unknown>,
): TrueCombatStats | null;
```

### Null / empty behavior

`parseTrueCombat` returns `null` when the raw block is not an object, is `null`, or has no keys. Otherwise it returns a fully-populated `TrueCombatStats` object, with missing values filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- The `packages` string-array field becomes an empty array (`[]`) when absent.

The dynamic maps (`crazyWalls`, `activeKits`, `kits`, `crafting`, `votes`, `shopItems`, `soloPerks`, `teamPerks`, `perks`) are reconstructed from the raw key names and contain only the keys present in the raw data, so any may be empty.

---

## Returned type tree

### TrueCombatStats

The root object returned by `parseTrueCombat`.

```ts
interface TrueCombatStats {
  readonly coins: number;
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly deaths: number;
  readonly kills: number;
  readonly winStreak: number;
  readonly survivedPlayers: number;
  readonly skullsGathered: number;
  readonly goldDust: number;
  readonly goldenSkulls: number;
  readonly itemsEnchanted: number;
  readonly arrowsHit: number;
  readonly arrowsShot: number;
  readonly giantZombie: number;
  readonly giantZombieLegendaries: number;
  readonly giantZombieRares: number;
  readonly liveCombat: boolean;
  readonly combatTracker: boolean;
  readonly showNoobHolograms: boolean;
  readonly killsRolling: TrueCombatRolling;
  readonly packages: readonly string[];
  readonly crazyWalls: Readonly<Record<string, TrueCombatModeStats>>;
  readonly activeKits: Readonly<Record<string, string>>;
  readonly kits: Readonly<Record<string, number>>;
  readonly crafting: Readonly<Record<string, number>>;
  readonly votes: Readonly<Record<string, number>>;
  readonly shopItems: Readonly<Record<string, number>>;
  readonly soloPerks: Readonly<Record<string, number>>;
  readonly teamPerks: Readonly<Record<string, number>>;
  readonly perks: Readonly<Record<string, number>>;
}
```

| Field          | Notes                                                              |
| -------------- | ------------------------------------------------------------------ |
| `winStreak`    | Raw `win_streak`.                                                  |
| `killsRolling` | Root-level rolling-window kill counters (`kills_monthly_a`, etc.). |
| `crazyWalls`   | Per-mode Crazy Walls stats, keyed by mode name.                    |

---

## Nested stat types

### TrueCombatRolling

Root-level rolling kill counters, read from `kills_monthly_a`, `kills_monthly_b`, `kills_weekly_a`, `kills_weekly_b`.

```ts
interface TrueCombatRolling {
  readonly monthlyA: number;
  readonly monthlyB: number;
  readonly weeklyA: number;
  readonly weeklyB: number;
}
```

### TrueCombatModeStats

One entry per mode in the `crazyWalls` map, keyed by mode name. Modes are discovered from raw keys of the form `crazywalls_<stat>_<mode>`, where `<stat>` is one of `kills_monthly_a`, `kills_monthly_b`, `kills_weekly_a`, `kills_weekly_b`, `deaths`, `games`, `kills`, `losses`, `wins`.

```ts
interface TrueCombatModeStats {
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly deaths: number;
  readonly kills: number;
  readonly killsMonthlyA: number;
  readonly killsMonthlyB: number;
  readonly killsWeeklyA: number;
  readonly killsWeeklyB: number;
}
```

| Field           | Notes                                    |
| --------------- | ---------------------------------------- |
| `games`         | Raw `crazywalls_games_<mode>`.           |
| `wins`          | Raw `crazywalls_wins_<mode>`.            |
| `losses`        | Raw `crazywalls_losses_<mode>`.          |
| `deaths`        | Raw `crazywalls_deaths_<mode>`.          |
| `kills`         | Raw `crazywalls_kills_<mode>`.           |
| `killsMonthlyA` | Raw `crazywalls_kills_monthly_a_<mode>`. |
| `killsMonthlyB` | Raw `crazywalls_kills_monthly_b_<mode>`. |
| `killsWeeklyA`  | Raw `crazywalls_kills_weekly_a_<mode>`.  |
| `killsWeeklyB`  | Raw `crazywalls_kills_weekly_b_<mode>`.  |

---

## Dynamic family maps

The remaining maps group raw keys by prefix. For every prefixed map, the key segment after the prefix is camel-cased to form the map key, and only matching-typed values are kept.

| Field        | Type                     | Source key pattern                                                                                                                                                                                                               |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeKits` | `Record<string, string>` | `activeKit_<rest>` (string values)                                                                                                                                                                                               |
| `kits`       | `Record<string, number>` | `kit_<rest>` (number values)                                                                                                                                                                                                     |
| `crafting`   | `Record<string, number>` | `crafting_<rest>` (number values)                                                                                                                                                                                                |
| `votes`      | `Record<string, number>` | `votes_<rest>` (number values)                                                                                                                                                                                                   |
| `shopItems`  | `Record<string, number>` | `shopItem_<rest>` (number values)                                                                                                                                                                                                |
| `soloPerks`  | `Record<string, number>` | `solo_<rest>` (number values)                                                                                                                                                                                                    |
| `teamPerks`  | `Record<string, number>` | `team_<rest>` (number values)                                                                                                                                                                                                    |
| `perks`      | `Record<string, number>` | any remaining numeric key that is not a scalar field and does not start with one of the family prefixes (`crazywalls_`, `activeKit_`, `kit_`, `crafting_`, `votes_`, `shopItem_`, `solo_`, `team_`); the full key is camel-cased |

Map keys are camel-cased (the source splits on `_`/`-` and camel-joins the segments).
