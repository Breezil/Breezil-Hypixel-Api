# Mega Walls

The Mega Walls module exposes a single parser, `parseMegaWalls`, which mirrors the raw `stats.Walls3` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseMegaWalls

Parses a player's Mega Walls stats (`stats.Walls3`) into a typed object.

```ts
function parseMegaWalls(stats: Record<string, unknown>): MegaWallsStats | null;
```

### Null / empty behavior

`parseMegaWalls` returns `null` when the input is not an object, is `null`, or has no keys. Otherwise it returns a fully-populated `MegaWallsStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects (`leaderboardSettings`, `settings`, `privategames`, each class's `prestige_tag`) are treated as empty objects, so every nested block is still present and populated with the defaults above.
- Array fields (`packages`, `cakes_found_by_name`) become empty arrays (`[]`) when absent, and non-string entries are filtered out.

The dynamic maps are built only from the keys present in the raw data, so they may be empty:

- `votes` collects every `votes_<map>` key with a numeric value.
- `chosenSkins` collects every `chosen_skin_<class>` key with a string value.
- `effects` collects every `<name>_effect` key with a string value.
- `byClass`, `classes`, `legacyClassStats`, `kitInventories`, and the per-period `finalKillsByClassTier*` maps are keyed by class / kit names discovered in the raw data.

Class names for the per-class maps are discovered from the seed list of 15 known classes (`MegaWallsClass`) plus any class name found as a suffix on the raw `kills_`, `kills_new_`, `deaths_`, `deaths_new_`, `wins_`, `losses_`, `assists_`, `finalKills_`, and `finalAssists_` keys (matching `null` or a capitalized identifier). Kit blocks are always built for the full fixed kit list, so `kits` always contains all 27 kit keys.

---

## Returned type tree

### MegaWallsClass

The union of the 15 seed class names used to discover per-class maps.

```ts
type MegaWallsClass =
  | "Arcanist"
  | "Blaze"
  | "Creeper"
  | "Dreadlord"
  | "Enderman"
  | "Golem"
  | "Herobrine"
  | "Hunter"
  | "Pigman"
  | "Pirate"
  | "Shaman"
  | "Skeleton"
  | "Spider"
  | "Squid"
  | "Zombie";
