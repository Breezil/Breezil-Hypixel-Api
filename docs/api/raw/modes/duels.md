# Duels

This page documents the Duels parser from `@breezil/hypixel-parsers`. The parser is strict-raw: it mirrors the raw Hypixel API fields exactly, with no computed, derived, or aggregated values (no win/loss ratios, no kill/death ratios, no level-from-xp calculations).

## parseDuels

Parses a player's Duels stats (`stats.Duels`) into a typed object.

```ts
export function parseDuels(stats: Record<string, unknown>): DuelsStats | null;
```

Returns `null` when `stats.Duels` is missing, not an object, `null`, or an array. Otherwise returns a fully populated `DuelsStats`.

Notes on null/empty behavior across the tree:

- All numeric fields default to `0` and all string fields default to `""` when their raw key is absent.
- `coins` reads `coins`, falling back to `tokens` when `coins` is falsy.
- Record fields (for example `kitWins`, `legacyWinstreaks`, `claimedOdysseyRewards`, `classAbilities`, `modeAbilities`, `seasons`, `layouts`) are built by scanning prefixed/suffixed raw keys and include only entries whose values match the expected type; they are empty objects when nothing matches.
- Array fields (`packages`, `customTitles`, `challengeSettings`, `bridgeMapWins`, `mapsWonOn`, `duelsChestHistory`) return empty arrays when the raw value is missing or not an array, and keep only string entries.

## DuelsStats

The root object returned by `parseDuels`.

```ts
export interface DuelsStats {
  readonly coins: number;
  readonly titlePrestige: DuelsTitlePrestige;
  readonly pingPreference: number;
  readonly currentWinstreak: number;
  readonly bestWinstreak: number;
  readonly currentStreak: number;
  readonly oldWinstreak: number;
  readonly currentWinstreakBridge: number;
  readonly legacyWinstreaks: Readonly<Record<string, number>>;
  readonly legacyBestWinstreaks: Readonly<Record<string, number>>;
  readonly categoryWinstreaks: Readonly<Record<string, number>>;
  readonly bestCategoryWinstreaks: Readonly<Record<string, number>>;
  readonly gamesPlayed: number;
  readonly roundsPlayed: number;
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly meleeSwings: number;
  readonly meleeHits: number;
  readonly bowShots: number;
  readonly bowHits: number;
  readonly blocksPlaced: number;
  readonly healthRegenerated: number;
  readonly goldenApplesEaten: number;
  readonly goldenHeadsEaten: number;
  readonly healPotsUsed: number;
  readonly potionsUsed: number;
  readonly damageDealt: number;
  readonly longestCombo: number;
  readonly captures: number;
  readonly leaderboardPageCaptures: number;
  readonly leaderboardPageGoals: number;
  readonly leaderboardPageWins: number;
  readonly kitWins: Readonly<Record<string, number>>;
  readonly chests: number;
  readonly openedChests: number;
  readonly openedCommons: number;
  readonly openedRares: number;
  readonly openedEpics: number;
  readonly openedLegendaries: number;
  readonly leaderboardPageWinStreak: number;
  readonly challengesEnabled: boolean;
  readonly showQueueBook: boolean;
  readonly specialChallenger: boolean;
  readonly seasonOneRewardFixes: boolean;
  readonly prefixTitleColor2: boolean;
  readonly shopSortOwnedFirst: boolean;
  readonly chatEnabled: string;
  readonly kitMenuOption: string;
  readonly showLbOption: string;
  readonly showMapDetail: string;
  readonly toggleProjTrail: string;
  readonly rematchOption1: string;
  readonly progressMode: string;
  readonly shopSort: string;
  readonly statusField: string;
  readonly favoriteGlyph: string;
  readonly equippedPrefixColor: string;
  readonly equippedPrefixIcon: string;
  readonly equippedCustomTitle: string;
  readonly equippedRankedTitles: number;
  readonly recentlyPlayed: string;
  readonly recentlyPlayed2: string;
  readonly selected1: string;
  readonly selected1New: string;
  readonly selected2: string;
  readonly selected2New: string;
  readonly cosmetics: DuelsCosmetics;
  readonly settings: DuelsSettings;
  readonly leaderboardSettings: DuelsLeaderboardSettings;
  readonly privateGames: DuelsPrivateGames;
  readonly migrationFlags: DuelsMigrationFlags;
  readonly claimedOdysseyRewards: Readonly<Record<string, number>>;
  readonly collectedSeasonRewards: Readonly<Record<string, boolean>>;
  readonly packages: readonly string[];
  readonly customTitles: readonly string[];
  readonly challengeSettings: readonly string[];
  readonly bridgeMapWins: readonly string[];
  readonly mapsWonOn: readonly string[];
  readonly duelsChestHistory: readonly string[];
  readonly layouts: Readonly<Record<string, Readonly<Record<string, string>>>>;
  readonly uhc: DuelsUHCStats;
  readonly skywars: DuelsSkyWarsStats;
  readonly megaWalls: DuelsMegaWallsStats;
  readonly overPowered: DuelsOverPoweredStats;
  readonly bridge: DuelsBridgeStats;
  readonly tournament: DuelsTournamentStats;
  readonly bedwars: DuelsBedwarsStats;
  readonly ranked: DuelsRankedStats;
  readonly blitz: DuelsBlitzStats;
  readonly classic: DuelsClassicStats;
  readonly bow: DuelsModeStats;
  readonly noDebuff: DuelsModeStats;
  readonly combo: DuelsComboStats;
  readonly spleef: DuelsSpleefStats;
  readonly bowSpleef: DuelsModeStats;
  readonly quake: DuelsQuakeStats;
  readonly sumo: DuelsModeStats;
  readonly boxing: DuelsModeStats;
  readonly parkour: DuelsParkourStats;
  readonly arena: DuelsArenaStats;
}
```

