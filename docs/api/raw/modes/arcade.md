# Arcade

The Arcade module exposes a single parser, `parseArcade`, which mirrors the raw `stats.Arcade` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseArcade

Parses a player's Arcade stats (`stats.Arcade`) into a typed object.

```ts
function parseArcade(stats: Record<string, unknown>): ArcadeStats | null;
```

### Null / empty behavior

`parseArcade` reads the `Arcade` object out of the passed `stats`. If that object has no keys (absent or empty), it returns `null`. Otherwise every field below is always present on the returned object: missing numbers default to `0`, missing booleans to `false`, missing strings to `""`, missing string arrays to `[]`, and missing record/map blocks to `{}` (per the shared `num`/`bool`/`str`/`obj` helpers and the local list/map helpers).

The dynamic record fields (`pixelPartyColorblind.customPresets`, `disasters.deaths`, `disasters.survived`, and the `inventoryLayout` of Mini Walls and Wool Hunt) contain only the keys present in the raw data, so they may be empty objects when no data exists.

Some fields fall back to alternate raw keys:

| Field           | Raw source                                          |
| --------------- | --------------------------------------------------- |
| `coins`         | `coins`, falling back to `tokens`                   |
| `weeklyTokensA` | `weekly_tokens_a`, falling back to `weekly_coins_a` |
| `weeklyTokensB` | `weekly_tokens_b`, falling back to `weekly_coins_b` |

Boolean `options` fields use a string convention: each is `true` only when its raw `option_*` value equals the string `"on"`.

---

## Returned type tree

### ArcadeStats

The root object returned by `parseArcade`.

```ts
interface ArcadeStats {
  readonly coins: number;
  readonly monthlyTokensA: number;
  readonly monthlyTokensB: number;
  readonly weeklyTokensA: number;
  readonly weeklyTokensB: number;
  readonly mysteryGiftsObtained: number;
  readonly poopCollected: number;
  readonly maxWave: number;
  readonly stampLevel: number;
  readonly timestamp: number;
  readonly lastTourneyAd: number;
  readonly blood: boolean;
  readonly flash: boolean;
  readonly hints: boolean;
  readonly music: boolean;
  readonly showInfoBook: boolean;
  readonly persistArcadeResourcePack: string;
  readonly dec2016Achievements: boolean;
  readonly dec2016Achievements2: boolean;
  readonly bountyHead: string;
  readonly meleeWeapon: string;
  readonly language: string;
  readonly shopSort: string;
  readonly shopSortEnableOwnedFirst: boolean;
  readonly activeMovementTrail: string;
  readonly activeProjectileTrail: string;
  readonly activeVictoryDance: string;
  readonly pixelPartyHelmet: string;
  readonly pixelPartyPants: string;
  readonly pixelPartyMusicVolume: number;
  readonly packages: readonly string[];
  readonly leaderboardSettings: ArcadeLeaderboardSettings;
  readonly options: ArcadeOptions;
  readonly privateGames: ArcadePrivateGamesSettings;
  readonly blockingDead: ArcadeBlockingDeadStats;
  readonly dragonWars: ArcadeDragonWarsStats;
  readonly pixelPainters: ArcadePixelPaintersStats;
  readonly pixelParty: ArcadePixelPartyStats;
  readonly pixelPartyColorblind: ArcadePixelPartyColorblind;
  readonly disasters: ArcadeDisastersStats;
  readonly dtt: ArcadeDttSettings;
  readonly dropper: ArcadeDropperStats;
  readonly easterSimulator: ArcadeEasterSimulatorStats;
  readonly enderSpleef: ArcadeEnderSpleefStats;
  readonly farmHunt: ArcadeFarmHuntStats;
  readonly galaxyWars: ArcadeGalaxyWarsStats;
  readonly grinchSimulator: ArcadeGrinchSimulatorStats;
  readonly halloweenSimulator: ArcadeHalloweenSimulatorStats;
  readonly hideAndSeek: ArcadeHideAndSeekStats;
  readonly holeInTheWall: ArcadeHoleInTheWallStats;
  readonly hypixelSports: ArcadeHypixelSportsStats;
  readonly miniWalls: ArcadeMiniWallsStats;
  readonly bountyHunters: ArcadeBountyHuntersStats;
  readonly partyGames: ArcadePartyGamesStats;
  readonly santaSays: ArcadeSantaSaysStats;
  readonly santaSimulator: ArcadeSantaSimulatorStats;
  readonly santaSimulatorSeasonal: ArcadeSantaSimulatorSeasonalStats;
  readonly scubaSimulator: ArcadeScubaSimulatorStats;
  readonly hypixelSays: ArcadeHypixelSaysStats;
  readonly soccer: ArcadeSoccerStats;
  readonly throwOut: ArcadeThrowOutStats;
  readonly grind: ArcadeGrindStats;
  readonly splatoon: ArcadeSplatoonStats;
  readonly volleyball: ArcadeVolleyballStats;
  readonly spaceRaiders: ArcadeSpaceRaidersStats;
  readonly pumpkinSpleef: ArcadePumpkinSpleefStats;
  readonly woolHunt: ArcadeWoolHuntStats;
  readonly zombies: ArcadeZombiesStats;
}
```