```

### MegaWallsStats

The root object returned by `parseMegaWalls`.

```ts
interface MegaWallsStats {
  readonly coins: number;
  readonly witherCoins: number;
  readonly classPoints: number;
  readonly classPointsVersion: number;
  readonly mythicFavor: number;
  readonly exchangeFavorBought: number;
  readonly exchangeFavorSold: number;
  readonly newEnderchest: number;
  readonly newPrestige: number;
  readonly pickaxeLevel: number;
  readonly pickaxeRefunded: number;
  readonly playStreak: number;
  readonly refundedCoinsPp: number;
  readonly shoutTotal: number;
  readonly chosenClass: string;
  readonly chosenKillSign: string;
  readonly killMessage: string;
  readonly dreadlordEffect: string;
  readonly activeChallengeMap: string;
  readonly warCry: string;
  readonly smileyKills: string;
  readonly blood: boolean;
  readonly mutationsVisibility: boolean;
  readonly gvgDecide: boolean;
  readonly gvgEverybodyVotes: boolean;
  readonly faceOffJoinNoParty: boolean;
  readonly toggleHints: boolean;
  readonly toggleNotifications: boolean;
  readonly toggleSkillNotifications: boolean;
  readonly toggleInGameNightVision: boolean;
  readonly witherHealthHearts: boolean;
  readonly combatTracker: boolean;
  readonly warcryShortcuts: boolean;
  readonly tutorialCompleted: number;
  readonly endGameLeaderboard: string;
  readonly colorblind: MegaWallsColorblindSettings;
  readonly packages: readonly string[];
  readonly cakesFoundByName: readonly string[];
  readonly votes: Readonly<Record<string, number>>;
  readonly chosenSkins: Readonly<Record<string, string>>;
  readonly effects: Readonly<Record<string, string>>;
  readonly finalKillsLegacy: number;
  readonly finalKillsFaceOffLegacy: number;
  readonly finalKillsPracticeLegacy: number;
  readonly finalAssistsLegacy: number;
  readonly finalDeathsLegacy: number;
  readonly witherDamageLegacy: number;
  readonly killsNewLegacy: number;
  readonly killsPracticeLegacy: number;
  readonly deathsNewLegacy: number;
  readonly cakesFound: MegaWallsModeStats;
  readonly plays: MegaWallsPlays;
  readonly stats: MegaWallsActivityStats;
  readonly byClass: Readonly<Record<string, MegaWallsClassBreakdown>>;
  readonly legacyClassStats: Readonly<
    Record<string, Readonly<Record<string, number>>>
  >;
  readonly weekly: MegaWallsWeeklyStats;
  readonly monthly: MegaWallsMonthlyStats;
  readonly classes: Readonly<Record<string, MegaWallsClassProgress>>;
  readonly kits: Readonly<Record<string, MegaWallsKitStats>>;
  readonly kitInventories: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly leaderboardSettings: MegaWallsLeaderboardSettings;
  readonly healthWarningSettings: MegaWallsHealthWarningSettings;
  readonly privateGameSettings: MegaWallsPrivateGameSettings;
}
```

| Field                      | Raw source                    | Notes                                                                                |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `coins`                    | `coins`                       |                                                                                      |
| `witherCoins`              | `witherCoins`                 |                                                                                      |
| `classPoints`              | `class_points`                |                                                                                      |
| `classPointsVersion`       | `class_points_version`        |                                                                                      |
| `mythicFavor`              | `mythic_favor`                |                                                                                      |
| `exchangeFavorBought`      | `exchange_favor_bought`       |                                                                                      |
| `exchangeFavorSold`        | `exchange_favor_sold`         |                                                                                      |
| `newEnderchest`            | `new_echest`                  |                                                                                      |
| `newPrestige`              | `new_prestige`                |                                                                                      |
| `pickaxeLevel`             | `pickaxeLevel`                |                                                                                      |
| `pickaxeRefunded`          | `pickaxe_refunded`            |                                                                                      |
| `playStreak`               | `play_streak`                 |                                                                                      |
| `refundedCoinsPp`          | `refundedCoinsPP`             |                                                                                      |
| `shoutTotal`               | `shoutTotal`                  |                                                                                      |
| `chosenClass`              | `chosen_class`                |                                                                                      |
| `chosenKillSign`           | `chosen_kill_sign`            |                                                                                      |
| `killMessage`              | `kill_message`                |                                                                                      |
| `dreadlordEffect`          | `Dreadlord_effect`            |                                                                                      |
| `activeChallengeMap`       | `activeChallengeMap`          |                                                                                      |
| `warCry`                   | `war_cry`                     |                                                                                      |
| `smileyKills`              | `smiley_kills`                |                                                                                      |
| `blood`                    | `blood`                       |                                                                                      |
| `mutationsVisibility`      | `mutations_visibility`        |                                                                                      |
| `gvgDecide`                | `gvg_decide`                  |                                                                                      |
| `gvgEverybodyVotes`        | `gvg_everybodyvotes`          |                                                                                      |
| `faceOffJoinNoParty`       | `faceoff_join_noparty`        |                                                                                      |
| `toggleHints`              | `toggle_hints`                |                                                                                      |
| `toggleNotifications`      | `toggle_notifications`        |                                                                                      |
| `toggleSkillNotifications` | `toggle_skill_notifications`  |                                                                                      |
| `toggleInGameNightVision`  | `toggle_in_game_night_vision` |                                                                                      |
| `witherHealthHearts`       | `wither_health_hearts`        |                                                                                      |
| `combatTracker`            | `combatTracker`               |                                                                                      |
| `warcryShortcuts`          | `warcry_shortcuts`            |                                                                                      |
| `tutorialCompleted`        | `tutorial_completed`          |                                                                                      |
| `endGameLeaderboard`       | `end_game_leaderboard`        |                                                                                      |
| `packages`                 | `packages`                    | Filtered to string entries.                                                          |
| `cakesFoundByName`         | `cakes_found_by_name`         | Filtered to string entries.                                                          |
| `votes`                    | `votes_*`                     | `<map>` → numeric vote count.                                                        |
| `chosenSkins`              | `chosen_skin_*`               | `<class>` → skin string.                                                             |
| `effects`                  | `*_effect`                    | `<name>` → effect string (key is the part before `_effect`).                         |
| `finalKillsLegacy`         | `finalKills`                  |                                                                                      |
| `finalKillsFaceOffLegacy`  | `finalKills_face_off`         |                                                                                      |
| `finalKillsPracticeLegacy` | `finalKills_practice`         |                                                                                      |
| `finalAssistsLegacy`       | `finalAssists`                |                                                                                      |
| `finalDeathsLegacy`        | `finalDeaths`                 |                                                                                      |
| `witherDamageLegacy`       | `witherDamage`                |                                                                                      |
| `killsNewLegacy`           | `kills_new`                   |                                                                                      |
| `killsPracticeLegacy`      | `kills_practice`              |                                                                                      |
| `deathsNewLegacy`          | `deaths_new`                  |                                                                                      |
| `cakesFound`               | `cakes_found`                 | `MegaWallsModeStats` over the `cakes_found` base.                                    |
| `stats`                    | (no prefix)                   | `MegaWallsActivityStats` read from the root with an empty prefix.                    |
| `byClass`                  | per discovered class          | `MegaWallsClassBreakdown` per discovered class name.                                 |
| `legacyClassStats`         | `<Class>_<stat>` numbers      | Capitalized-prefixed numeric keys (excluding `*_effect`) grouped by class then stat. |
| `kits`                     | per kit                       | `MegaWallsKitStats` for each of the 27 fixed kit names.                              |
| `kitInventories`           | `*Inventory`                  | Each raw key ending `Inventory` → slot → item string map.                            |

---

## Shared stat shapes

### MegaWallsModeStats

The per-mode breakdown applied to most counters. Read from `<base>`, `<base>_standard`, `<base>_face_off`, `<base>_gvg`.

```ts
interface MegaWallsModeStats {
  readonly overall: number;
  readonly standard: number;
  readonly faceOff: number;
  readonly gvg: number;
}
```

### MegaWallsRecordStats

Like `MegaWallsModeStats` but with an extra `practice` mode. Used for `wins` and `losses`.

```ts
interface MegaWallsRecordStats {
  readonly overall: number;
  readonly standard: number;
  readonly faceOff: number;
  readonly gvg: number;
  readonly practice: number;
}
```

`practice` reads `<base>_practice`.

### MegaWallsKillStats

Mode breakdown plus melee sub-breakdowns. Used for `kills` and `finalKills`.

```ts
interface MegaWallsKillStats {
  readonly overall: number;
  readonly standard: number;
  readonly faceOff: number;
  readonly gvg: number;
  readonly melee: MegaWallsModeStats;
  readonly meleeBehind: MegaWallsModeStats;
}
```

| Field         | Raw source                                      |
| ------------- | ----------------------------------------------- |
| `overall`     | `<base>`                                        |
| `standard`    | `<base>_standard`                               |
| `faceOff`     | `<base>_face_off`                               |
| `gvg`         | `<base>_gvg`                                    |
| `melee`       | `MegaWallsModeStats` over `<base>_melee`        |
| `meleeBehind` | `MegaWallsModeStats` over `<base>_melee_behind` |

### MegaWallsActivationStats

Mode breakdown plus a deathmatch sub-breakdown. Base is `<prefix>activations`.

```ts
interface MegaWallsActivationStats {
  readonly overall: number;
  readonly standard: number;
  readonly faceOff: number;
  readonly gvg: number;
  readonly deathmatch: MegaWallsModeStats;
}
```

`deathmatch` is a `MegaWallsModeStats` over `<base>_deathmatch`.

### MegaWallsBlocksPlacedStats

Mode breakdown plus a preparation sub-breakdown. Base is `<prefix>blocks_placed`.

```ts
interface MegaWallsBlocksPlacedStats {
  readonly overall: number;
  readonly standard: number;
  readonly faceOff: number;
  readonly gvg: number;
  readonly preparation: MegaWallsModeStats;
}
```

`preparation` is a `MegaWallsModeStats` over `<base>_preparation`.

### MegaWallsDistanceStats

Mode breakdown plus a speed sub-breakdown. Base is `<prefix>meters_walked`.

```ts
interface MegaWallsDistanceStats {
  readonly overall: number;
  readonly standard: number;
  readonly faceOff: number;
  readonly gvg: number;
  readonly speed: MegaWallsModeStats;
}
```

`speed` is a `MegaWallsModeStats` over `<base>_speed`.

---

## Activity stats

### MegaWallsActivityStats

The main activity-counter block. It appears both at the root (`stats`, empty prefix) and per kit (`kits[kit].stats`, prefix `<kit>_`). Every field except the final seven is a `MegaWallsModeStats` read from `<prefix><raw_base>`. The trailing seven are the richer shapes (`kills`, `finalKills` as `MegaWallsKillStats`; `activations`, `blocksPlaced`, `metersWalked` as their named shapes; `wins`, `losses` as `MegaWallsRecordStats`).

```ts
interface MegaWallsActivityStats {
  readonly absorptionPotionsDrunk: MegaWallsModeStats;
  readonly alliesHealed: MegaWallsModeStats;
  readonly amountHealed: MegaWallsModeStats;
  readonly applesEaten: MegaWallsModeStats;
  readonly arrowsFired: MegaWallsModeStats;
  readonly arrowsFromRend: MegaWallsModeStats;
  readonly arrowsHit: MegaWallsModeStats;
  readonly assists: MegaWallsModeStats;
  readonly bedsCrafted: MegaWallsModeStats;
  readonly bedsPlaced: MegaWallsModeStats;
  readonly berserkedKills: MegaWallsModeStats;
  readonly blazesSpawned: MegaWallsModeStats;
  readonly blizzardSecondsSlow: MegaWallsModeStats;
  readonly blocksBroken: MegaWallsModeStats;
  readonly breadCrafted: MegaWallsModeStats;
  readonly breadEaten: MegaWallsModeStats;
  readonly bucketBarriersBroken: MegaWallsModeStats;
  readonly damageDealt: MegaWallsModeStats;
  readonly darkMatterArmor: MegaWallsModeStats;
  readonly deaths: MegaWallsModeStats;
  readonly defenderAssists: MegaWallsModeStats;
  readonly defenderFinalAssists: MegaWallsModeStats;
  readonly defenderFinalKills: MegaWallsModeStats;
  readonly defenderKills: MegaWallsModeStats;
  readonly diamondOreBroken: MegaWallsModeStats;
  readonly divineInterventions: MegaWallsModeStats;
  readonly endurancedFinalKills: MegaWallsModeStats;
  readonly enemiesHit: MegaWallsModeStats;
  readonly energyFromGrapplingHook: MegaWallsModeStats;
  readonly energySyphoned: MegaWallsModeStats;
  readonly finalAssists: MegaWallsModeStats;
  readonly finalAssistsAfterFinalKilled: MegaWallsModeStats;
  readonly finalAssistsMelee: MegaWallsModeStats;
  readonly finalDeaths: MegaWallsModeStats;
  readonly finalKillsAfterFinalKilled: MegaWallsModeStats;
  readonly finalKillsAfterGrapplingHook: MegaWallsModeStats;
  readonly finalKillsBelow10Hp: MegaWallsModeStats;
  readonly finalKillsBelow5Hp: MegaWallsModeStats;
  readonly finalKillsRanged: MegaWallsModeStats;
  readonly finalKillsRanged30: MegaWallsModeStats;
  readonly finalKillsRanged50: MegaWallsModeStats;
  readonly finalKillsWithFire: MegaWallsModeStats;
  readonly finalWaterKills: MegaWallsModeStats;
  readonly finalsWithStrength: MegaWallsModeStats;
  readonly fishEaten: MegaWallsModeStats;
  readonly foodEaten: MegaWallsModeStats;
  readonly forceOfNatureFinalAssists: MegaWallsModeStats;
  readonly forceOfNatureFinalKills: MegaWallsModeStats;
  readonly gamesBedsPlaced: MegaWallsModeStats;
  readonly gamesPlayed: MegaWallsModeStats;
  readonly goldenApplesEaten: MegaWallsModeStats;
  readonly healedLowTeammates: MegaWallsModeStats;
  readonly heroismTriggers: MegaWallsModeStats;
  readonly heroismTriggersInDm: MegaWallsModeStats;
  readonly innerInkBlinds: MegaWallsModeStats;
  readonly ironArmorGifted: MegaWallsModeStats;
  readonly ironArmorGiftedDecember: MegaWallsModeStats;
  readonly ironHeartAbsorption: MegaWallsModeStats;
  readonly ironOreBroken: MegaWallsModeStats;
  readonly ironSwordCrafted: MegaWallsModeStats;
  readonly junkItemsEaten: MegaWallsModeStats;
  readonly killsRanged: MegaWallsModeStats;
  readonly killsWithStrength: MegaWallsModeStats;
  readonly masterAlechmyHearts: MegaWallsModeStats;
  readonly metersFallen: MegaWallsModeStats;
  readonly metersTravelled: MegaWallsModeStats;
  readonly onFireFinalKills: MegaWallsModeStats;
  readonly onFireKills: MegaWallsModeStats;
  readonly perfectDisguises: MegaWallsModeStats;
  readonly playersHealed: MegaWallsModeStats;
  readonly potionsDrunk: MegaWallsModeStats;
  readonly potionsSplashed: MegaWallsModeStats;
  readonly primedTntKills: MegaWallsModeStats;
  readonly resistanceTimeSeconds: MegaWallsModeStats;
  readonly selfHealed: MegaWallsModeStats;
  readonly snowmenBuilt: MegaWallsModeStats;
  readonly snowmenPlayersHit: MegaWallsModeStats;
  readonly steaksEaten: MegaWallsModeStats;
  readonly strikesFromCloak: MegaWallsModeStats;
  readonly swordCrafted: MegaWallsModeStats;
  readonly timePlayed: MegaWallsModeStats;
  readonly totalDeaths: MegaWallsModeStats;
  readonly totalFinalKills: MegaWallsModeStats;
  readonly totalKills: MegaWallsModeStats;
  readonly treasuresFound: MegaWallsModeStats;
  readonly ultraPasteurizedDrank: MegaWallsModeStats;
  readonly venomStrikePoisonDamage: MegaWallsModeStats;
  readonly waterKills: MegaWallsModeStats;
  readonly witherDamage: MegaWallsModeStats;
  readonly witherKills: MegaWallsModeStats;
  readonly witherKillsLastAlive: MegaWallsModeStats;
  readonly woodChopped: MegaWallsModeStats;
  readonly kills: MegaWallsKillStats;
  readonly finalKills: MegaWallsKillStats;
  readonly activations: MegaWallsActivationStats;
  readonly blocksPlaced: MegaWallsBlocksPlacedStats;
  readonly metersWalked: MegaWallsDistanceStats;
  readonly wins: MegaWallsRecordStats;
  readonly losses: MegaWallsRecordStats;
}
```

Raw base for each `MegaWallsModeStats` field (read as `<prefix><raw_base>` and its `_standard` / `_face_off` / `_gvg` siblings):

| Field                          | Raw base                           |
| ------------------------------ | ---------------------------------- |
| `absorptionPotionsDrunk`       | `absorption_potions_drunk`         |
| `alliesHealed`                 | `allies_healed`                    |
| `amountHealed`                 | `amount_healed`                    |
| `applesEaten`                  | `apples_eaten`                     |
| `arrowsFired`                  | `arrows_fired`                     |
| `arrowsFromRend`               | `arrows_from_rend`                 |
| `arrowsHit`                    | `arrows_hit`                       |
| `assists`                      | `assists`                          |
| `bedsCrafted`                  | `beds_crafted`                     |
| `bedsPlaced`                   | `beds_placed`                      |
| `berserkedKills`               | `berserked_kills`                  |
| `blazesSpawned`                | `blazes_spawned`                   |
| `blizzardSecondsSlow`          | `blizzard_seconds_slow`            |
| `blocksBroken`                 | `blocks_broken`                    |
| `breadCrafted`                 | `bread_crafted`                    |
| `breadEaten`                   | `bread_eaten`                      |
| `bucketBarriersBroken`         | `bucket_barriers_broken`           |
| `damageDealt`                  | `damage_dealt`                     |
| `darkMatterArmor`              | `dark_matter_armor`                |
| `deaths`                       | `deaths`                           |
| `defenderAssists`              | `defender_assists`                 |
| `defenderFinalAssists`         | `defender_final_assists`           |
| `defenderFinalKills`           | `defender_final_kills`             |
| `defenderKills`                | `defender_kills`                   |
| `diamondOreBroken`             | `diamond_ore_broken`               |
| `divineInterventions`          | `divine_interventions`             |
| `endurancedFinalKills`         | `enduranced_final_kills`           |
| `enemiesHit`                   | `enemies_hit`                      |
| `energyFromGrapplingHook`      | `energy_from_grappling_hook`       |
| `energySyphoned`               | `energy_syphoned`                  |
| `finalAssists`                 | `final_assists`                    |
| `finalAssistsAfterFinalKilled` | `final_assists_after_final_killed` |
| `finalAssistsMelee`            | `final_assists_melee`              |
| `finalDeaths`                  | `final_deaths`                     |
| `finalKillsAfterFinalKilled`   | `final_kills_after_final_killed`   |
| `finalKillsAfterGrapplingHook` | `final_kills_after_grappling_hook` |
| `finalKillsBelow10Hp`          | `final_kills_below_10_hp`          |
| `finalKillsBelow5Hp`           | `final_kills_below_5_hp`           |
| `finalKillsRanged`             | `final_kills_ranged`               |
| `finalKillsRanged30`           | `final_kills_ranged_30`            |
| `finalKillsRanged50`           | `final_kills_ranged_50`            |
| `finalKillsWithFire`           | `final_kills_with_fire`            |
| `finalWaterKills`              | `final_water_kills`                |
| `finalsWithStrength`           | `finals_with_strength`             |
| `fishEaten`                    | `fish_eaten`                       |
| `foodEaten`                    | `food_eaten`                       |
| `forceOfNatureFinalAssists`    | `force_of_nature_final_assists`    |
| `forceOfNatureFinalKills`      | `force_of_nature_final_kills`      |
| `gamesBedsPlaced`              | `games_beds_placed`                |
| `gamesPlayed`                  | `games_played`                     |
| `goldenApplesEaten`            | `golden_apples_eaten`              |
| `healedLowTeammates`           | `healed_low_teammates`             |
| `heroismTriggers`              | `heroism_triggers`                 |
| `heroismTriggersInDm`          | `heroism_triggers_in_dm`           |
| `innerInkBlinds`               | `inner_ink_blinds`                 |
| `ironArmorGifted`              | `iron_armor_gifted`                |
| `ironArmorGiftedDecember`      | `iron_armor_gifted_december`       |
| `ironHeartAbsorption`          | `iron_heart_absorption`            |
| `ironOreBroken`                | `iron_ore_broken`                  |
| `ironSwordCrafted`             | `iron_sword_crafted`               |
| `junkItemsEaten`               | `junk_items_eaten`                 |
| `killsRanged`                  | `kills_ranged`                     |
| `killsWithStrength`            | `kills_with_strength`              |
| `masterAlechmyHearts`          | `master_alechmy_hearts`            |
| `metersFallen`                 | `meters_fallen`                    |
| `metersTravelled`              | `meters_travelled`                 |
| `onFireFinalKills`             | `on_fire_final_kills`              |
| `onFireKills`                  | `on_fire_kills`                    |
| `perfectDisguises`             | `perfect_disguises`                |
| `playersHealed`                | `players_healed`                   |
| `potionsDrunk`                 | `potions_drunk`                    |
| `potionsSplashed`              | `potions_splashed`                 |
| `primedTntKills`               | `primed_tnt_kills`                 |
| `resistanceTimeSeconds`        | `resistance_time_seconds`          |
| `selfHealed`                   | `self_healed`                      |
| `snowmenBuilt`                 | `snowmen_built`                    |
| `snowmenPlayersHit`            | `snowmen_players_hit`              |
| `steaksEaten`                  | `steaks_eaten`                     |
| `strikesFromCloak`             | `strikes_from_cloak`               |
| `swordCrafted`                 | `sword_crafted`                    |
| `timePlayed`                   | `time_played`                      |
| `totalDeaths`                  | `total_deaths`                     |
| `totalFinalKills`              | `total_final_kills`                |
| `totalKills`                   | `total_kills`                      |
| `treasuresFound`               | `treasures_found`                  |
| `ultraPasteurizedDrank`        | `ultra_pasteurized_drank`          |
| `venomStrikePoisonDamage`      | `venom_strike_poison_damage`       |
| `waterKills`                   | `water_kills`                      |
| `witherDamage`                 | `wither_damage`                    |
| `witherKills`                  | `wither_kills`                     |
| `witherKillsLastAlive`         | `wither_kills_last_alive`          |
| `woodChopped`                  | `wood_chopped`                     |

The richer trailing fields:

| Field          | Shape                        | Raw base                |
| -------------- | ---------------------------- | ----------------------- |
| `kills`        | `MegaWallsKillStats`         | `<prefix>kills`         |
| `finalKills`   | `MegaWallsKillStats`         | `<prefix>final_kills`   |
| `activations`  | `MegaWallsActivationStats`   | `<prefix>activations`   |
| `blocksPlaced` | `MegaWallsBlocksPlacedStats` | `<prefix>blocks_placed` |
| `metersWalked` | `MegaWallsDistanceStats`     | `<prefix>meters_walked` |
| `wins`         | `MegaWallsRecordStats`       | `<prefix>wins`          |
| `losses`       | `MegaWallsRecordStats`       | `<prefix>losses`        |

---

## Kits

### MegaWallsKitStats

One entry per kit (the 27 fixed kit names: `cow`, `hunter`, `shark`, `arcanist`, `dreadlord`, `golem`, `herobrine`, `pigman`, `zombie`, `blaze`, `enderman`, `shaman`, `squid`, `creeper`, `pirate`, `sheep`, `skeleton`, `spider`, `werewolf`, `angel`, `assassin`, `automaton`, `moleman`, `phoenix`, `renegade`, `snowman`, `dragon`). All values are read with the `<kit>_` prefix.

```ts
interface MegaWallsKitStats {
  readonly stats: MegaWallsActivityStats;
  readonly tiers: MegaWallsKitTiers;
  readonly newTiers: MegaWallsKitTiers;
  readonly infused: MegaWallsKitTiers;
  readonly enderchestLevel: number;
  readonly classPoints: number;
  readonly prestigeLevel: number;
  readonly reclaimed: number;
  readonly abilitySlots: MegaWallsKitAbilitySlots;
}
```

| Field             | Raw source                                                 |
| ----------------- | ---------------------------------------------------------- |
| `stats`           | `MegaWallsActivityStats` over prefix `<kit>_`.             |
| `tiers`           | `MegaWallsKitTiers` over prefix `<kit>_` (e.g. `<kit>_a`). |
| `newTiers`        | `MegaWallsKitTiers` over prefix `<kit>_new_`.              |
| `infused`         | `MegaWallsKitTiers` from `<kit>_<slot>_infused`.           |
| `enderchestLevel` | `<kit>_enderchest_level`                                   |
| `classPoints`     | `<kit>_class_points`                                       |
| `prestigeLevel`   | `<kit>_prestige_level`                                     |
| `reclaimed`       | `<kit>_reclaimed`                                          |
| `abilitySlots`    | `MegaWallsKitAbilitySlots` (slots `a`–`g`).                |

### MegaWallsKitTiers

```ts
interface MegaWallsKitTiers {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly g: number;
}
```

For `tiers` and `newTiers` each field reads `<prefix><slot>`; for `infused` each reads `<kit>_<slot>_infused`.

### MegaWallsKitAbilitySlots

The five ability slots of a kit. Slots `a`, `b`, `c` share the full ability-slot shape; `d` and `g` are leaner.

```ts
interface MegaWallsKitAbilitySlots {
  readonly a: MegaWallsAbilitySlotStats;
  readonly b: MegaWallsAbilitySlotStats;
  readonly c: MegaWallsAbilitySlotStats;
  readonly d: MegaWallsAbilityDSlotStats;
  readonly g: MegaWallsAbilityGSlotStats;
}
```

Each slot is read with the prefix `<kit>_<slot>_`.

### MegaWallsAbilitySlotStats

The ability-slot stat block for slots `a`, `b`, and `c`. Each leading field is a `MegaWallsModeStats` over `<prefix><raw_base>`; the trailing three are the richer shapes.

```ts
interface MegaWallsAbilitySlotStats {
  readonly alliesHealed: MegaWallsModeStats;
  readonly amountHealed: MegaWallsModeStats;
  readonly assists: MegaWallsModeStats;
  readonly blazesSpawned: MegaWallsModeStats;
  readonly blocksBroken: MegaWallsModeStats;
  readonly damageDealt: MegaWallsModeStats;
  readonly diamondOreBroken: MegaWallsModeStats;
  readonly defenderAssists: MegaWallsModeStats;
  readonly defenderFinalAssists: MegaWallsModeStats;
  readonly defenderFinalKills: MegaWallsModeStats;
  readonly defenderKills: MegaWallsModeStats;
  readonly endurancedFinalKills: MegaWallsModeStats;
  readonly enemiesHit: MegaWallsModeStats;
  readonly finalAssists: MegaWallsModeStats;
  readonly finalAssistsAfterFinalKilled: MegaWallsModeStats;
  readonly finalAssistsMelee: MegaWallsModeStats;
  readonly finalKillsAfterFinalKilled: MegaWallsModeStats;
  readonly finalKillsAfterGrapplingHook: MegaWallsModeStats;
  readonly finalKillsBelow10Hp: MegaWallsModeStats;
  readonly finalKillsBelow5Hp: MegaWallsModeStats;
  readonly healedLowTeammates: MegaWallsModeStats;
  readonly heroismTriggers: MegaWallsModeStats;
  readonly heroismTriggersInDm: MegaWallsModeStats;
  readonly innerInkBlinds: MegaWallsModeStats;
  readonly ironHeartAbsorption: MegaWallsModeStats;
  readonly ironOreBroken: MegaWallsModeStats;
  readonly junkItemsEaten: MegaWallsModeStats;
  readonly metersTravelled: MegaWallsModeStats;
  readonly onFireFinalKills: MegaWallsModeStats;
  readonly onFireKills: MegaWallsModeStats;
  readonly perfectDisguises: MegaWallsModeStats;
  readonly playersHealed: MegaWallsModeStats;
  readonly resistanceTimeSeconds: MegaWallsModeStats;
  readonly selfHealed: MegaWallsModeStats;
  readonly totalFinalKills: MegaWallsModeStats;
  readonly totalKills: MegaWallsModeStats;
  readonly venomStrikePoisonDamage: MegaWallsModeStats;
  readonly kills: MegaWallsKillStats;
  readonly finalKills: MegaWallsKillStats;
  readonly activations: MegaWallsActivationStats;
}
```

Raw base for each `MegaWallsModeStats` field:

| Field                          | Raw base                           |
| ------------------------------ | ---------------------------------- |
| `alliesHealed`                 | `allies_healed`                    |
| `amountHealed`                 | `amount_healed`                    |
| `assists`                      | `assists`                          |
| `blazesSpawned`                | `blazes_spawned`                   |
| `blocksBroken`                 | `blocks_broken`                    |
| `damageDealt`                  | `damage_dealt`                     |
| `diamondOreBroken`             | `diamond_ore_broken`               |
| `defenderAssists`              | `defender_assists`                 |
| `defenderFinalAssists`         | `defender_final_assists`           |
| `defenderFinalKills`           | `defender_final_kills`             |
| `defenderKills`                | `defender_kills`                   |
| `endurancedFinalKills`         | `enduranced_final_kills`           |
| `enemiesHit`                   | `enemies_hit`                      |
| `finalAssists`                 | `final_assists`                    |
| `finalAssistsAfterFinalKilled` | `final_assists_after_final_killed` |
| `finalAssistsMelee`            | `final_assists_melee`              |
| `finalKillsAfterFinalKilled`   | `final_kills_after_final_killed`   |
| `finalKillsAfterGrapplingHook` | `final_kills_after_grappling_hook` |
| `finalKillsBelow10Hp`          | `final_kills_below_10_hp`          |
| `finalKillsBelow5Hp`           | `final_kills_below_5_hp`           |
| `healedLowTeammates`           | `healed_low_teammates`             |
| `heroismTriggers`              | `heroism_triggers`                 |
| `heroismTriggersInDm`          | `heroism_triggers_in_dm`           |
| `innerInkBlinds`               | `inner_ink_blinds`                 |
| `ironHeartAbsorption`          | `iron_heart_absorption`            |
| `ironOreBroken`                | `iron_ore_broken`                  |
| `junkItemsEaten`               | `junk_items_eaten`                 |
| `metersTravelled`              | `meters_travelled`                 |
| `onFireFinalKills`             | `on_fire_final_kills`              |
| `onFireKills`                  | `on_fire_kills`                    |
| `perfectDisguises`             | `perfect_disguises`                |
| `playersHealed`                | `players_healed`                   |
| `resistanceTimeSeconds`        | `resistance_time_seconds`          |
| `selfHealed`                   | `self_healed`                      |
| `totalFinalKills`              | `total_final_kills`                |
| `totalKills`                   | `total_kills`                      |
| `venomStrikePoisonDamage`      | `venom_strike_poison_damage`       |

Trailing fields: `kills` (`MegaWallsKillStats` over `<prefix>kills`), `finalKills` (`MegaWallsKillStats` over `<prefix>final_kills`), `activations` (`MegaWallsActivationStats` over prefix).

### MegaWallsAbilityDSlotStats

The leaner shape for slot `d`.

```ts
interface MegaWallsAbilityDSlotStats {
  readonly activations: MegaWallsActivationStats;
  readonly selfHealed: MegaWallsModeStats;
}
```

| Field         | Raw source                                       |
| ------------- | ------------------------------------------------ |
| `activations` | `MegaWallsActivationStats` over prefix.          |
| `selfHealed`  | `MegaWallsModeStats` over `<prefix>self_healed`. |

### MegaWallsAbilityGSlotStats

The shape for slot `g`.

```ts
interface MegaWallsAbilityGSlotStats {
  readonly activations: MegaWallsActivationStats;
  readonly amountHealed: MegaWallsModeStats;
  readonly darkMatterArmor: MegaWallsModeStats;
  readonly selfHealed: MegaWallsModeStats;
}
```

| Field             | Raw source                                             |
| ----------------- | ------------------------------------------------------ |
| `activations`     | `MegaWallsActivationStats` over prefix.                |
| `amountHealed`    | `MegaWallsModeStats` over `<prefix>amount_healed`.     |
| `darkMatterArmor` | `MegaWallsModeStats` over `<prefix>dark_matter_armor`. |
| `selfHealed`      | `MegaWallsModeStats` over `<prefix>self_healed`.       |

---

## Per-class breakdowns

### MegaWallsClassBreakdown

One entry per discovered class in `byClass`. Read with the `<klass>` suffix on each raw key.

```ts
interface MegaWallsClassBreakdown {
  readonly kills: number;
  readonly killsNew: number;
  readonly deaths: number;
  readonly deathsNew: number;
  readonly wins: number;
  readonly losses: number;
  readonly assists: number;
  readonly finalKills: number;
  readonly finalAssists: number;
  readonly faceOffKills: number;
  readonly faceOffFinalKills: number;
  readonly faceOffWins: number;
  readonly faceOffLosses: number;
  readonly practiceKills: number;
  readonly practiceFinalKills: number;
  readonly practiceWins: number;
  readonly practiceLosses: number;
}
```

| Field                | Raw source                    |
| -------------------- | ----------------------------- |
| `kills`              | `kills_<klass>`               |
| `killsNew`           | `kills_new_<klass>`           |
| `deaths`             | `deaths_<klass>`              |
| `deathsNew`          | `deaths_new_<klass>`          |
| `wins`               | `wins_<klass>`                |
| `losses`             | `losses_<klass>`              |
| `assists`            | `assists_<klass>`             |
| `finalKills`         | `finalKills_<klass>`          |
| `finalAssists`       | `finalAssists_<klass>`        |
| `faceOffKills`       | `kills_face_off_<klass>`      |
| `faceOffFinalKills`  | `finalKills_face_off_<klass>` |
| `faceOffWins`        | `wins_face_off_<klass>`       |
| `faceOffLosses`      | `losses_face_off_<klass>`     |
| `practiceKills`      | `kills_practice_<klass>`      |
| `practiceFinalKills` | `finalKills_practice_<klass>` |
| `practiceWins`       | `wins_practice_<klass>`       |
| `practiceLosses`     | `losses_practice_<klass>`     |

### MegaWallsWeeklyClassBreakdown

One entry per discovered class in `weekly.byClass`. Read with the `<klass>` suffix.

```ts
interface MegaWallsWeeklyClassBreakdown {
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly finalKills: number;
  readonly faceOffKills: number;
  readonly faceOffWins: number;
  readonly faceOffLosses: number;
  readonly practiceKills: number;
  readonly practiceWins: number;
  readonly practiceLosses: number;
}
```

| Field            | Raw source                      |
| ---------------- | ------------------------------- |
| `kills`          | `weeklyKills_<klass>`           |
| `deaths`         | `weeklyDeaths_<klass>`          |
| `wins`           | `weeklyWins_<klass>`            |
| `losses`         | `weeklyLosses_<klass>`          |
| `finalKills`     | `weeklyFinalKills_<klass>`      |
| `faceOffKills`   | `weeklyKills_face_off_<klass>`  |
| `faceOffWins`    | `weeklyWins_face_off_<klass>`   |
| `faceOffLosses`  | `weeklyLosses_face_off_<klass>` |
| `practiceKills`  | `weeklyKills_practice_<klass>`  |
| `practiceWins`   | `weeklyWins_practice_<klass>`   |
| `practiceLosses` | `weeklyLosses_practice_<klass>` |

### MegaWallsPeriodTierFinalKills

Final-kills split across the two tracked tiers. Used throughout the weekly and monthly period blocks.

```ts
interface MegaWallsPeriodTierFinalKills {
  readonly a: number;
  readonly b: number;
}
```

Read as `<period>_finalKills_<klass>_a` and `<period>_finalKills_<klass>_b`, where `<period>` is `weekly` or `monthly` and `<klass>` is a class name or a mode token such as `face_off` / `practice`.

---

## Periodic stats

### MegaWallsWeeklyStats

```ts
interface MegaWallsWeeklyStats {
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly losses: number;
  readonly finalKills: number;
  readonly faceOffKills: number;
  readonly faceOffWins: number;
  readonly faceOffLosses: number;
  readonly practiceKills: number;
  readonly practiceWins: number;
  readonly practiceLosses: number;
  readonly byClass: Readonly<Record<string, MegaWallsWeeklyClassBreakdown>>;
  readonly finalKillsByTier: MegaWallsPeriodTierFinalKills;
  readonly finalKillsByTierFaceOff: MegaWallsPeriodTierFinalKills;
  readonly finalKillsByTierPractice: MegaWallsPeriodTierFinalKills;
  readonly finalKillsByClassTier: Readonly<
    Record<string, MegaWallsPeriodTierFinalKills>
  >;
  readonly finalKillsByClassTierFaceOff: Readonly<
    Record<string, MegaWallsPeriodTierFinalKills>
  >;
  readonly finalKillsByClassTierPractice: Readonly<
    Record<string, MegaWallsPeriodTierFinalKills>
  >;
}
```

| Field                           | Raw source                                               |
| ------------------------------- | -------------------------------------------------------- |
| `kills`                         | `weeklyKills`                                            |
| `deaths`                        | `weeklyDeaths`                                           |
| `wins`                          | `weeklyWins`                                             |
| `losses`                        | `weeklyLosses`                                           |
| `finalKills`                    | `weeklyFinalKills`                                       |
| `faceOffKills`                  | `weeklyKills_face_off`                                   |
| `faceOffWins`                   | `weeklyWins_face_off`                                    |
| `faceOffLosses`                 | `weeklyLosses_face_off`                                  |
| `practiceKills`                 | `weeklyKills_practice`                                   |
| `practiceWins`                  | `weeklyWins_practice`                                    |
| `practiceLosses`                | `weeklyLosses_practice`                                  |
| `byClass`                       | `MegaWallsWeeklyClassBreakdown` per discovered class.    |
| `finalKillsByTier`              | `weekly_finalKills_a` / `weekly_finalKills_b`.           |
| `finalKillsByTierFaceOff`       | `weekly_finalKills_face_off_a` / `_b`.                   |
| `finalKillsByTierPractice`      | `weekly_finalKills_practice_a` / `_b`.                   |
| `finalKillsByClassTier`         | `weekly_finalKills_<klass>_a` / `_b` per class.          |
| `finalKillsByClassTierFaceOff`  | `weekly_finalKills_face_off_<klass>_a` / `_b` per class. |
| `finalKillsByClassTierPractice` | `weekly_finalKills_practice_<klass>_a` / `_b` per class. |

### MegaWallsMonthlyStats

```ts
interface MegaWallsMonthlyStats {
  readonly finalKillsByTier: MegaWallsPeriodTierFinalKills;
  readonly finalKillsByTierFaceOff: MegaWallsPeriodTierFinalKills;
  readonly finalKillsByTierPractice: MegaWallsPeriodTierFinalKills;
  readonly finalKillsByClassTier: Readonly<
    Record<string, MegaWallsPeriodTierFinalKills>
  >;
  readonly finalKillsByClassTierFaceOff: Readonly<
    Record<string, MegaWallsPeriodTierFinalKills>
  >;
  readonly finalKillsByClassTierPractice: Readonly<
    Record<string, MegaWallsPeriodTierFinalKills>
  >;
}
```

| Field                           | Raw source                                                |
| ------------------------------- | --------------------------------------------------------- |
| `finalKillsByTier`              | `monthly_finalKills_a` / `monthly_finalKills_b`.          |
| `finalKillsByTierFaceOff`       | `monthly_finalKills_face_off_a` / `_b`.                   |
| `finalKillsByTierPractice`      | `monthly_finalKills_practice_a` / `_b`.                   |
| `finalKillsByClassTier`         | `monthly_finalKills_<klass>_a` / `_b` per class.          |
| `finalKillsByClassTierFaceOff`  | `monthly_finalKills_face_off_<klass>_a` / `_b` per class. |
| `finalKillsByClassTierPractice` | `monthly_finalKills_practice_<klass>_a` / `_b` per class. |

### MegaWallsPlays

```ts
interface MegaWallsPlays {
  readonly standard: number;
  readonly faceOff: number;
  readonly practice: number;
}
```

| Field      | Raw source       |
| ---------- | ---------------- |
| `standard` | `plays_standard` |
| `faceOff`  | `plays_face_off` |
| `practice` | `plays_practice` |

---

## Class progress

### MegaWallsClassProgress

One entry per key in the raw `classes` object (non-object entries are skipped). Read with the per-class progress object.

```ts
interface MegaWallsClassProgress {
  readonly unlocked: boolean;
  readonly prestige: number;
  readonly enderchestRows: number;
  readonly goldenTag: boolean;
  readonly checked: boolean;
  readonly checked2: boolean;
  readonly checked3: boolean;
  readonly checked4: boolean;
  readonly prestigeChecked: boolean;
  readonly prestigeChecked2: boolean;
  readonly prestigeChecked4: boolean;
  readonly skillLevels: MegaWallsClassSkillLevels;
  readonly skillLevelsChecked: MegaWallsClassSkillFlags;
  readonly skillLevelsChecked4: MegaWallsClassSkillFlags;
  readonly skillLevelsChecked5: MegaWallsClassSkillFlags;
  readonly prestigeTag: MegaWallsPrestigeTag;
}
```

| Field                 | Raw source                                         |
| --------------------- | -------------------------------------------------- |
| `unlocked`            | `unlocked`                                         |
| `prestige`            | `prestige`                                         |
| `enderchestRows`      | `enderchest_rows`                                  |
| `goldenTag`           | `golden_tag`                                       |
| `checked`             | `checked`                                          |
| `checked2`            | `checked2`                                         |
| `checked3`            | `checked3`                                         |
| `checked4`            | `checked4`                                         |
| `prestigeChecked`     | `prestigeChecked`                                  |
| `prestigeChecked2`    | `prestigeChecked2`                                 |
| `prestigeChecked4`    | `prestigeChecked4`                                 |
| `skillLevels`         | `MegaWallsClassSkillLevels`.                       |
| `skillLevelsChecked`  | `MegaWallsClassSkillFlags` with suffix `Checked`.  |
| `skillLevelsChecked4` | `MegaWallsClassSkillFlags` with suffix `Checked4`. |
| `skillLevelsChecked5` | `MegaWallsClassSkillFlags` with suffix `Checked5`. |
| `prestigeTag`         | `MegaWallsPrestigeTag` from `prestige_tag`.        |

### MegaWallsClassSkillLevels

```ts
interface MegaWallsClassSkillLevels {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly g: number;
}
```

Each field reads `skill_level_<slot>`.

### MegaWallsClassSkillFlags

```ts
interface MegaWallsClassSkillFlags {
  readonly a: boolean;
  readonly b: boolean;
  readonly c: boolean;
  readonly d: boolean;
  readonly g: boolean;
}
```

Each field reads `skill_level_<slot><suffix>`, where `<suffix>` is `Checked`, `Checked4`, or `Checked5` depending on the parent field.

### MegaWallsPrestigeTag

Read from the per-class `prestige_tag` object.

```ts
interface MegaWallsPrestigeTag {
  readonly classPointsShowcase: boolean;
  readonly type: string;
}
```

| Field                 | Raw source              |
| --------------------- | ----------------------- |
| `classPointsShowcase` | `class_points_showcase` |
| `type`                | `type`                  |

---

## Settings and cosmetics

### MegaWallsColorblindSettings

Read from the `colorblind*` keys at the root.

```ts
interface MegaWallsColorblindSettings {
  readonly enabled: boolean;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly red: string;
  readonly green: string;
  readonly blue: string;
  readonly yellow: string;
}
```

| Field     | Raw source          |
| --------- | ------------------- |
| `enabled` | `colorblind`        |
| `bold`    | `colorblind_bold`   |
| `italic`  | `colorblind_italic` |
| `red`     | `colorblind_red`    |
| `green`   | `colorblind_green`  |
| `blue`    | `colorblind_blue`   |
| `yellow`  | `colorblind_yellow` |

### MegaWallsLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface MegaWallsLeaderboardSettings {
  readonly resetType: string;
  readonly class: string;
}
```