| Field                      | Raw source                                                  | Notes                                             |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `coins`                    | `coins` or `tokens`                                         | Coin balance; falls back to `tokens`.             |
| `titlePrestige`            | `all_modes_*_title_prestige`                                | Overall title prestige counts.                    |
| `pingPreference`           | `pingPreference`                                            | Raw ping preference value.                        |
| `currentWinstreak`         | `current_winstreak`                                         | Current overall winstreak.                        |
| `bestWinstreak`            | `best_overall_winstreak`                                    | Best overall winstreak.                           |
| `currentStreak`            | `currentStreak`                                             | Raw current streak value.                         |
| `oldWinstreak`             | `old_winstreak`                                             | Legacy winstreak value.                           |
| `currentWinstreakBridge`   | `current_winstreak_bridge`                                  | Current bridge winstreak.                         |
| `legacyWinstreaks`         | `duels_winstreak_*` (excluding `duels_winstreak_best_*`)    | Map keyed by suffix.                              |
| `legacyBestWinstreaks`     | `duels_winstreak_best_*`                                    | Map keyed by suffix.                              |
| `categoryWinstreaks`       | `current_<category>_winstreak`                              | Excludes `overall` and `*_winstreak_mode_*` keys. |
| `bestCategoryWinstreaks`   | `best_<category>_winstreak`                                 | Excludes `overall` and `*_winstreak_mode_*` keys. |
| `gamesPlayed`              | `games_played_duels`                                        | Total games played.                               |
| `roundsPlayed`             | `rounds_played`                                             | Total rounds played.                              |
| `kitWins`                  | `*_kit_wins` (single-token kits) plus `kit_wins` as `total` | Overall kit wins map.                             |
| `chests`                   | `duels_chests`                                              | Chest count.                                      |
| `openedChests`             | `Duels_openedChests`                                        | Opened chest count.                               |
| `openedCommons`            | `Duels_openedCommons`                                       | Opened common chests.                             |
| `openedRares`              | `Duels_openedRares`                                         | Opened rare chests.                               |
| `openedEpics`              | `Duels_openedEpics`                                         | Opened epic chests.                               |
| `openedLegendaries`        | `Duels_openedLegendaries`                                   | Opened legendary chests.                          |
| `leaderboardPageCaptures`  | `leaderboardPage_captures`                                  | Leaderboard page setting.                         |
| `leaderboardPageGoals`     | `leaderboardPage_goals`                                     | Leaderboard page setting.                         |
| `leaderboardPageWins`      | `leaderboardPage_wins`                                      | Leaderboard page setting.                         |
| `leaderboardPageWinStreak` | `leaderboardPage_win_streak`                                | Leaderboard page setting.                         |
| `challengesEnabled`        | `challenges_enabled`                                        | Whether challenges are enabled.                   |
| `showQueueBook`            | `duels_showqueuebook`                                       | Whether the queue book is shown.                  |
| `specialChallenger`        | `special_challenger`                                        | Special challenger flag.                          |
| `seasonOneRewardFixes`     | `season_1_reward_fixes`                                     | Season 1 reward fix flag.                         |
| `prefixTitleColor2`        | `duels_prefix_title_color2`                                 | Prefix title color flag.                          |
| `shopSortOwnedFirst`       | `shop_sort_enable_owned_first`                              | Shop sort flag.                                   |
| `chatEnabled`              | `chat_enabled`                                              | Chat setting value.                               |
| `kitMenuOption`            | `kit_menu_option`                                           | Kit menu setting.                                 |
| `showLbOption`             | `show_lb_option`                                            | Leaderboard display setting.                      |
| `showMapDetail`            | `show_map_detail`                                           | Map detail setting.                               |
| `toggleProjTrail`          | `toggle_proj_trail`                                         | Projectile trail setting.                         |
| `rematchOption1`           | `rematch_option_1`                                          | Rematch setting.                                  |
| `progressMode`             | `progress_mode`                                             | Progress mode setting.                            |
| `shopSort`                 | `shop_sort`                                                 | Shop sort setting.                                |
| `statusField`              | `status_field`                                              | Status field setting.                             |
| `favoriteGlyph`            | `favoriteGlyph`                                             | Favorite glyph value.                             |
| `equippedPrefixColor`      | `equipped_prefix_color`                                     | Equipped prefix color.                            |
| `equippedPrefixIcon`       | `equipped_prefix_icon`                                      | Equipped prefix icon.                             |
| `equippedCustomTitle`      | `equipped_custom_titles`                                    | Equipped custom title.                            |
| `equippedRankedTitles`     | `equipped_ranked_titles`                                    | Equipped ranked title count.                      |
| `recentlyPlayed`           | `duels_recently_played`                                     | Recently played value.                            |
| `recentlyPlayed2`          | `duels_recently_played2`                                    | Recently played value.                            |
| `selected1`                | `selected_1`                                                | Selected slot value.                              |
| `selected1New`             | `selected_1_new`                                            | Selected slot value.                              |
| `selected2`                | `selected_2`                                                | Selected slot value.                              |
| `selected2New`             | `selected_2_new`                                            | Selected slot value.                              |
| `claimedOdysseyRewards`    | `claimed_odyssey_rewards` object                            | Numeric entries only.                             |
| `collectedSeasonRewards`   | `collected_reward_season_*`                                 | Map keyed by season suffix, boolean values.       |
| `packages`                 | `packages`                                                  | String array.                                     |
| `customTitles`             | `custom_titles`                                             | String array.                                     |
| `challengeSettings`        | `challengeSettings`                                         | String array.                                     |
| `bridgeMapWins`            | `bridgeMapWins`                                             | String array.                                     |
| `mapsWonOn`                | `maps_won_on`                                               | String array.                                     |
| `duelsChestHistory`        | `duels_chest_history`                                       | String array.                                     |
| `layouts`                  | keys containing `layout`                                    | Map of layout name to slot/item map.              |

