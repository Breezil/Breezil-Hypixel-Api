# Arena Brawl

The Arena Brawl module exposes a single parser, `parseArenaBrawl`, which mirrors the raw `stats.Arena` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseArenaBrawl

Parses a player's Arena Brawl stats (`stats.Arena`) into a typed object.

```ts
function parseArenaBrawl(
  stats: Record<string, unknown>,
): ArenaBrawlStats | null;
```

### Null / empty behavior

`parseArenaBrawl` returns `null` when `stats.Arena` is missing or is not a plain object (i.e. it is absent, `null`, or an array). Otherwise it always returns a fully-populated `ArenaBrawlStats` object filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- `coins` reads `coins`, falling back to `tokens` when `coins` is `0`/absent.
- `packages` becomes an empty array (`[]`) when absent or not an array, keeping only string entries.
- The dynamic maps (`runes`, `datedRatings`) contain only the keys discovered in the raw data, so they may be empty objects when no matching keys exist.

---

## Returned type tree

### ArenaBrawlStats

The root object returned by `parseArenaBrawl`.

```ts
interface ArenaBrawlStats {
  readonly coins: number;
  readonly coinsSpent: number;
  readonly wins: number;
  readonly keys: number;
  readonly chests: number;
  readonly rating: number;
  readonly penalty: number;
  readonly chestOpens: number;
  readonly damageError: number;
  readonly damageTakenError: number;
  readonly healError: number;
  readonly combatTracker: boolean;
  readonly hat: string;
  readonly selectedSword: string;
  readonly activeRune: string;
  readonly activeKillEffect: string;
  readonly activeMeleeTrail: string;
  readonly prefixColor: string;
  readonly shortenedPrefix: boolean;
  readonly showWinPrefix: boolean;
  readonly pregameArmor: boolean;
  readonly packages: readonly string[];
  readonly runes: Readonly<Record<string, number>>;
  readonly datedRatings: Readonly<Record<string, ArenaBrawlDatedRating>>;
  readonly upgrades: ArenaBrawlUpgradeLevels;
  readonly abilities: ArenaBrawlAbilities;
  readonly classes: ArenaBrawlClasses;
  readonly modes: Readonly<Record<ArenaBrawlModeId, ArenaBrawlModeStats>>;
}
```

| Field              | Type                                                      | Raw source / notes                                                                        |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `coins`            | `number`                                                  | Reads `coins`, falling back to `tokens` when `coins` is `0`/absent.                       |
| `coinsSpent`       | `number`                                                  | `coins_spent`                                                                             |
| `wins`             | `number`                                                  | `wins`                                                                                    |
| `keys`             | `number`                                                  | `keys`                                                                                    |
| `chests`           | `number`                                                  | `magical_chest`                                                                           |
| `rating`           | `number`                                                  | `rating`                                                                                  |
| `penalty`          | `number`                                                  | `penalty`                                                                                 |
| `chestOpens`       | `number`                                                  | `chest_opens`                                                                             |
| `damageError`      | `number`                                                  | `damage_error`                                                                            |
| `damageTakenError` | `number`                                                  | `damage_taken_error`                                                                      |
| `healError`        | `number`                                                  | `heal_error`                                                                              |
| `combatTracker`    | `boolean`                                                 | `combatTracker`                                                                           |
| `hat`              | `string`                                                  | `hat`                                                                                     |
| `selectedSword`    | `string`                                                  | `selected_sword`                                                                          |
| `activeRune`       | `string`                                                  | `active_rune`                                                                             |
| `activeKillEffect` | `string`                                                  | `active_kill_effect`                                                                      |
| `activeMeleeTrail` | `string`                                                  | `active_melee_trail`                                                                      |
| `prefixColor`      | `string`                                                  | `prefix_color`                                                                            |
| `shortenedPrefix`  | `boolean`                                                 | `shortened_prefix`                                                                        |
| `showWinPrefix`    | `boolean`                                                 | `show_win_prefix`                                                                         |
| `pregameArmor`     | `boolean`                                                 | `pregame_armor`                                                                           |
| `packages`         | `readonly string[]`                                       | `packages` array, filtered to string entries; empty array when absent or not an array.    |
| `runes`            | `Readonly<Record<string, number>>`                        | All numeric keys prefixed with `rune_`, with the prefix stripped from the key.            |
| `datedRatings`     | `Readonly<Record<string, ArenaBrawlDatedRating>>`         | Keyed by date string, built from `Arena_arena_rating_<date>_rating` and `_position` keys. |
| `upgrades`         | `ArenaBrawlUpgradeLevels`                                 | See below.                                                                                |
| `abilities`        | `ArenaBrawlAbilities`                                     | See below.                                                                                |
| `classes`          | `ArenaBrawlClasses`                                       | See below.                                                                                |
| `modes`            | `Readonly<Record<ArenaBrawlModeId, ArenaBrawlModeStats>>` | Per-mode stats keyed by mode id.                                                          |