Notable top-level fields:

| Field                                                                | Raw key                                                                    | Notes                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| `coins`                                                              | `coins` or `tokens`                                                        | Arcade currency total.         |
| `monthlyTokensA` / `monthlyTokensB`                                  | `monthly_coins_a` / `monthly_coins_b`                                      | Monthly token buckets.         |
| `weeklyTokensA` / `weeklyTokensB`                                    | `weekly_tokens_a`/`weekly_coins_a`, `weekly_tokens_b`/`weekly_coins_b`     | Weekly token buckets.          |
| `timestamp`                                                          | `time_stamp`                                                               | Raw timestamp value.           |
| `lastTourneyAd`                                                      | `lastTourneyAd`                                                            | Raw value.                     |
| `showInfoBook`                                                       | `showinfobook`                                                             | Boolean.                       |
| `dec2016Achievements` / `dec2016Achievements2`                       | `dec2016_achievements` / `dec2016_achievements2`                           | Booleans.                      |
| `bountyHead`, `meleeWeapon`                                          | `bounty_head`, `melee_weapon`                                              | Cosmetic / loadout strings.    |
| `shopSortEnableOwnedFirst`                                           | `shop_sort_enable_owned_first`                                             | Boolean.                       |
| `activeMovementTrail`, `activeProjectileTrail`, `activeVictoryDance` | `active_movement_trail`, `active_projectile_trail`, `active_victory_dance` | Active cosmetic strings.       |
| `pixelPartyHelmet`, `pixelPartyPants`                                | `pixelparty_helmet`, `pixelparty_pants`                                    | Cosmetic strings.              |
| `pixelPartyMusicVolume`                                              | `pixel_party_music_volume`                                                 | Number.                        |
| `packages`                                                           | `packages`                                                                 | List of owned package strings. |

---

## Settings

### ArcadeLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface ArcadeLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

### ArcadeOptions

Arcade option toggles. Each field is `true` only when its raw `option_*` value equals `"on"`.

```ts
interface ArcadeOptions {
  readonly showTutorialBook: boolean;
  readonly showTips: boolean;
  readonly showTipHologram: boolean;
  readonly showAllKillfeed: boolean;
  readonly showOwnWoolPickedUp: boolean;
  readonly showOwnWoolDropped: boolean;
  readonly showEnemyWoolPickedUp: boolean;
  readonly showEnemyWoolDropped: boolean;
}
```