The remaining `DuelsStats` fields are per-mode blocks documented in the type sections below.

## DuelsTitlePrestige

Title prestige counts for a given category (raw keys `<category>_<tier>_title_prestige`, where `worldElite` maps to `<category>_world_elite_title_prestige`).

```ts
export interface DuelsTitlePrestige {
  readonly rookie: number;
  readonly iron: number;
  readonly gold: number;
  readonly diamond: number;
  readonly master: number;
  readonly legend: number;
  readonly grandmaster: number;
  readonly godlike: number;
  readonly celestial: number;
  readonly divine: number;
  readonly worldElite: number;
}
```

## DuelsGamemodeStats

Per-gamemode statistics shared by most Duels modes (raw keys prefixed by the mode token, plus `current_winstreak_mode_<mode>` and `best_winstreak_mode_<mode>`).

```ts
export interface DuelsGamemodeStats {
  readonly currentWinstreak: number;
  readonly bestWinstreak: number;
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly roundsPlayed: number;
  readonly meleeSwings: number;
  readonly meleeHits: number;
  readonly bowShots: number;
  readonly bowHits: number;
  readonly blocksPlaced: number;
  readonly healthRegenerated: number;
  readonly goldenApplesEaten: number;
  readonly goldenHeadsEaten: number;
  readonly healPotsUsed: number;
  readonly potionsUsed: number;
  readonly damageDealt: number;
  readonly coins: number;
  readonly coinsGained: number;
  readonly kitWins: Readonly<Record<string, number>>;
}
```

`potionsUsed` maps the raw `<mode>_potions_used` key. `kitWins` is a map built from `<mode>_*_kit_wins` raw keys; the empty-kit key (`<mode>_kit_wins`) is stored under `total`.

## DuelsBridgeGamemodeStats

Extends `DuelsGamemodeStats` with bridge-specific counters (raw keys `<mode>_bridge_kills`, `<mode>_bridge_deaths`, `<mode>_goals`, `<mode>_captures`).

```ts
export interface DuelsBridgeGamemodeStats extends DuelsGamemodeStats {
  readonly bridgeKills: number;
  readonly bridgeDeaths: number;
  readonly goals: number;
  readonly captures: number;
}
```