### ArenaBrawlModeId

The mode keys present in `modes` are a fixed set. This type is internal (not exported); `modes` always contains an entry for each of the four ids.

```ts
type ArenaBrawlModeId = "ffa" | "1v1" | "2v2" | "4v4";
```

### ArenaBrawlModeStats

Per-mode stats, where each field reads the raw key suffixed with the mode id (for example `damage_1v1`, `win_streaks_2v2`).

```ts
interface ArenaBrawlModeStats {
  readonly damage: number;
  readonly kills: number;
  readonly deaths: number;
  readonly healed: number;
  readonly wins: number;
  readonly losses: number;
  readonly games: number;
  readonly winStreak: number;
}
```

| Field       | Raw source           |
| ----------- | -------------------- |
| `damage`    | `damage_<mode>`      |
| `kills`     | `kills_<mode>`       |
| `deaths`    | `deaths_<mode>`      |
| `healed`    | `healed_<mode>`      |
| `wins`      | `wins_<mode>`        |
| `losses`    | `losses_<mode>`      |
| `games`     | `games_<mode>`       |
| `winStreak` | `win_streaks_<mode>` |

### ArenaBrawlUpgradeLevels

Upgrade levels, read from `lvl_*` keys.

```ts
interface ArenaBrawlUpgradeLevels {
  readonly cooldown: number;
  readonly damage: number;
  readonly energy: number;
  readonly health: number;
}
```

| Field      | Raw source     |
| ---------- | -------------- |
| `cooldown` | `lvl_cooldown` |
| `damage`   | `lvl_damage`   |
| `energy`   | `lvl_energy`   |
| `health`   | `lvl_health`   |

### ArenaBrawlAbilities

Selected ability slots, read directly from their named keys.

```ts
interface ArenaBrawlAbilities {
  readonly offensive: string;
  readonly support: string;
  readonly utility: string;
  readonly ultimate: string;
}
```

| Field       | Raw source  |
| ----------- | ----------- |
| `offensive` | `offensive` |
| `support`   | `support`   |
| `utility`   | `utility`   |
| `ultimate`  | `ultimate`  |

### ArenaBrawlClasses

Per-class loadout configuration.

```ts
interface ArenaBrawlClasses {
  readonly mage: ArenaBrawlMageClass;
  readonly paladin: ArenaBrawlPaladinClass;
  readonly warrior: ArenaBrawlWarriorClass;
}
```

### ArenaBrawlMageClass

```ts
interface ArenaBrawlMageClass {
  readonly spec: string;
  readonly skill1: string;
  readonly skill2: string;
  readonly skill3: string;
  readonly skill4: string;
}
```

| Field    | Raw source    |
| -------- | ------------- |
| `spec`   | `mage_spec`   |
| `skill1` | `mage_skill1` |
| `skill2` | `mage_skill2` |
| `skill3` | `mage_skill3` |
| `skill4` | `mage_skill4` |

### ArenaBrawlPaladinClass

```ts
interface ArenaBrawlPaladinClass {
  readonly spec: string;
  readonly cooldown: string;
  readonly critChance: string;
  readonly critMultiplier: string;
  readonly energy: string;
  readonly health: string;
}
```

| Field            | Raw source               |
| ---------------- | ------------------------ |
| `spec`           | `paladin_spec`           |
| `cooldown`       | `paladin_cooldown`       |
| `critChance`     | `paladin_critchance`     |
| `critMultiplier` | `paladin_critmultiplier` |
| `energy`         | `paladin_energy`         |
| `health`         | `paladin_health`         |

### ArenaBrawlWarriorClass

```ts
interface ArenaBrawlWarriorClass {
  readonly spec: string;
}
```

| Field  | Raw source     |
| ------ | -------------- |
| `spec` | `warrior_spec` |

### ArenaBrawlDatedRating

A single dated rating snapshot, keyed by date within `datedRatings`.

```ts
interface ArenaBrawlDatedRating {
  readonly rating: number;
  readonly position: number;
}
```

| Field      | Raw source                           |
| ---------- | ------------------------------------ |
| `rating`   | `Arena_arena_rating_<date>_rating`   |
| `position` | `Arena_arena_rating_<date>_position` |

Each entry defaults missing `rating` or `position` to `0`. The `datedRatings` map is empty when no matching keys are present.