| Field                   | Raw key                            |
| ----------------------- | ---------------------------------- |
| `showTutorialBook`      | `option_show_tutorial_book`        |
| `showTips`              | `option_show_tips`                 |
| `showTipHologram`       | `option_show_tip_hologram`         |
| `showAllKillfeed`       | `option_show_all_killfeed`         |
| `showOwnWoolPickedUp`   | `option_show_own_wool_picked_up`   |
| `showOwnWoolDropped`    | `option_show_own_wool_dropped`     |
| `showEnemyWoolPickedUp` | `option_show_enemy_wool_picked_up` |
| `showEnemyWoolDropped`  | `option_show_enemy_wool_dropped`   |

### ArcadePrivateGamesSettings

Read from the raw `privategames` object.

```ts
interface ArcadePrivateGamesSettings {
  readonly healthBuff: string;
  readonly naturalRegeneration: string;
  readonly noFallDamage: boolean;
  readonly permanentPvp: boolean;
  readonly powerUpAbundance: string;
  readonly mapsForEasy: string;
  readonly mapsForMedium: string;
  readonly mapsForHard: string;
}
```

| Field                 | Raw key                |
| --------------------- | ---------------------- |
| `healthBuff`          | `health_buff`          |
| `naturalRegeneration` | `natural_regeneration` |
| `noFallDamage`        | `no_fall_damage`       |
| `permanentPvp`        | `permanent_pvp`        |
| `powerUpAbundance`    | `power_up_abundance`   |
| `mapsForEasy`         | `maps_for_easy`        |
| `mapsForMedium`       | `maps_for_medium`      |
| `mapsForHard`         | `maps_for_hard`        |

### ArcadeDttSettings

Draw Their Thing UI toggles (raw `dtt_dropdown`, `dtt_filter`, `dtt_music`).

```ts
interface ArcadeDttSettings {
  readonly dropdown: boolean;
  readonly filter: boolean;
  readonly music: boolean;
}
```

---

## Per-game stat types

### ArcadeBlockingDeadStats

Blocking Dead stats (raw `*_dayone` keys).

```ts
interface ArcadeBlockingDeadStats {
  readonly wins: number;
  readonly kills: number;
  readonly headshots: number;
}
```

### ArcadeDragonWarsStats

Dragon Wars stats (raw `*_dragonwars2` keys).

```ts
interface ArcadeDragonWarsStats {
  readonly wins: number;
  readonly kills: number;
}
```

### ArcadePixelPaintersStats

Pixel Painters stats (raw `wins_draw_their_thing` and `paintedBlocks`).

```ts
interface ArcadePixelPaintersStats {
  readonly wins: number;
  readonly paintedBlocks: number;
}
```

### ArcadePixelPartyStats

Pixel Party stats from the raw `pixel_party` object, including per-mode breakdowns. `language` reads the top-level raw `pp_language` key.

```ts
interface ArcadePixelPartyStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly highestRound: number;
  readonly powerUpsCollected: number;
  readonly roundsCompleted: number;
  readonly language: string;
  readonly normal: ArcadePixelPartyModeStats;
  readonly hyper: ArcadePixelPartyModeStats;
}
```

### ArcadePixelPartyModeStats

Per-mode Pixel Party stats. `normal` reads the `_normal` suffixed keys and `hyper` reads the `_hyper` suffixed keys.

```ts
interface ArcadePixelPartyModeStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly powerUpsCollected: number;
  readonly roundsCompleted: number;
}
```

### ArcadePixelPartyColorblind

Pixel Party colorblind settings from the raw `pixelparty` object. `preset` reads `colorblind_preset`; `customPresets` (raw `colorblind_custom_presets`) maps each preset name to a list of strings.

```ts
interface ArcadePixelPartyColorblind {
  readonly preset: string;
  readonly customPresets: Readonly<Record<string, readonly string[]>>;
}
```

### ArcadeDisastersStats

Disasters stats from the raw `disasters.stats` object. `deaths` and `survived` are raw number maps keyed by their original raw entry names.

