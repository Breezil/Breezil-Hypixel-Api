# SkyClash

The SkyClash module exposes a single parser, `parseSkyClash`, which mirrors the raw `stats.SkyClash` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals. SkyClash is a retired mode, but it is still typed here because old players retain the data.

## parseSkyClash

Parses a player's SkyClash stats (`stats.SkyClash`) into a typed object.

```ts
function parseSkyClash(block: Record<string, unknown>): SkyClashStats | null;
```

### Null / empty behavior

`parseSkyClash` returns `null` when the raw block has no keys (empty or absent). Otherwise it returns a fully-populated `SkyClashStats` object, with missing values filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- The `packages` string-array field becomes an empty array (`[]`) when absent.

The dynamic maps (`classes`, `modes`, `perKit`, `kitMastery`, `kitInventories`, `perkCards`, `perkOutcomes`, `perkChallengeWins`, `mapVotes`, `autoEquipArmor`) are reconstructed by pattern-matching the raw key names, and contain only the keys present in the raw data, so any may be empty.

---

## Returned type tree

### SkyClashStats

The root object returned by `parseSkyClash`.

```ts
interface SkyClashStats {
  readonly coins: number;
  readonly games: number;
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly losses: number;
  readonly quits: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cardPacks: number;
  readonly classesUnlocked: number;
  readonly activeClass: number;
  readonly highestKillstreak: number;
  readonly killstreak: number;
  readonly playStreak: number;
  readonly playstreak: number;
  readonly winStreak: number;
  readonly bowHits: number;
  readonly bowShots: number;
  readonly bowKills: number;
  readonly meleeKills: number;
  readonly voidKills: number;
  readonly mobKills: number;
  readonly mobsKilled: number;
  readonly mobsSpawned: number;
  readonly longestBowKill: number;
  readonly longestBowShot: number;
  readonly mostKillsGame: number;
  readonly cutePantsFound: number;
  readonly spawnAtWitch: number;
  readonly enderchestsOpened: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
  readonly packages: readonly string[];
  readonly classes: Readonly<Record<string, string>>;
  readonly modes: Readonly<Record<string, SkyClashModeStats>>;
  readonly perKit: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly kitMastery: Readonly<Record<string, SkyClashKitMastery>>;
  readonly kitInventories: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly perkCards: Readonly<Record<string, SkyClashPerkCard>>;
  readonly perkOutcomes: Readonly<Record<string, SkyClashPerkOutcomes>>;
  readonly perkChallengeWins: Readonly<
    Record<string, Readonly<Record<string, number>>>
  >;
  readonly mapVotes: Readonly<Record<string, number>>;
  readonly autoEquipArmor: Readonly<Record<string, boolean>>;
}
```

| Field           | Notes                                                   |
| --------------- | ------------------------------------------------------- |
| `playStreak`    | Raw `play_streak`.                                      |
| `playstreak`    | Raw `playstreak` (separate raw key from `play_streak`). |
| `monthlyKillsA` | Raw `kills_monthly_a`.                                  |
| `monthlyKillsB` | Raw `kills_monthly_b`.                                  |
| `weeklyKillsA`  | Raw `kills_weekly_a`.                                   |
| `weeklyKillsB`  | Raw `kills_weekly_b`.                                   |

---

## Nested stat types

### SkyClashModeStats

One entry per mode in the `modes` map. Modes are discovered by scanning keys matching `<mode>_wins`, `wins|losses|kills|deaths_<mode>`, and `fastest_win_<mode>`, excluding perk/kit/rolling-window keys.

```ts
interface SkyClashModeStats {
  readonly wins: number;
  readonly legacyWins: number;
  readonly losses: number;
  readonly kills: number;
  readonly deaths: number;
  readonly fastestWin: number;
}
```

| Field        | Notes                     |
| ------------ | ------------------------- |
| `wins`       | Raw `wins_<mode>`.        |
| `legacyWins` | Raw `<mode>_wins`.        |
| `losses`     | Raw `losses_<mode>`.      |
| `kills`      | Raw `kills_<mode>`.       |
| `deaths`     | Raw `deaths_<mode>`.      |
| `fastestWin` | Raw `fastest_win_<mode>`. |

### SkyClashKitMastery

One entry per kit in the `kitMastery` map, keyed by kit name from raw keys `kit_<name>_master` / `kit_<name>_minor`.

```ts
interface SkyClashKitMastery {
  readonly master: number;
  readonly minor: number;
}
```

### SkyClashPerkCard

One entry per perk in the `perkCards` map, keyed by perk name. Built from raw keys `perk_<name>` (level), `perk_<name>_duplicates`, and `perk_<name>_new`.

```ts
interface SkyClashPerkCard {
  readonly level: number;
  readonly duplicates: number;
  readonly new: boolean;
}
```

### SkyClashPerkOutcomes

One entry per perk in the `perkOutcomes` map, keyed by perk name from raw keys `wins|losses|kills|deaths_perk_<name>`.

```ts
interface SkyClashPerkOutcomes {
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
  readonly deaths: number;
}
```

---

## Dynamic maps

| Field               | Type                                     | Source key pattern                                                          |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `classes`           | `Record<string, string>`                 | `class_<name>` -> value, keyed by `<name>`                                  |
| `modes`             | `Record<string, SkyClashModeStats>`      | discovered mode names (see above)                                           |
| `perKit`            | `Record<string, Record<string, number>>` | `<stat>_kit_<kit>`, outer key `<kit>`, inner key `<stat>`                   |
| `kitMastery`        | `Record<string, SkyClashKitMastery>`     | `kit_<name>_master` / `kit_<name>_minor`                                    |
| `kitInventories`    | `Record<string, Record<string, string>>` | `<name>_inventory` object, keyed by `<name>`; inner item-to-slot string map |
| `perkCards`         | `Record<string, SkyClashPerkCard>`       | `perk_<name>[_duplicates\|_new]`                                            |
| `perkOutcomes`      | `Record<string, SkyClashPerkOutcomes>`   | `wins\|losses\|kills\|deaths_perk_<name>`                                   |
| `perkChallengeWins` | `Record<string, Record<string, number>>` | `<a>_wins_perk_<b>`, outer key `<a>`, inner key `<b>`                       |
| `mapVotes`          | `Record<string, number>`                 | `votes_<map>`, keyed by `<map>`                                             |
| `autoEquipArmor`    | `Record<string, boolean>`                | `<name>_inventory_auto_equip_armor`, keyed by `<name>`                      |

Keys within these maps are preserved verbatim from the raw key segments (not camel-cased).