## DuelsBedwarsGamemodeStats

Extends `DuelsGamemodeStats` with a blocks-broken counter (raw key `<mode>_blocks_broken`).

```ts
export interface DuelsBedwarsGamemodeStats extends DuelsGamemodeStats {
  readonly blocksBroken: number;
}
```

## DuelsModeStats

Extends `DuelsGamemodeStats` with the mode's title prestige block.

```ts
export interface DuelsModeStats extends DuelsGamemodeStats {
  readonly titlePrestige: DuelsTitlePrestige;
}
```

## DuelsBlitzStats

Extends `DuelsModeStats` with the selected kit (raw key `blitz_duels_kit`).

```ts
export interface DuelsBlitzStats extends DuelsModeStats {
  readonly selectedKit: string;
}
```

## DuelsComboStats

Extends `DuelsModeStats` with the longest combo (raw key `combo_duel_longest_combo`).

```ts
export interface DuelsComboStats extends DuelsModeStats {
  readonly longestCombo: number;
}
```

## DuelsParkourStats

Extends `DuelsModeStats` (mode token `parkour_eight`, category `parkour`) with parkour-specific fields.

```ts
export interface DuelsParkourStats extends DuelsModeStats {
  readonly checkpointsReached: number;
  readonly personalBest: number;
  readonly modeCheckpointsReached: number;
  readonly modePersonalBest: number;
  readonly playersHidden: boolean;
}
```

| Field                    | Raw key                                     |
| ------------------------ | ------------------------------------------- |
| `checkpointsReached`     | `parkour_checkpoints_reached`               |
| `personalBest`           | `parkour_personal_best`                     |
| `modeCheckpointsReached` | `parkour_eight_parkour_checkpoints_reached` |
| `modePersonalBest`       | `parkour_eight_parkour_personal_best`       |
| `playersHidden`          | `parkour_players_hidden`                    |

## DuelsModeGroupStats

Header block shared by modes that group several sub-gamemodes (raw keys `current_<category>_winstreak`, `best_<category>_winstreak`, plus the category title prestige).

```ts
export interface DuelsModeGroupStats {
  readonly titlePrestige: DuelsTitlePrestige;
  readonly currentWinstreak: number;
  readonly bestWinstreak: number;
}
```

## DuelsWinstreakGroupStats

Lighter group header with only winstreak fields (raw keys `current_<category>_winstreak`, `best_<category>_winstreak`).

```ts
export interface DuelsWinstreakGroupStats {
  readonly currentWinstreak: number;
  readonly bestWinstreak: number;
}
```

## DuelsUHCStats

Extends `DuelsModeGroupStats` with UHC sub-gamemodes (`uhc_duel`, `uhc_doubles`, `uhc_four`, `uhc_meetup`).

```ts
export interface DuelsUHCStats extends DuelsModeGroupStats {
  readonly solo: DuelsGamemodeStats;
  readonly doubles: DuelsGamemodeStats;
  readonly fours: DuelsGamemodeStats;
  readonly deathmatch: DuelsGamemodeStats;
}
```

## DuelsSkyWarsStats

Extends `DuelsModeGroupStats` with SkyWars kit selections and sub-gamemodes (`sw_duel`, `sw_doubles`).

```ts
export interface DuelsSkyWarsStats extends DuelsModeGroupStats {
  readonly selectedKit: string;
  readonly selectedKitNew: string;
  readonly selectedKitNew2: string;
  readonly selectedKitNew3: string;
  readonly solo: DuelsGamemodeStats;
  readonly doubles: DuelsGamemodeStats;
}
```

| Field             | Raw key             |
| ----------------- | ------------------- |
| `selectedKit`     | `sw_duels_kit`      |
| `selectedKitNew`  | `sw_duels_kit_new`  |
| `selectedKitNew2` | `sw_duels_kit_new2` |
| `selectedKitNew3` | `sw_duels_kit_new3` |

## DuelsMegaWallsAbility

A single Mega Walls ability counter (raw key `<base>` for `total` and `<base>_standard` for `standard`).

```ts
export interface DuelsMegaWallsAbility {
  readonly total: number;
  readonly standard: number;
}
```

## DuelsMegaWallsAbilities

The full set of tracked Mega Walls abilities, each a `DuelsMegaWallsAbility`.