```ts
interface ArcadeDisastersStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly losses: number;
  readonly timeSurvived: number;
  readonly deaths: Readonly<Record<string, number>>;
  readonly survived: Readonly<Record<string, number>>;
}
```

### ArcadeDropperStats

The Dropper stats from the raw `dropper` object. `maps` is a fixed record keyed by `ArcadeDropperMapName` (see below), each value an `ArcadeDropperMap`.

```ts
interface ArcadeDropperStats {
  readonly wins: number;
  readonly fails: number;
  readonly fastestGame: number;
  readonly flawlessGames: number;
  readonly gamesPlayed: number;
  readonly gamesFinished: number;
  readonly mapsCompleted: number;
  readonly maps: Readonly<Record<ArcadeDropperMapName, ArcadeDropperMap>>;
}
```

### ArcadeDropperMap

Per-map Dropper stats from `dropper.map_stats[<map>]`.

```ts
interface ArcadeDropperMap {
  readonly bestTime: number;
  readonly completions: number;
}
```

The `ArcadeDropperMapName` union (record keys for `maps`):

```ts
type ArcadeDropperMapName =
  | "atlantis"
  | "balloons"
  | "bbq"
  | "beanstalk"
  | "birdcage"
  | "boardGames"
  | "bridges"
  | "butterflies"
  | "cabin"
  | "castle"
  | "city"
  | "distance"
  | "distortion"
  | "drainage"
  | "emoji"
  | "factory"
  | "floatingIslands"
  | "flytrap"
  | "frogspawn"
  | "gears"
  | "geometry"
  | "glacier"
  | "hellgate"
  | "illusion"
  | "iris"
  | "kingDommines"
  | "kingsPass"
  | "kraken"
  | "launchZone"
  | "lavaFall"
  | "lily"
  | "maelstrom"
  | "mainframe"
  | "microscope"
  | "mineshaft"
  | "mushroom"
  | "nightlife"
  | "ocean"
  | "overgrown"
  | "painted"
  | "paradigm"
  | "plughole"
  | "raindrops"
  | "ravine"
  | "retro"
  | "revolve"
  | "sandWorm"
  | "sewer"
  | "space"
  | "stratocumulus"
  | "sweets"
  | "tangle"
  | "time"
  | "toilet"
  | "ufo"
  | "upsideDown"
  | "vintage"
  | "vortex"
  | "warp"
  | "warPortal"
  | "well"
  | "western";
```

### ArcadeEasterSimulatorStats

Easter Simulator stats (raw `*_easter_simulator` keys).

```ts
interface ArcadeEasterSimulatorStats {
  readonly wins: number;
  readonly eggsFound: number;
}
```

### ArcadeEnderSpleefStats

Ender Spleef stats (raw `*_ender` keys plus `enderspleef_trail`).

```ts
interface ArcadeEnderSpleefStats {
  readonly wins: number;
  readonly blocksDestroyed: number;
  readonly spleefTrail: string;
  readonly powerupActivations: number;
  readonly bigshotPowerupActivations: number;
  readonly tripleshotPowerupActivations: number;
}
```

### ArcadeFarmHuntStats

Farm Hunt stats (raw `*_farm_hunt` keys).

```ts
interface ArcadeFarmHuntStats {
  readonly wins: number;
  readonly kills: number;
  readonly poopCollected: number;
  readonly bowKills: number;
  readonly animalWins: number;
  readonly animalKills: number;
  readonly animalBowKills: number;
  readonly animalsBowKills: number;
  readonly hunterWins: number;
  readonly hunterKills: number;
  readonly hunterBowKills: number;
  readonly huntersBowKills: number;
  readonly tauntsUsed: number;
  readonly safeTauntsUsed: number;
  readonly riskyTauntsUsed: number;
  readonly dangerousTauntsUsed: number;
  readonly fireworkTauntsUsed: number;
}
```

### ArcadeGalaxyWarsStats

