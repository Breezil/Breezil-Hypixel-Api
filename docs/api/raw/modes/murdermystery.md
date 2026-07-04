# Murder Mystery

The Murder Mystery module exposes a single parser, `parseMurderMystery`, which mirrors the raw `stats.MurderMystery` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseMurderMystery

Parses a player's Murder Mystery stats (`stats.MurderMystery`) into a typed object.

```ts
function parseMurderMystery(
  stats: Record<string, unknown>,
): MurderMysteryStats | null;
```

### Null / empty behavior

`parseMurderMystery` returns `null` when `stats.MurderMystery` is missing or is not a plain object (i.e. it is absent, `null`, or an array). Otherwise it returns a fully-populated `MurderMysteryStats` object; every field below is always present. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- String-array fields become empty arrays (`[]`) when absent, and keep only the string entries of the raw array.

The fixed-key record fields (`gamemodes`, `maps`, every map's `gamemodes`, `freeEventKeys`, and the two hotbar layouts) always contain their full key set, with absent raw keys producing default values. The dynamic record fields (`emblem.colorUnlocked`, `knifeSkinPrestiges.experience`, and `descent`) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### MurderMysteryStats

The root object returned by `parseMurderMystery`. It extends `MurderMysteryModeStats`, so it carries every field of the shared mode-stat block (parsed from the unsuffixed raw keys) plus the Murder-Mystery-specific fields below.

```ts
interface MurderMysteryStats extends MurderMysteryModeStats {
  readonly coins: number;
  readonly grantedChests: number;
  readonly chests: number;
  readonly christmasChests: number;
  readonly easterChests: number;
  readonly halloweenChests: number;
  readonly lunarChests: number;
  readonly openedChests: number;
  readonly openedCommons: number;
  readonly openedEpics: number;
  readonly openedLegendaries: number;
  readonly openedRares: number;
  readonly spookyOpenAchievements: number;
  readonly activeAnimatedHat: string;
  readonly activeDeathCry: string;
  readonly activeGesture: string;
  readonly activeGravestone: string;
  readonly activeKillNote: string;
  readonly activeKnifeSkin: string;
  readonly activeLastWords: string;
  readonly activeProjectileTrail: string;
  readonly activeProjectileTrailLegacy: string;
  readonly activeVictoryDance: string;
  readonly activePrefixIcon: string;
  readonly activePrefixScheme: string;
  readonly activePrefixStat: string;
  readonly shopSort: string;
  readonly shopSortEnableOwnedFirst: boolean;
  readonly doEmblemsInGame: boolean;
  readonly doHeartbeatSounds: boolean;
  readonly doHints: boolean;
  readonly doPrefixesInGame: boolean;
  readonly convertedEmblemIcons: boolean;
  readonly showQueueBook: boolean;
  readonly chestHistory: readonly string[];
  readonly chestHistoryNew: readonly string[];
  readonly mapsConsumablesUsed: readonly string[];
  readonly mapsMurdererTrapKills: readonly string[];
  readonly books: readonly string[];
  readonly packages: readonly string[];
  readonly emblem: MurderMysteryEmblem;
  readonly descent: MurderMysteryDescent;
  readonly knifeSkinPrestiges: MurderMysteryKnifeSkinPrestiges;
  readonly leaderboardSettings: MurderMysteryLeaderboardSettings;
  readonly settings: MurderMysterySettings;
  readonly assassinsHotbarLayout: MurderMysteryHotbarLayout;
  readonly classicHotbarLayout: MurderMysteryHotbarLayout;
  readonly freeEventKeys: MurderMysteryFreeEventKeys;
  readonly gamemodes: MurderMysteryGamemodeBreakdown;
  readonly maps: MurderMysteryMaps;
}
```

| Field                         | Notes                                                             |
| ----------------------------- | ----------------------------------------------------------------- |
| `chests`                      | Raw `mm_chests`.                                                  |
| `christmasChests`             | Raw `mm_christmas_chests`.                                        |
| `openedChests`                | Raw `MurderMystery_openedChests`.                                 |
| `activeDeathCry`              | Raw `active_deathcry`.                                            |
| `activeProjectileTrail`       | Raw `active_projectile_trail`.                                    |
| `activeProjectileTrailLegacy` | Raw `activeProjectileTrail` (legacy key).                         |
| `activePrefixIcon`            | Raw `active_prefixicon`.                                          |
| `spookyOpenAchievements`      | Raw `spooky_open_ach`.                                            |
| `showQueueBook`               | Raw `showqueuebook`.                                              |
| `chestHistory`                | Raw `mm_chest_history`.                                           |
| `books`                       | Raw `murdermystery_books`.                                        |
| `assassinsHotbarLayout`       | Read from the raw `assassins` object.                             |
| `classicHotbarLayout`         | Read from the raw `classic` object.                               |
| `gamemodes`                   | Per-gamemode breakdown using the unsuffixed (top-level) raw keys. |
| `maps`                        | Per-map breakdown.                                                |

---

## Shared mode-stat block

### MurderMysteryModeStats

The common stat shape reused for the top-level totals, every per-gamemode entry, and every per-map entry. Each field maps from the raw base key shown below, optionally appended with a suffix (gamemode and/or map) when read as part of a breakdown.

```ts
interface MurderMysteryModeStats {
  readonly alphaWins: number;
  readonly bowKills: number;
  readonly coinsPickedUp: number;
  readonly deaths: number;
  readonly detectiveWins: number;
  readonly games: number;
  readonly kills: number;
  readonly killsAsAlpha: number;
  readonly killsAsInfected: number;
  readonly killsAsMurderer: number;
  readonly killsAsSurvivor: number;
  readonly knifeKills: number;
  readonly lastOneAlive: number;
  readonly longestTimeAsSurvivorSeconds: number;
  readonly murdererWins: number;
  readonly quickestDetectiveWinTimeSeconds: number;
  readonly quickestMurdererWinTimeSeconds: number;
  readonly quickestShowdownWinTimeSeconds: number;
  readonly showdownPotg: number;
  readonly suicides: number;
  readonly survivorWins: number;
  readonly thrownKnifeKills: number;
  readonly totalTimeSurvivedSeconds: number;
  readonly trapKills: number;
  readonly wasHero: number;
  readonly wins: number;
}
```

| Field                             | Raw base key                          |
| --------------------------------- | ------------------------------------- |
| `alphaWins`                       | `alpha_wins`                          |
| `bowKills`                        | `bow_kills`                           |
| `coinsPickedUp`                   | `coins_pickedup`                      |
| `deaths`                          | `deaths`                              |
| `detectiveWins`                   | `detective_wins`                      |
| `games`                           | `games`                               |
| `kills`                           | `kills`                               |
| `killsAsAlpha`                    | `kills_as_alpha`                      |
| `killsAsInfected`                 | `kills_as_infected`                   |
| `killsAsMurderer`                 | `kills_as_murderer`                   |
| `killsAsSurvivor`                 | `kills_as_survivor`                   |
| `knifeKills`                      | `knife_kills`                         |
| `lastOneAlive`                    | `last_one_alive`                      |
| `longestTimeAsSurvivorSeconds`    | `longest_time_as_survivor_seconds`    |
| `murdererWins`                    | `murderer_wins`                       |
| `quickestDetectiveWinTimeSeconds` | `quickest_detective_win_time_seconds` |
| `quickestMurdererWinTimeSeconds`  | `quickest_murderer_win_time_seconds`  |
| `quickestShowdownWinTimeSeconds`  | `quickest_showdown_win_time_seconds`  |
| `showdownPotg`                    | `showdown_potg`                       |
| `suicides`                        | `suicides`                            |
| `survivorWins`                    | `survivor_wins`                       |
| `thrownKnifeKills`                | `thrown_knife_kills`                  |
| `totalTimeSurvivedSeconds`        | `total_time_survived_seconds`         |
| `trapKills`                       | `trap_kills`                          |
| `wasHero`                         | `was_hero`                            |
| `wins`                            | `wins`                                |

When read for a gamemode the base key is suffixed with the gamemode identifier (for example `wins_MURDER_CLASSIC`); when read for a map it is suffixed with the map identifier (for example `wins_ancient_tomb`); a map's per-gamemode breakdown combines both (for example `wins_ancient_tomb_MURDER_CLASSIC`). The top-level `MurderMysteryStats` block uses the unsuffixed base keys.

---

## Breakdowns

### MurderMysteryGamemodeBreakdown

A record mapping each Murder Mystery gamemode to a `MurderMysteryModeStats` block. Used by the top-level `gamemodes` field and by every map's nested `gamemodes` field.

```ts
type MurderMysteryGamemodeBreakdown = Readonly<
  Record<keyof typeof GAMEMODE_SUFFIX, MurderMysteryModeStats>
>;
```

| Key         | Raw suffix         |
| ----------- | ------------------ |
| `assassins` | `MURDER_ASSASSINS` |
| `classic`   | `MURDER_CLASSIC`   |
| `doubleUp`  | `MURDER_DOUBLE_UP` |
| `hardcore`  | `MURDER_HARDCORE`  |
| `infection` | `MURDER_INFECTION` |
| `showdown`  | `MURDER_SHOWDOWN`  |

### MurderMysteryMapStats

Extends `MurderMysteryModeStats` with a nested per-gamemode breakdown scoped to that map.

```ts
interface MurderMysteryMapStats extends MurderMysteryModeStats {
  readonly gamemodes: MurderMysteryGamemodeBreakdown;
}
```

### MurderMysteryMaps

A record mapping each map name to a `MurderMysteryMapStats` block.

```ts
type MurderMysteryMaps = Readonly<
  Record<keyof typeof MAP_SUFFIX, MurderMysteryMapStats>
>;
```

| Key                | Raw suffix           |
| ------------------ | -------------------- |
| `ancientTomb`      | `ancient_tomb`       |
| `aquarium`         | `aquarium`           |
| `archives`         | `archives`           |
| `archivesTopFloor` | `archives_top_floor` |
| `cattleridgeFarm`  | `cattleridge_farm`   |
| `cruiseShip`       | `cruise_ship`        |
| `darkfall`         | `darkfall`           |
| `easterWorld`      | `easter_world`       |
| `goldRush`         | `gold_rush`          |
| `headquarters`     | `headquarters`       |
| `hollywood`        | `hollywood`          |
| `hypixelWorld`     | `hypixel_world`      |
| `library`          | `library`            |
| `mountain`         | `mountain`           |
| `sanPeratico`      | `san_peratico`       |
| `sanPeraticoV2`    | `san_peratico_v2`    |
| `skywayPier`       | `skyway_pier`        |
| `snowfall`         | `snowfall`           |
| `snowglobe`        | `snowglobe`          |
| `spookyMansion`    | `spooky_mansion`     |
| `subway`           | `subway`             |
| `towerfall`        | `towerfall`          |
| `transport`        | `transport`          |
| `villa`            | `villa`              |
| `widowsDen`        | `widow's_den`        |

---

## Cosmetics and progression

### MurderMysteryEmblem

Read from the raw `emblem` object. `selectedColor` maps from `selected_color` and `selectedIcon` from `selected_icon`. `colorUnlocked` is built from the nested `color_unlocked` object.

```ts
interface MurderMysteryEmblem {
  readonly colorUnlocked: MurderMysteryEmblemColors;
  readonly selectedColor: string;
  readonly selectedIcon: string;
}
```

### MurderMysteryEmblemColors

A dynamic record of booleans keyed by the raw color names found directly on the `color_unlocked` object; it contains only the keys present in the raw data.

```ts
type MurderMysteryEmblemColors = Readonly<Record<string, boolean>>;
```

### MurderMysteryKnifeSkinPrestiges

Read from the raw `knifeSkinPrestiges` object. `usePrestige` maps from the raw `usePrestige` array, and `experience` is built from the nested `xp` object.

```ts
interface MurderMysteryKnifeSkinPrestiges {
  readonly usePrestige: readonly string[];
  readonly experience: MurderMysteryKnifeSkinExperience;
}
```

### MurderMysteryKnifeSkinExperience

A dynamic record of numbers keyed by the raw knife-skin identifiers found directly on the `xp` object; it contains only the keys present in the raw data.

```ts
type MurderMysteryKnifeSkinExperience = Readonly<Record<string, number>>;
```

### MurderMysteryDescent

A dynamic record mapping each raw descent item name to a `MurderMysteryDescentItem`, read from the raw `descent` object; it contains only the keys present in the raw data.

```ts
type MurderMysteryDescent = Readonly<Record<string, MurderMysteryDescentItem>>;
```

### MurderMysteryDescentItem

The per-item progression shape. `claimed` maps from the raw `claimed` field and `progress` from the raw `progress` field.

```ts
interface MurderMysteryDescentItem {
  readonly claimed: boolean;
  readonly progress: number;
}
```

---

## Settings and layouts

### MurderMysteryLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface MurderMysteryLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

### MurderMysterySettings

Read from the raw `settings` object.

```ts
interface MurderMysterySettings {
  readonly doPrefixesInGame: boolean;
}
```

### MurderMysteryHotbarLayout

A record mapping each of the nine hotbar slots to a string. Used by both `assassinsHotbarLayout` (raw `assassins` object) and `classicHotbarLayout` (raw `classic` object). Keys `slot0` through `slot8` map from raw string keys `"0"` through `"8"`.

```ts
type MurderMysteryHotbarLayout = Readonly<
  Record<keyof typeof HOTBAR_SLOT_KEYS, string>
>;
```

### MurderMysteryFreeEventKeys

A record of booleans keyed by free-event-key identifier, read from the top-level Murder Mystery object.

```ts
type MurderMysteryFreeEventKeys = Readonly<
  Record<keyof typeof FREE_EVENT_KEY_KEYS, boolean>
>;
```

| Key             | Raw key                                   |
| --------------- | ----------------------------------------- |
| `christmas2019` | `free_event_key_mm_christmas_chests_2019` |
| `christmas2020` | `free_event_key_mm_christmas_chests_2020` |
| `christmas2021` | `free_event_key_mm_christmas_chests_2021` |
| `christmas2022` | `free_event_key_mm_christmas_chests_2022` |
| `christmas2023` | `free_event_key_mm_christmas_chests_2023` |
| `easter2020`    | `free_event_key_mm_easter_chests_2020`    |
| `easter2021`    | `free_event_key_mm_easter_chests_2021`    |
| `easter2022`    | `free_event_key_mm_easter_chests_2022`    |
| `easter2023`    | `free_event_key_mm_easter_chests_2023`    |
| `halloween2019` | `free_event_key_mm_halloween_chests_2019` |
| `halloween2020` | `free_event_key_mm_halloween_chests_2020` |
| `halloween2021` | `free_event_key_mm_halloween_chests_2021` |
| `halloween2022` | `free_event_key_mm_halloween_chests_2022` |
| `halloween2023` | `free_event_key_mm_halloween_chests_2023` |
| `lunar2020`     | `free_event_key_mm_lunar_chests_2020`     |