```ts
export interface DuelsMegaWallsAbilities {
  readonly alliesHealed: DuelsMegaWallsAbility;
  readonly amountHealed: DuelsMegaWallsAbility;
  readonly angelDivineInterventions: DuelsMegaWallsAbility;
  readonly arrowsFromRend: DuelsMegaWallsAbility;
  readonly blizzardSecondsSlow: DuelsMegaWallsAbility;
  readonly blocksBroken: DuelsMegaWallsAbility;
  readonly bucketBarriersBroken: DuelsMegaWallsAbility;
  readonly divineInterventions: DuelsMegaWallsAbility;
  readonly energyFromGrapplingHook: DuelsMegaWallsAbility;
  readonly heroismTriggers: DuelsMegaWallsAbility;
  readonly innerInkBlinds: DuelsMegaWallsAbility;
  readonly masterAlchemyHearts: DuelsMegaWallsAbility;
  readonly metersTravelled: DuelsMegaWallsAbility;
  readonly resistanceTimeSeconds: DuelsMegaWallsAbility;
  readonly snowmenPlayersHit: DuelsMegaWallsAbility;
  readonly strikesFromCloak: DuelsMegaWallsAbility;
  readonly venomStrikePoisonDamage: DuelsMegaWallsAbility;
}
```

| Field                      | Raw base key                               |
| -------------------------- | ------------------------------------------ |
| `alliesHealed`             | `allies_healed`                            |
| `amountHealed`             | `amount_healed`                            |
| `angelDivineInterventions` | `angel_divine_interventions`               |
| `arrowsFromRend`           | `arrows_from_rend`                         |
| `blizzardSecondsSlow`      | `blizzard_seconds_slow`                    |
| `blocksBroken`             | `blocks_broken`                            |
| `bucketBarriersBroken`     | `bucket_barriers_broken`                   |
| `divineInterventions`      | `divine_interventions`                     |
| `energyFromGrapplingHook`  | `energy_from_grappling_hook`               |
| `heroismTriggers`          | `heroism_triggers`                         |
| `innerInkBlinds`           | `inner_ink_blinds`                         |
| `masterAlchemyHearts`      | `master_alechmy_hearts` (raw key spelling) |
| `metersTravelled`          | `meters_travelled`                         |
| `resistanceTimeSeconds`    | `resistance_time_seconds`                  |
| `snowmenPlayersHit`        | `snowmen_players_hit`                      |
| `strikesFromCloak`         | `strikes_from_cloak`                       |
| `venomStrikePoisonDamage`  | `venom_strike_poison_damage`               |

## DuelsMegaWallsStats

Extends `DuelsModeGroupStats` with Mega Walls class data and sub-gamemodes (`mw_duel`, `mw_doubles`, `mw_four`).

```ts
export interface DuelsMegaWallsStats extends DuelsModeGroupStats {
  readonly selectedClass: string;
  readonly abilities: DuelsMegaWallsAbilities;
  readonly classAbilities: Readonly<Record<string, number>>;
  readonly modeAbilities: Readonly<Record<string, number>>;
  readonly solo: DuelsGamemodeStats;
  readonly doubles: DuelsGamemodeStats;
  readonly fours: DuelsGamemodeStats;
}
```

`selectedClass` maps to `mw_duels_class`. `classAbilities` is a map of per-class ability raw keys (numeric keys ending in one of the known ability bases, excluding the base set and the `mw_`/`spleef`/`bedwars` prefixes). `modeAbilities` is a map of per-mode ability raw keys (numeric keys starting with `mw_duel_`/`mw_doubles_` and ending in one of the known ability bases, with or without the `_standard` suffix).

## DuelsOverPoweredStats

Extends `DuelsModeGroupStats` with OverPowered sub-gamemodes (`op_duel`, `op_doubles`).

```ts
export interface DuelsOverPoweredStats extends DuelsModeGroupStats {
  readonly solo: DuelsGamemodeStats;
  readonly doubles: DuelsGamemodeStats;
}
```

## DuelsClassicStats

Extends `DuelsModeGroupStats` with Classic sub-gamemodes (`classic_duel`, `classic_doubles`).

```ts
export interface DuelsClassicStats extends DuelsModeGroupStats {
  readonly solo: DuelsGamemodeStats;
  readonly doubles: DuelsGamemodeStats;
}
```

## DuelsSpleefStats

Extends `DuelsWinstreakGroupStats` with Spleef data (`spleef_duel_blocks_broken`, `spleef_duel` sub-gamemode).

```ts
export interface DuelsSpleefStats extends DuelsWinstreakGroupStats {
  readonly blocksBroken: number;
  readonly solo: DuelsGamemodeStats;
}
```

## DuelsArenaModePreferences

Arena mode preference strings (raw keys `arena_mode_<mode>`).

```ts
export interface DuelsArenaModePreferences {
  readonly bow: string;
  readonly classic: string;
  readonly noDebuff: string;
  readonly op: string;
  readonly soup: string;
  readonly uhc: string;
}
```