Galaxy Wars stats (raw `sw_*` keys).

```ts
interface ArcadeGalaxyWarsStats {
  readonly gameWins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly empireKills: number;
  readonly rebelKills: number;
  readonly shotsFired: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
}
```

### ArcadeGrinchSimulatorStats

Grinch Simulator stats (raw `*_grinch_simulator_v2` keys, including tourney variants).

```ts
interface ArcadeGrinchSimulatorStats {
  readonly wins: number;
  readonly gifts: number;
  readonly winsTourney: number;
  readonly giftsTourney: number;
  readonly lossesTourney: number;
  readonly winsTourneyGrinchSimulatorOne: number;
  readonly giftsTourneyGrinchSimulatorOne: number;
  readonly lossesTourneyGrinchSimulatorOne: number;
}
```

### ArcadeHalloweenSimulatorStats

Halloween Simulator stats (raw `*_halloween_simulator` keys).

```ts
interface ArcadeHalloweenSimulatorStats {
  readonly wins: number;
  readonly candyFound: number;
}
```

### ArcadeHideAndSeekStats

Hide and Seek stats (raw `*_hide_and_seek` keys across the Party Pooper and Prop Hunt variants). `showQueueBook` reads `hideandseek_showqueuebook`.

```ts
interface ArcadeHideAndSeekStats {
  readonly hiderWins: number;
  readonly seekerWins: number;
  readonly partyPooperHiderWins: number;
  readonly partyPooperSeekerWins: number;
  readonly propHuntHiderWins: number;
  readonly propHuntSeekerWins: number;
  readonly showQueueBook: boolean;
}
```

### ArcadeHoleInTheWallStats

Hole in the Wall stats (raw `*_hole_in_the_wall` and `hitw_*` keys). `recordFinish` reads `hitw_record_f`, `recordQualification` reads `hitw_record_q`, and `perfectTitle` reads `hitwPerfectTitle`.

```ts
interface ArcadeHoleInTheWallStats {
  readonly wins: number;
  readonly rounds: number;
  readonly color: string;
  readonly recordFinish: number;
  readonly recordQualification: number;
  readonly perfectTitle: boolean;
}
```

### ArcadeHypixelSportsStats

Hypixel Sports stats (raw `wins_hypixel_sports`).

```ts
interface ArcadeHypixelSportsStats {
  readonly wins: number;
}
```

### ArcadeMiniWallsStats

Mini Walls stats (raw `*_mini_walls` keys plus `*_tourney_mini_walls_0` variants). `activeKit` reads `miniwalls_activeKit`; `inventoryLayout` (raw `mini_walls_inventory_layout`) is a raw number map.

```ts
interface ArcadeMiniWallsStats {
  readonly wins: number;
  readonly kills: number;
  readonly finalKills: number;
  readonly deaths: number;
  readonly witherKills: number;
  readonly witherDamage: number;
  readonly arrowsHit: number;
  readonly arrowsShot: number;
  readonly winsTourney: number;
  readonly killsTourney: number;
  readonly finalKillsTourney: number;
  readonly deathsTourney: number;
  readonly witherKillsTourney: number;
  readonly witherDamageTourney: number;
  readonly arrowsHitTourney: number;
  readonly arrowsShotTourney: number;
  readonly activeKit: string;
  readonly inventoryLayout: Readonly<Record<string, number>>;
}
```

### ArcadeBountyHuntersStats

Bounty Hunters stats (raw `*_oneinthequiver` keys).

```ts
interface ArcadeBountyHuntersStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly bowKills: number;
  readonly swordKills: number;
  readonly bountyKills: number;
}
```

### ArcadePartyGamesStats

Party Games stats (raw `*_party` keys). `games` is a fixed record keyed by `ArcadePartyGameName`, each value an `ArcadePartyGameStats`.