| Field       | Raw source  |
| ----------- | ----------- |
| `resetType` | `resetType` |
| `class`     | `class`     |

### MegaWallsHealthWarningSettings

Read from the raw `settings` object.

```ts
interface MegaWallsHealthWarningSettings {
  readonly half: boolean;
  readonly low: boolean;
  readonly veryLow: boolean;
  readonly extremelyLow: boolean;
  readonly dangerouslyLow: boolean;
}
```

| Field            | Raw source       |
| ---------------- | ---------------- |
| `half`           | `half`           |
| `low`            | `low`            |
| `veryLow`        | `veryLow`        |
| `extremelyLow`   | `extremelyLow`   |
| `dangerouslyLow` | `dangerouslyLow` |

### MegaWallsPrivateGameSettings

Read from the raw `privategames` object.

```ts
interface MegaWallsPrivateGameSettings {
  readonly timeOfDay: string;
  readonly preparationTime: string;
  readonly witherHealth: string;
  readonly instantDeathmatch: string;
  readonly energyGain: string;
}
```

| Field               | Raw source           |
| ------------------- | -------------------- |
| `timeOfDay`         | `time_of_day`        |
| `preparationTime`   | `preparation_time`   |
| `witherHealth`      | `wither_health`      |
| `instantDeathmatch` | `instant_deathmatch` |
| `energyGain`        | `energy_gain`        |