| Field      | Raw key                |
| ---------- | ---------------------- |
| `bow`      | `arena_mode_bow`       |
| `classic`  | `arena_mode_classic`   |
| `noDebuff` | `arena_mode_no_debuff` |
| `op`       | `arena_mode_op`        |
| `soup`     | `arena_mode_soup`      |
| `uhc`      | `arena_mode_uhc`       |

## DuelsArenaStats

Extends `DuelsGamemodeStats` (mode token `duel_arena`) with mode preferences.

```ts
export interface DuelsArenaStats extends DuelsGamemodeStats {
  readonly modePreferences: DuelsArenaModePreferences;
}
```

## DuelsQuakeSoloStats

Extends `DuelsGamemodeStats` (mode token `quake_duel`) with Quake shot counters scoped to the solo sub-gamemode.

```ts
export interface DuelsQuakeSoloStats extends DuelsGamemodeStats {
  readonly headshots: number;
  readonly shotHits: number;
  readonly shotsTaken: number;
}
```

| Field        | Raw key                        |
| ------------ | ------------------------------ |
| `headshots`  | `quake_duel_quake_headshots`   |
| `shotHits`   | `quake_duel_quake_shot_hits`   |
| `shotsTaken` | `quake_duel_quake_shots_taken` |

## DuelsQuakeStats

Extends `DuelsWinstreakGroupStats` with top-level Quake data and the `quake_duel` sub-gamemode (`DuelsQuakeSoloStats`).

```ts
export interface DuelsQuakeStats extends DuelsWinstreakGroupStats {
  readonly gunType: string;
  readonly headshots: number;
  readonly shotHits: number;
  readonly shotsTaken: number;
  readonly solo: DuelsQuakeSoloStats;
}
```

| Field        | Raw key             |
| ------------ | ------------------- |
| `gunType`    | `quakeGunType`      |
| `headshots`  | `quake_headshots`   |
| `shotHits`   | `quake_shot_hits`   |
| `shotsTaken` | `quake_shots_taken` |

## DuelsBridgeStats

Extends `DuelsModeGroupStats` with Bridge top-level counters and many `DuelsBridgeGamemodeStats` sub-gamemodes.

```ts
export interface DuelsBridgeStats extends DuelsModeGroupStats {
  readonly bridgeKills: number;
  readonly bridgeDeaths: number;
  readonly goals: number;
  readonly solo: DuelsBridgeGamemodeStats;
  readonly doubles: DuelsBridgeGamemodeStats;
  readonly threes: DuelsBridgeGamemodeStats;
  readonly fours: DuelsBridgeGamemodeStats;
  readonly teamsOfTwo: DuelsBridgeGamemodeStats;
  readonly teamsOfThree: DuelsBridgeGamemodeStats;
  readonly captureSolo: DuelsBridgeGamemodeStats;
  readonly captureThrees: DuelsBridgeGamemodeStats;
  readonly tournament: DuelsBridgeGamemodeStats;
}
```

| Field           | Raw source               |
| --------------- | ------------------------ |
| `bridgeKills`   | `bridge_kills`           |
| `bridgeDeaths`  | `bridge_deaths`          |
| `goals`         | `goals`                  |
| `solo`          | mode `bridge_duel`       |
| `doubles`       | mode `bridge_doubles`    |
| `threes`        | mode `bridge_threes`     |
| `fours`         | mode `bridge_four`       |
| `teamsOfTwo`    | mode `bridge_2v2v2v2`    |
| `teamsOfThree`  | mode `bridge_3v3v3v3`    |
| `captureSolo`   | mode `capture_duel`      |
| `captureThrees` | mode `capture_threes`    |
| `tournament`    | mode `bridge_tournament` |

## DuelsTournamentStats

Tournament-specific blocks built from dedicated mode tokens.

```ts
export interface DuelsTournamentStats {
  readonly titlePrestige: DuelsTitlePrestige;
  readonly uhc: DuelsGamemodeStats;
  readonly skywars: DuelsGamemodeStats;
  readonly sumo: DuelsGamemodeStats;
  readonly bridge: DuelsBridgeGamemodeStats;
}
```

| Field           | Raw source               |
| --------------- | ------------------------ |
| `titlePrestige` | category `tournament`    |
| `uhc`           | mode `uhc_tournament`    |
| `skywars`       | mode `sw_tournament`     |
| `sumo`          | mode `sumo_tournament`   |
| `bridge`        | mode `bridge_tournament` |

## DuelsBedwarsCauseBreakdown

A by-cause breakdown of a Bedwars metric (raw keys `<cause>_<metric>_bedwars`).

```ts
export interface DuelsBedwarsCauseBreakdown {
  readonly entityAttack: number;
  readonly fall: number;
  readonly magic: number;
  readonly void: number;
}
```