```ts
interface ArcadePartyGamesStats {
  readonly wins: number;
  readonly wins2: number;
  readonly wins3: number;
  readonly roundWins: number;
  readonly totalStars: number;
  readonly games: Readonly<Record<ArcadePartyGameName, ArcadePartyGameStats>>;
}
```

### ArcadePartyGameStats

Per-game Party Games stats. Each game reads `<game>_best_score_party`, `<game>_best_time_party`, `<game>_kills_party`, `<game>_round_wins_party`, and `<game>_total_score_party`. Two games override certain raw keys: `lawnMoower` sources `bestScore`/`totalScore` from `lawn_moower_mowed_best_score_party` / `lawn_moower_mowed_total_score_party`, and `rpg16` sources `bestScore` from `rpg_16_kills_best_score_party`.

```ts
interface ArcadePartyGameStats {
  readonly bestScore: number;
  readonly bestTime: number;
  readonly kills: number;
  readonly roundWins: number;
  readonly totalScore: number;
}
```

The `ArcadePartyGameName` union (record keys for `games`):

```ts
type ArcadePartyGameName =
  | "animalSlaughter"
  | "anvilSpleef"
  | "avalanche"
  | "bombardment"
  | "cannonPainting"
  | "chickenRings"
  | "dive"
  | "fireLeapers"
  | "frozenFloor"
  | "highGround"
  | "hoeHoeHoe"
  | "jigsawRush"
  | "jungleJump"
  | "labEscape"
  | "lawnMoower"
  | "minecartRacing"
  | "pigFishing"
  | "pigJousting"
  | "rpg16"
  | "shootingRange"
  | "spiderMaze"
  | "superSheep"
  | "theFloorIsLava"
  | "trampolinio"
  | "volcano"
  | "workshop";
```

### ArcadeSantaSaysStats

Santa Says stats (raw `*_santa_says` keys).

```ts
interface ArcadeSantaSaysStats {
  readonly wins: number;
  readonly rounds: number;
  readonly roundWins: number;
  readonly topScore: number;
}
```

### ArcadeSantaSimulatorStats

Santa Simulator stats (raw `*_santa_simulator` keys).

```ts
interface ArcadeSantaSimulatorStats {
  readonly wins: number;
  readonly delivered: number;
  readonly spotted: number;
}
```

### ArcadeSantaSimulatorSeasonalStats

Seasonal Santa Simulator stats (raw `*_ss_SANTA_SIMULATOR` keys).

```ts
interface ArcadeSantaSimulatorSeasonalStats {
  readonly wins: number;
  readonly delivered: number;
  readonly spotted: number;
}
```

### ArcadeScubaSimulatorStats

Scuba Simulator stats (raw `*_scuba_simulator` keys).

```ts
interface ArcadeScubaSimulatorStats {
  readonly wins: number;
  readonly itemsFound: number;
  readonly totalPoints: number;
}
```

### ArcadeHypixelSaysStats

Hypixel Says stats (raw `*_simon_says` keys). `song` reads `simon_song`.

```ts
interface ArcadeHypixelSaysStats {
  readonly wins: number;
  readonly rounds: number;
  readonly roundWins: number;
  readonly topScore: number;
  readonly song: boolean;
}
```

### ArcadeSoccerStats

Soccer stats (raw `*_soccer` keys plus the `fb_*` variants).

```ts
interface ArcadeSoccerStats {
  readonly wins: number;
  readonly goals: number;
  readonly kicks: number;
  readonly powerKicks: number;
  readonly fbGoals: number;
  readonly fbKicks: number;
  readonly fbPowerKicks: number;
}
```

| Field          | Raw key             |
| -------------- | ------------------- |
| `powerKicks`   | `powerkicks_soccer` |
| `fbGoals`      | `fb_goals`          |
| `fbKicks`      | `fb_kicks`          |
| `fbPowerKicks` | `fb_powerkicks`     |

### ArcadeThrowOutStats

Throw Out stats (raw `*_throw_out` keys). `disguise` reads `throwout_disguise`.

