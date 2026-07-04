# UHC

The UHC module exposes a single parser, `parseUHC`, which mirrors the raw `stats.UHC` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseUHC

Parses a player's UHC stats (`stats.UHC`) into a typed object.

```ts
function parseUHC(stats: Record<string, unknown>): UHCStats | null;
```

### Null / empty behavior

`parseUHC` returns `null` when `stats.UHC` is absent, is not an object, or is an array. Otherwise it returns a fully-populated `UHCStats` object built with the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- `packages` becomes an empty array (`[]`) when the raw value is missing or not an array (only string entries are kept).

The dynamic maps (`perks`, `kits`, `monthly`) are collected by scanning the raw block for numeric keys that start with the respective prefix, so they may be empty objects when no matching keys exist.

---

## Returned type tree

### UHCStats

The root object returned by `parseUHC`.

```ts
interface UHCStats {
  readonly coins: number;
  readonly score: number;
  readonly customLevel: number;
  readonly equippedKit: string;
  readonly clearupAchievement: boolean;
  readonly cache3: boolean;
  readonly combatTracker: boolean;
  readonly craftingPromptDisabled: boolean;
  readonly savedStats: boolean;
  readonly teammateDamage: boolean;
  readonly uhcParkour1: boolean;
  readonly uhcParkour2: boolean;
  readonly uhcShowQueueBook: boolean;
  readonly uhcStarDisplay: boolean;
  readonly perks: Readonly<Record<string, number>>;
  readonly kits: Readonly<Record<string, number>>;
  readonly monthly: Readonly<Record<string, number>>;
  readonly packages: readonly string[];
  readonly leaderboardSettings: UHCLeaderboardSettings;
  readonly privateGames: UHCPrivateGames;
  readonly solo: UHCModeStats;
  readonly team: UHCModeStats;
  readonly redVsBlue: UHCModeStats;
  readonly noDiamonds: UHCModeStats;
  readonly vanillaDoubles: UHCModeStats;
  readonly brawl: UHCModeStats;
  readonly soloBrawl: UHCModeStats;
  readonly duoBrawl: UHCModeStats;
}
```

| Field                    | Notes                                                             |
| ------------------------ | ----------------------------------------------------------------- |
| `coins`                  | Raw `coins`.                                                      |
| `score`                  | Raw `score`.                                                      |
| `customLevel`            | Raw `custom_level`.                                               |
| `equippedKit`            | Raw `equippedKit`; falls back to `"None"` when empty.             |
| `clearupAchievement`     | Raw `clearup_achievement`.                                        |
| `cache3`                 | Raw `cache3`.                                                     |
| `combatTracker`          | Raw `combatTracker`.                                              |
| `craftingPromptDisabled` | Raw `crafting_prompt_disabled`.                                   |
| `savedStats`             | Raw `saved_stats`.                                                |
| `teammateDamage`         | Raw `teammate_damage`.                                            |
| `uhcParkour1`            | Raw `uhc_parkour_1`.                                              |
| `uhcParkour2`            | Raw `uhc_parkour_2`.                                              |
| `uhcShowQueueBook`       | Raw `uhc_showqueuebook`.                                          |
| `uhcStarDisplay`         | Raw `uhc_star_display`.                                           |
| `perks`                  | All numeric keys prefixed with `perk_`, keyed by the full key.    |
| `kits`                   | All numeric keys prefixed with `kit_`, keyed by the full key.     |
| `monthly`                | All numeric keys prefixed with `monthly_`, keyed by the full key. |
| `solo`                   | Mode suffix `_solo`.                                              |
| `team`                   | No suffix.                                                        |
| `redVsBlue`              | Mode suffix `_red_vs_blue`.                                       |
| `noDiamonds`             | Mode suffix `_no_diamonds`.                                       |
| `vanillaDoubles`         | Mode suffix `_vanilla_doubles`.                                   |
| `brawl`                  | Mode suffix `_brawl`.                                             |
| `soloBrawl`              | Mode suffix `_solo_brawl`.                                        |
| `duoBrawl`               | Mode suffix `_duo_brawl`.                                         |

Note: the `perks`, `kits`, and `monthly` maps keep the full raw key (including its prefix) as the map key.

---

## Per-mode stat types

### UHCModeStats

Per-mode statistics. Each mode reads the base keys below with its mode-specific suffix appended (the `team` mode uses no suffix).

```ts
interface UHCModeStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly headsEaten: number;
  readonly ultimatesCrafted: number;
  readonly extraUltimatesCrafted: number;
  readonly kills2: number;
  readonly wins2: number;
}
```

| Field                   | Raw key                           |
| ----------------------- | --------------------------------- |
| `wins`                  | `wins{suffix}`                    |
| `kills`                 | `kills{suffix}`                   |
| `deaths`                | `deaths{suffix}`                  |
| `headsEaten`            | `heads_eaten{suffix}`             |
| `ultimatesCrafted`      | `ultimates_crafted{suffix}`       |
| `extraUltimatesCrafted` | `extra_ultimates_crafted{suffix}` |
| `kills2`                | `kills{suffix}2`                  |
| `wins2`                 | `wins{suffix}2`                   |

---

## Settings

### UHCLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface UHCLeaderboardSettings {
  readonly resetType: string;
  readonly suhcMode: string;
  readonly uhcMode: string;
}
```

| Field       | Raw key     |
| ----------- | ----------- |
| `resetType` | `resetType` |
| `suhcMode`  | `suhcMode`  |
| `uhcMode`   | `uhcMode`   |

### UHCPrivateGames

Read from the raw `privategames` object.

```ts
interface UHCPrivateGames {
  readonly allRecipes: boolean;
  readonly disableRecipes: boolean;
  readonly infiniteCrafts: boolean;
  readonly borderShrink: string;
  readonly gameLength: string;
  readonly gameModifiers: string;
  readonly gracePeriod: string;
  readonly health: string;
  readonly mode: string;
  readonly teamSize: string;
}
```

| Field            | Raw key           |
| ---------------- | ----------------- |
| `allRecipes`     | `all_recipes`     |
| `disableRecipes` | `disable_recipes` |
| `infiniteCrafts` | `infinite_crafts` |
| `borderShrink`   | `border_shrink`   |
| `gameLength`     | `game_length`     |
| `gameModifiers`  | `game_modifiers`  |
| `gracePeriod`    | `grace_period`    |
| `health`         | `health`          |
| `mode`           | `mode`            |
| `teamSize`       | `team_size`       |