| Field          | Raw key                          |
| -------------- | -------------------------------- |
| `entityAttack` | `entity_attack_<metric>_bedwars` |
| `fall`         | `fall_<metric>_bedwars`          |
| `magic`        | `magic_<metric>_bedwars`         |
| `void`         | `void_<metric>_bedwars`          |

## DuelsBedwarsStats

Extends `DuelsWinstreakGroupStats` with Bedwars Duels data, including four `DuelsBedwarsCauseBreakdown` blocks and two `DuelsBedwarsGamemodeStats` sub-gamemodes.

```ts
export interface DuelsBedwarsStats extends DuelsWinstreakGroupStats {
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
  readonly deaths: number;
  readonly finalKills: number;
  readonly finalDeaths: number;
  readonly bedsBroken: number;
  readonly bedsLost: number;
  readonly gamesPlayed: number;
  readonly itemsPurchased: number;
  readonly itemsPurchasedAlt: number;
  readonly permanentItemsPurchased: number;
  readonly killsByCause: DuelsBedwarsCauseBreakdown;
  readonly deathsByCause: DuelsBedwarsCauseBreakdown;
  readonly finalKillsByCause: DuelsBedwarsCauseBreakdown;
  readonly finalDeathsByCause: DuelsBedwarsCauseBreakdown;
  readonly solo: DuelsBedwarsGamemodeStats;
  readonly rush: DuelsBedwarsGamemodeStats;
}
```

| Field                     | Raw source                          |
| ------------------------- | ----------------------------------- |
| `wins`                    | `wins_bedwars`                      |
| `losses`                  | `losses_bedwars`                    |
| `kills`                   | `kills_bedwars`                     |
| `deaths`                  | `deaths_bedwars`                    |
| `finalKills`              | `final_kills_bedwars`               |
| `finalDeaths`             | `final_deaths_bedwars`              |
| `bedsBroken`              | `beds_broken_bedwars`               |
| `bedsLost`                | `beds_lost_bedwars`                 |
| `gamesPlayed`             | `games_played_bedwars`              |
| `itemsPurchased`          | `items_purchased_bedwars`           |
| `itemsPurchasedAlt`       | `_items_purchased_bedwars`          |
| `permanentItemsPurchased` | `permanent_items_purchased_bedwars` |
| `killsByCause`            | metric `kills`                      |
| `deathsByCause`           | metric `deaths`                     |
| `finalKillsByCause`       | metric `final_kills`                |
| `finalDeathsByCause`      | metric `final_deaths`               |
| `solo`                    | mode `bedwars_two_one_duels`        |
| `rush`                    | mode `bedwars_two_one_duels_rush`   |

## DuelsRankedSeason

Per-season ranked summary (raw keys prefixed `Duels_new_ranked__<season>`).

```ts
export interface DuelsRankedSeason {
  readonly overallBestStars: number;
  readonly bestElo: number;
  readonly bestStars: number;
  readonly maxStars: boolean;
}
```

| Field              | Raw suffix            |
| ------------------ | --------------------- |
| `overallBestStars` | `_overallBestStars`   |
| `bestElo`          | `_ranked_1_bestElo`   |
| `bestStars`        | `_ranked_1_bestStars` |
| `maxStars`         | `_ranked_1_maxStars`  |

## DuelsRankedStats

Ranked Duels block, including a `DuelsBridgeGamemodeStats` stats block and a `seasons` map of `DuelsRankedSeason`.

```ts
export interface DuelsRankedStats {
  readonly currentWinstreak: number;
  readonly bestWinstreak: number;
  readonly winStreak: number;
  readonly lossStreak: number;
  readonly equippedTitles: number;
  readonly healPotsUsed: number;
  readonly stats: DuelsBridgeGamemodeStats;
  readonly seasons: Readonly<Record<string, DuelsRankedSeason>>;
}
```

| Field              | Raw source                        |
| ------------------ | --------------------------------- |
| `currentWinstreak` | `current_winstreak_mode_ranked_1` |
| `bestWinstreak`    | `duels_winstreak_best_ranked_1`   |
| `winStreak`        | `ranked_streak_ranked_1`          |
| `lossStreak`       | `ranked_loss_streak_ranked_1`     |
| `equippedTitles`   | `equipped_ranked_titles`          |
| `healPotsUsed`     | `ranked_1_heal_pots_used`         |
| `stats`            | mode `ranked_1`                   |
| `seasons`          | `Duels_new_ranked__*` keys        |

## DuelsCosmetics

Active cosmetic selections (raw keys prefixed `active_`).