```ts
interface ArcadeThrowOutStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly disguise: string;
}
```

### ArcadeGrindStats

Grind stats (raw `*_grind` keys).

```ts
interface ArcadeGrindStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
}
```

### ArcadeSplatoonStats

Splatoon stats (raw `*_splatoon` keys).

```ts
interface ArcadeSplatoonStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
}
```

### ArcadeVolleyballStats

Volleyball stats (raw `*_volleyball` keys).

```ts
interface ArcadeVolleyballStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
}
```

### ArcadeSpaceRaidersStats

Space Raiders stats (raw `*_spaceraiders` keys).

```ts
interface ArcadeSpaceRaidersStats {
  readonly wins: number;
  readonly kills: number;
}
```

### ArcadePumpkinSpleefStats

Pumpkin Spleef stats (raw `wins_pspleef`).

```ts
interface ArcadePumpkinSpleefStats {
  readonly wins: number;
}
```

### ArcadeWoolHuntStats

Wool Hunt stats (raw `woolhunt_*` keys). `inventoryLayout` (raw `woolhunt_inventorylayout`) is a raw number map.

```ts
interface ArcadeWoolHuntStats {
  readonly participatedWins: number;
  readonly participatedLosses: number;
  readonly experiencedWins: number;
  readonly experiencedLosses: number;
  readonly kills: number;
  readonly killsWithWool: number;
  readonly killsOnWoolholder: number;
  readonly deaths: number;
  readonly deathsWithWool: number;
  readonly deathsToWoolholder: number;
  readonly assists: number;
  readonly woolsCaptured: number;
  readonly woolsStolen: number;
  readonly goldEarned: number;
  readonly goldSpent: number;
  readonly mostGoldEarned: number;
  readonly mostKillsAndAssists: number;
  readonly fastestWin: number;
  readonly fastestWoolCapture: number;
  readonly longestGame: number;
  readonly inventoryLayout: Readonly<Record<string, number>>;
}
```

---

## Zombies

### ArcadeZombiesStats

Zombies stats (raw `*_zombies` keys). Contains the global stats, an `enemyKills` record keyed by `ArcadeZombiesEnemyName`, the special Alien Arcadium block, and the three standard maps. `hideTutorials` reads `zombies_hideTutorials`.

```ts
interface ArcadeZombiesStats {
  readonly wins: number;
  readonly deaths: number;
  readonly zombieKills: number;
  readonly bestRound: number;
  readonly bulletsHit: number;
  readonly bulletsShot: number;
  readonly headshots: number;
  readonly doorsOpened: number;
  readonly windowsRepaired: number;
  readonly playersRevived: number;
  readonly timesKnockedDown: number;
  readonly totalRoundsSurvived: number;
  readonly fastestTime10: number;
  readonly fastestTime20: number;
  readonly fastestTime30: number;
  readonly hideTutorials: boolean;
  readonly enemyKills: Readonly<Record<ArcadeZombiesEnemyName, number>>;
  readonly alienArcadium: ArcadeZombiesAlienArcadium;
  readonly badBlood: ArcadeZombiesMap;
  readonly deadEnd: ArcadeZombiesMap;
  readonly prison: ArcadeZombiesMap;
}
```

The `badBlood`, `deadEnd`, and `prison` maps read the raw `*_zombies_badblood`, `*_zombies_deadend`, and `*_zombies_prison` suffixed keys respectively.

### ArcadeZombiesMap

Per-map Zombies stats with the three difficulty sub-modes.

```ts
interface ArcadeZombiesMap {
  readonly wins: number;
  readonly deaths: number;
  readonly bestRound: number;
  readonly zombieKills: number;
  readonly doorsOpened: number;
  readonly windowsRepaired: number;
  readonly playersRevived: number;
  readonly timesKnockedDown: number;
  readonly totalRoundsSurvived: number;
  readonly normal: ArcadeZombiesMapMode;
  readonly hard: ArcadeZombiesMapMode;
  readonly rip: ArcadeZombiesMapMode;
}
```

