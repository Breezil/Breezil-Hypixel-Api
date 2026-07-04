# Smash Heroes

The Smash Heroes module exposes a single parser, `parseSmashHeroes`, which mirrors the raw `stats.SuperSmash` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseSmashHeroes

Parses a player's Smash Heroes stats (`stats.SuperSmash`) into a typed object.

```ts
function parseSmashHeroes(
  stats: Record<string, unknown>,
): SmashHeroesStats | null;
```

### Null / empty behavior

`parseSmashHeroes` returns `null` when `stats` is not an object, is `null`, or is an empty object. Otherwise it returns a fully-populated `SmashHeroesStats` object built with the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- `packages` becomes an empty array (`[]`) when the raw value is missing or not an array (only string entries are kept).

The dynamic maps (`votes`, `classes`, `heroes`, and each hero's `abilities`) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### SmashHeroesStats

The root object returned by `parseSmashHeroes`.

```ts
interface SmashHeroesStats {
  readonly coins: number;
  readonly smashLevel: number;
  readonly smashLevelTotal: number;
  readonly winStreak: number;
  readonly activeClass: string;
  readonly quits: number;
  readonly smashPlayStreak: number;
  readonly expiredBooster: boolean;
  readonly expBoosterPurchases10Plays: number;
  readonly expBoosterPurchases30Plays: number;
  readonly expBoosterPurchases50Plays: number;
  readonly expBoosterPurchases100Plays: number;
  readonly friendsFirstGame: Date | null;
  readonly friendsGamesDay: number;
  readonly oneVJuanFirstGame: Date | null;
  readonly oneVJuanGamesDay: number;
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly assistsNormal: number;
  readonly smashed: number;
  readonly smasher: number;
  readonly damageDealt: number;
  readonly friendWins: number;
  readonly friendWinsNormal: number;
  readonly friendLosses: number;
  readonly friendLossesNormal: number;
  readonly oneVOneWins: number;
  readonly oneVOneWinsNormal: number;
  readonly oneVOneLosses: number;
  readonly oneVOneLossesNormal: number;
  readonly packages: readonly string[];
  readonly classes: Readonly<Record<string, boolean>>;
  readonly leaderboardSettings: SmashHeroesLeaderboardSettings;
  readonly heroLevelBoosterActive: SmashHeroesHeroLevelBooster;
  readonly votes: Readonly<Record<string, number>>;
  readonly combatTracker: boolean;
  readonly ignoreSmashLevel: boolean;
  readonly normal: SmashHeroesModeStats;
  readonly twoVsTwo: SmashHeroesModeStats;
  readonly threeVsThree: SmashHeroesModeStats;
  readonly teams: SmashHeroesModeStats;
  readonly threeVsThreeLegacy: SmashHeroesModeStats;
  readonly teamsLegacy: SmashHeroesModeStats;
  readonly monthly: SmashHeroesPeriodPair;
  readonly weekly: SmashHeroesPeriodPair;
  readonly heroes: Readonly<Record<string, SmashHeroesHeroStats>>;
}
```

| Field                                   | Notes                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `coins`                                 | Raw `coins`.                                                           |
| `smashLevel`                            | Raw `smashLevel`.                                                      |
| `smashLevelTotal`                       | Raw `smash_level_total`.                                               |
| `winStreak`                             | Raw `win_streak`.                                                      |
| `activeClass`                           | Raw `active_class`.                                                    |
| `quits`                                 | Raw `quits`.                                                           |
| `smashPlayStreak`                       | Raw `smash_play_streak`.                                               |
| `expiredBooster`                        | Raw `expired_booster` (true only when exactly `true`).                 |
| `expBoosterPurchases10Plays`            | Raw `expBooster_purchases_10_plays`.                                   |
| `expBoosterPurchases30Plays`            | Raw `expBooster_purchases_30_plays`.                                   |
| `expBoosterPurchases50Plays`            | Raw `expBooster_purchases_50_plays`.                                   |
| `expBoosterPurchases100Plays`           | Raw `expBooster_purchases_100_plays`.                                  |
| `friendsFirstGame`                      | Raw `FRIENDS_firstGame` as `Date`, or `null`.                          |
| `friendsGamesDay`                       | Raw `FRIENDS_gamesDay`.                                                |
| `oneVJuanFirstGame`                     | Raw `ONE_V_JUAN_firstGame` as `Date`, or `null`.                       |
| `oneVJuanGamesDay`                      | Raw `ONE_V_JUAN_gamesDay`.                                             |
| `assists` / `assistsNormal`             | Raw `assists` / `assists_normal`.                                      |
| `smashed` / `smasher`                   | Raw `smashed` / `smasher`.                                             |
| `damageDealt`                           | Raw `damage_dealt`.                                                    |
| `friendWins` / `friendWinsNormal`       | Raw `friend_wins` / `friend_wins_normal`.                              |
| `friendLosses` / `friendLossesNormal`   | Raw `friend_losses` / `friend_losses_normal`.                          |
| `oneVOneWins` / `oneVOneWinsNormal`     | Raw `one_v_one_wins` / `one_v_one_wins_normal`.                        |
| `oneVOneLosses` / `oneVOneLossesNormal` | Raw `one_v_one_losses` / `one_v_one_losses_normal`.                    |
| `packages`                              | Raw `packages`; string entries only.                                   |
| `classes`                               | Map of class name to ownership boolean, from the raw `classes` object. |
| `votes`                                 | Collected from keys matching `votes_<name>`; keyed by `<name>`.        |
| `combatTracker`                         | Raw `combatTracker`.                                                   |
| `ignoreSmashLevel`                      | Raw `ignoreSmashLevel`.                                                |
| `normal`                                | Mode with suffix `normal` (e.g. `games_normal`).                       |
| `twoVsTwo`                              | Mode with suffix `2v2` (e.g. `games_2v2`).                             |
| `threeVsThree`                          | Mode with suffix `3v3` (e.g. `games_3v3`).                             |
| `teams`                                 | Mode with suffix `teams` (e.g. `games_teams`).                         |
| `threeVsThreeLegacy`                    | Legacy `3v3` mode with no separator (e.g. `games3v3`).                 |
| `teamsLegacy`                           | Legacy `teams` mode with no separator (e.g. `gamesteams`).             |
| `monthly`                               | Period pair from `monthly_a` / `monthly_b`.                            |
| `weekly`                                | Period pair from `weekly_a` / `weekly_b`.                              |
| `heroes`                                | Map of hero name to `SmashHeroesHeroStats`.                            |

Hero names in `heroes` are collected from the keys of `class_stats` plus any top-level key matching `^(?:lastLevel|xp|pg|masterArmor)_(.+)$`, deduplicated and sorted by `localeCompare`.

---

## Per-mode stat types

### SmashHeroesModeStats

Per-mode statistics for the overall game. Used by `normal`, `twoVsTwo`, `threeVsThree`, `teams`, `threeVsThreeLegacy`, and `teamsLegacy`. Each field reads its base key with a mode-specific suffix; legacy modes use no separator between base and suffix.

```ts
interface SmashHeroesModeStats {
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
  readonly deaths: number;
  readonly smashed: number;
  readonly smasher: number;
  readonly damageDealt: number;
}
```

Base keys: `games`, `wins`, `losses`, `kills`, `deaths`, `smashed`, `smasher`, `damage_dealt`.

### SmashHeroesPeriodPair

A pair of period buckets (`a` and `b`) used by `monthly` and `weekly`.

```ts
interface SmashHeroesPeriodPair {
  readonly a: SmashHeroesPeriodStats;
  readonly b: SmashHeroesPeriodStats;
}
```

### SmashHeroesPeriodStats

Reduced statistics for a monthly/weekly bucket. Each field reads `<base>_<period>` (for example `games_monthly_a`).

```ts
interface SmashHeroesPeriodStats {
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
}
```

---

## Heroes

### SmashHeroesHeroStats

Per-hero statistics. Keyed by hero name in `SmashHeroesStats.heroes`.

```ts
interface SmashHeroesHeroStats {
  readonly hero: string;
  readonly lastLevel: number;
  readonly experience: number;
  readonly prestige: number;
  readonly overall: SmashHeroesHeroModeStats;
  readonly normal: SmashHeroesHeroModeStats;
  readonly twoVsTwo: SmashHeroesHeroModeStats;
  readonly threeVsThree: SmashHeroesHeroModeStats;
  readonly teams: SmashHeroesHeroModeStats;
  readonly threeVsThreeLegacy: SmashHeroesHeroModeStats;
  readonly teamsLegacy: SmashHeroesHeroModeStats;
  readonly friendWins: number;
  readonly friendWinsNormal: number;
  readonly friendLosses: number;
  readonly friendLossesNormal: number;
  readonly oneVOneWins: number;
  readonly oneVOneWinsNormal: number;
  readonly oneVOneLosses: number;
  readonly oneVOneLossesNormal: number;
  readonly masterArmor: boolean;
  readonly abilities: Readonly<Record<string, SmashHeroesAbilityStats>>;
}
```

| Field                                   | Notes                                                                                                          |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `hero`                                  | The hero's identifier (the map key).                                                                           |
| `lastLevel`                             | Raw `lastLevel_<hero>`.                                                                                        |
| `experience`                            | Raw `xp_<hero>`.                                                                                               |
| `prestige`                              | Raw `pg_<hero>`.                                                                                               |
| `overall`                               | Per-mode hero stats from `class_stats.<hero>` with no suffix.                                                  |
| `normal`                                | Per-mode hero stats with suffix `normal`.                                                                      |
| `twoVsTwo`                              | Per-mode hero stats with suffix `2v2`.                                                                         |
| `threeVsThree`                          | Per-mode hero stats with suffix `3v3`.                                                                         |
| `teams`                                 | Per-mode hero stats with suffix `teams`.                                                                       |
| `threeVsThreeLegacy`                    | Legacy `3v3` per-mode hero stats with no separator.                                                            |
| `teamsLegacy`                           | Legacy `teams` per-mode hero stats with no separator.                                                          |
| `friendWins` / `friendWinsNormal`       | From `class_stats.<hero>`: `friend_wins` / `friend_wins_normal`.                                               |
| `friendLosses` / `friendLossesNormal`   | From `class_stats.<hero>`: `friend_losses` / `friend_losses_normal`.                                           |
| `oneVOneWins` / `oneVOneWinsNormal`     | From `class_stats.<hero>`: `one_v_one_wins` / `one_v_one_wins_normal`.                                         |
| `oneVOneLosses` / `oneVOneLossesNormal` | From `class_stats.<hero>`: `one_v_one_losses` / `one_v_one_losses_normal`.                                     |
| `masterArmor`                           | Raw `masterArmor_<hero>`.                                                                                      |
| `abilities`                             | Each nested non-array object under `class_stats.<hero>` becomes a `SmashHeroesAbilityStats` keyed by its name. |

### SmashHeroesHeroModeStats

Per-mode statistics within a single hero. Used by the hero's `overall`, `normal`, `twoVsTwo`, `threeVsThree`, `teams`, `threeVsThreeLegacy`, and `teamsLegacy`.

```ts
interface SmashHeroesHeroModeStats {
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
  readonly deaths: number;
  readonly smashed: number;
  readonly smasher: number;
  readonly damageDealt: number;
  readonly winStreak: number;
}
```

Base keys: `games`, `wins`, `losses`, `kills`, `deaths`, `smashed`, `smasher`, `damage_dealt`, `win_streak`.

### SmashHeroesAbilityStats

Per-ability statistics broken down by mode. Keyed by ability name in `SmashHeroesHeroStats.abilities`.

```ts
interface SmashHeroesAbilityStats {
  readonly overall: SmashHeroesAbilityModeStats;
  readonly normal: SmashHeroesAbilityModeStats;
  readonly twoVsTwo: SmashHeroesAbilityModeStats;
  readonly threeVsThree: SmashHeroesAbilityModeStats;
  readonly teams: SmashHeroesAbilityModeStats;
  readonly threeVsThreeLegacy: SmashHeroesAbilityModeStats;
  readonly teamsLegacy: SmashHeroesAbilityModeStats;
}
```

`overall` reads with no suffix; `normal`/`twoVsTwo`/`threeVsThree`/`teams` use suffixes `normal`/`2v2`/`3v3`/`teams`; `threeVsThreeLegacy` and `teamsLegacy` use the `3v3`/`teams` suffixes with no separator.

### SmashHeroesAbilityModeStats

Per-mode statistics for a single ability.

```ts
interface SmashHeroesAbilityModeStats {
  readonly kills: number;
  readonly smashed: number;
  readonly smasher: number;
  readonly damageDealt: number;
}
```

Base keys: `kills`, `smashed`, `smasher`, `damage_dealt`.

---

## Settings and boosters

### SmashHeroesLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface SmashHeroesLeaderboardSettings {
  readonly resetType: string;
  readonly mode: string;
}
```

| Field       | Raw key     |
| ----------- | ----------- |
| `resetType` | `resetType` |
| `mode`      | `mode`      |

### SmashHeroesHeroLevelBooster

The active hero-level booster, read from the raw `hero_level_booster_active` object.

```ts
interface SmashHeroesHeroLevelBooster {
  readonly key: string;
  readonly multiplier: number;
  readonly value: number;
  readonly plays: number;
}
```

| Field        | Raw key      |
| ------------ | ------------ |
| `key`        | `key`        |
| `multiplier` | `multiplier` |
| `value`      | `value`      |
| `plays`      | `plays`      |