```ts
export interface DuelsCosmetics {
  readonly auras: string;
  readonly cage: string;
  readonly cosmeticTitle: string;
  readonly emblem: string;
  readonly goal: string;
  readonly hat: string;
  readonly killEffect: string;
  readonly killMessages: string;
  readonly prefixIcon: string;
  readonly projectileTrail: string;
  readonly startingWeapon: string;
  readonly title: string;
  readonly victoryDance: string;
  readonly weaponPacks: string;
}
```

| Field             | Raw key                   |
| ----------------- | ------------------------- |
| `auras`           | `active_auras`            |
| `cage`            | `active_cage`             |
| `cosmeticTitle`   | `active_cosmetictitle`    |
| `emblem`          | `active_emblem`           |
| `goal`            | `active_goal`             |
| `hat`             | `active_hat`              |
| `killEffect`      | `active_kill_effect`      |
| `killMessages`    | `active_killmessages`     |
| `prefixIcon`      | `active_prefix_icon`      |
| `projectileTrail` | `active_projectile_trail` |
| `startingWeapon`  | `active_starting_weapon`  |
| `title`           | `active_title`            |
| `victoryDance`    | `active_victory_dance`    |
| `weaponPacks`     | `active_weaponpacks`      |

## DuelsSettings

Player settings (read from the raw `settings` object).

```ts
export interface DuelsSettings {
  readonly lobbyScoreboardStats: string;
  readonly rematchBehavior: string;
  readonly showInGameLeaderboards: boolean;
  readonly enableProjectileTrails: boolean;
  readonly viewChat: boolean;
  readonly showKitMenu: boolean;
}
```

| Field                    | Raw key (within `settings`) |
| ------------------------ | --------------------------- |
| `lobbyScoreboardStats`   | `lobby_scoreboard_stats`    |
| `rematchBehavior`        | `rematch_behavior`          |
| `showInGameLeaderboards` | `show_in_game_leaderboards` |
| `enableProjectileTrails` | `enable_projectile_trails`  |
| `viewChat`               | `view_chat`                 |
| `showKitMenu`            | `show_kit_menu`             |

## DuelsLeaderboardSettings

Leaderboard settings (read from the raw `leaderboardSettings` object).

```ts
export interface DuelsLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

| Field       | Raw key (within `leaderboardSettings`) |
| ----------- | -------------------------------------- |
| `mode`      | `mode`                                 |
| `resetType` | `resetType`                            |

## DuelsPrivateGames

Private game preferences (read from the raw `privategames` object).

```ts
export interface DuelsPrivateGames {
  readonly speed: string;
  readonly knockbackTen: boolean;
  readonly nightTime: string;
  readonly onlyTnt: boolean;
  readonly moreGoals: string;
  readonly enableOp: boolean;
  readonly giveSlowness: string;
  readonly giveRegen: string;
  readonly lowGravity: boolean;
  readonly blockProtection: boolean;
  readonly changeWeapon: string;
  readonly roundTime: string;
  readonly healthBuff: string;
}
```

| Field             | Raw key (within `privategames`) |
| ----------------- | ------------------------------- |
| `speed`           | `speed`                         |
| `knockbackTen`    | `duels_knockback_ten`           |
| `nightTime`       | `duels_night_time`              |
| `onlyTnt`         | `duels_only_tnt`                |
| `moreGoals`       | `duels_more_goals`              |
| `enableOp`        | `duels_enable_op`               |
| `giveSlowness`    | `duels_give_slowness`           |
| `giveRegen`       | `duels_give_regen`              |
| `lowGravity`      | `low_gravity`                   |
| `blockProtection` | `duels_block_protection`        |
| `changeWeapon`    | `duels_change_weapon`           |
| `roundTime`       | `duels_round_time`              |
| `healthBuff`      | `health_buff`                   |

## DuelsMigrationFlags

Internal data-migration flags read from the raw root object.

```ts
export interface DuelsMigrationFlags {
  readonly movedToRedis: boolean;
  readonly movedToRedis2: boolean;
  readonly movedToRedis3: boolean;
  readonly movedToRedisStage2: boolean;
  readonly movedToRedisStage3: boolean;
  readonly redisToPlayerDataSync: boolean;
}
```

| Field                   | Raw key                     |
| ----------------------- | --------------------------- |
| `movedToRedis`          | `moved_to_redis`            |
| `movedToRedis2`         | `moved_to_redis2`           |
| `movedToRedis3`         | `moved_to_redis3`           |
| `movedToRedisStage2`    | `moved_to_redis_2`          |
| `movedToRedisStage3`    | `moved_to_redis_3`          |
| `redisToPlayerDataSync` | `redis_to_player_data_sync` |