### ArcadeZombiesAlienArcadium

The Alien Arcadium Zombies map (raw `*_zombies_alienarcadium` keys). Has only a `normal` sub-mode.

```ts
interface ArcadeZombiesAlienArcadium {
  readonly wins: number;
  readonly deaths: number;
  readonly bestRound: number;
  readonly zombieKills: number;
  readonly doorsOpened: number;
  readonly windowsRepaired: number;
  readonly playersRevived: number;
  readonly timesKnockedDown: number;
  readonly totalRoundsSurvived: number;
  readonly normal: ArcadeZombiesMapMode;
}
```

### ArcadeZombiesMapMode

Per-difficulty Zombies sub-mode stats (raw `*_zombies_<map>_<mode>` keys where mode is `normal`, `hard`, or `rip`).

```ts
interface ArcadeZombiesMapMode {
  readonly wins: number;
  readonly deaths: number;
  readonly bestRound: number;
  readonly zombieKills: number;
  readonly doorsOpened: number;
  readonly windowsRepaired: number;
  readonly playersRevived: number;
  readonly timesKnockedDown: number;
  readonly totalRoundsSurvived: number;
  readonly fastestTime10: number;
  readonly fastestTime20: number;
  readonly fastestTime30: number;
}
```

The `ArcadeZombiesEnemyName` union (record keys for `enemyKills`); each value is the raw `<enemy>_kills_zombies` count:

```ts
type ArcadeZombiesEnemyName =
  | "basic"
  | "basketball"
  | "blaze"
  | "blob"
  | "bomb"
  | "broodmother"
  | "caveSpider"
  | "chargedCreeper"
  | "chgluglu"
  | "clown"
  | "corruptedPigman"
  | "creeper"
  | "daBomb"
  | "drowned"
  | "empowered"
  | "ender"
  | "endermite"
  | "familyDaughter"
  | "familyFather"
  | "familyMother"
  | "familyTwinBlue"
  | "familyTwinRed"
  | "fireLord"
  | "fire"
  | "frostZombie"
  | "ghast"
  | "giantRainbow"
  | "giant"
  | "guardZombie"
  | "guardian"
  | "headlessPigman"
  | "herobrineMinion"
  | "herobrine"
  | "human"
  | "infernoPigman"
  | "inferno"
  | "invisible"
  | "ironGolem"
  | "kingDrowned"
  | "kingSlime"
  | "knightDrowned"
  | "magmaCube"
  | "magma"
  | "mcdonaldsPigman"
  | "mcdonaldsZombie"
  | "megaBlob"
  | "megaMagma"
  | "molten"
  | "murderPigman"
  | "murderZombie"
  | "nurseZombie"
  | "pigZombie"
  | "prisonerPigman2Cell"
  | "prisonerPigman2"
  | "prisonerPigmanCell"
  | "prisonerPigman"
  | "prisonerSkeleton"
  | "prisonerZombieAngry2"
  | "prisonerZombieAngry3"
  | "prisonerZombieAngry"
  | "prisonerZombieCell"
  | "prisoner"
  | "rainbow"
  | "scuba"
  | "sentinel"
  | "shadySkeleton"
  | "silverfish"
  | "skelefish"
  | "skeleton"
  | "slime"
  | "slimeZombie"
  | "spaceBlaster"
  | "spaceGrunt"
  | "tankDrowned"
  | "tankZombie"
  | "theOldOne"
  | "theWarden"
  | "tntBaby"
  | "tnt"
  | "werewolf"
  | "witch"
  | "witherSkeleton"
  | "wither"
  | "witherZombie"
  | "wolfDrowned"
  | "wolfPet"
  | "wolf"
  | "worldEnder"
  | "wormSmall"
  | "worm";
```
