# Blitz Survival Games

The Blitz Survival Games module exposes a single parser, `parseBlitz`, which mirrors the raw `stats.HungerGames` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseBlitz

Parses a player's Blitz Survival Games stats (`stats.HungerGames`) into a typed object.

```ts
function parseBlitz(stats: Record<string, unknown>): BlitzStats | null;
```

### Null / empty behavior

`parseBlitz` returns `null` when `stats.HungerGames` is absent, is not an object, or is an array. Otherwise it returns a fully-populated `BlitzStats` object built with the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- String-array fields (`packages`) become an empty array (`[]`) when absent.

The `kits` map is always populated with an entry for every known kit id, and each kit's combat counters default to `0` when the underlying raw key is missing. The dynamic maps (`votes`, `presentsCaps`, `kitPermutations`, `kitItemRenames`, `tourneyInstances`, and each kit's `inventory`/`extra`) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### BlitzStats

The root object returned by `parseBlitz`. Extends `BlitzCombatStats` (the no-prefix, no-suffix combat counters).

```ts
interface BlitzStats extends BlitzCombatStats {
  readonly coins: number;
  readonly blitzUses: number;
  readonly aura: string;
  readonly auraToggle: boolean;
  readonly blood: boolean;
  readonly chosenTaunt: string;
  readonly chosenVictoryDance: string;
  readonly chosenFinisher: string;
  readonly afterKillEffect: string;
  readonly afterKillEffectTourney: string;
  readonly packages: readonly string[];
  readonly killsSoloNormal: number;
  readonly killsTeamsNormal: number;
  readonly killsSoloChaos: number;
  readonly winsSoloNormal: number;
  readonly winsTeamsNormal: number;
  readonly winsSoloChaos: number;
  readonly ramboWin: number;
  readonly ramboWins: number;
  readonly randomWins: number;
  readonly tauntKills: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
  readonly lastTourneyAd: number;
  readonly autoArmor: boolean;
  readonly defaultKit: string;
  readonly alternativeKillMessageEnabled: boolean;
  readonly prefersFullKitsMenu: boolean;
  readonly disablePrestigeFinisher: boolean;
  readonly fancyMode: boolean;
  readonly combatTracker: boolean;
  readonly toggled: boolean;
  readonly toggleKillCounter: number;
  readonly votes: Readonly<Record<string, number>>;
  readonly presentsCaps: Readonly<Record<string, number>>;
  readonly kitPermutations: Readonly<Record<string, string>>;
  readonly kitItemRenames: Readonly<Record<string, string>>;
  readonly leaderboardSettings: BlitzLeaderboardSettings;
  readonly privateGames: BlitzPrivateGamesSettings;
  readonly kits: Readonly<Record<string, BlitzKitStats>>;
  readonly tourneyInstances: Readonly<Record<string, BlitzTourneyStats>>;
}
```

| Field                             | Notes                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `coins`                           | Raw `coins`.                                                                        |
| `blitzUses`                       | Raw `blitz_uses`.                                                                   |
| `aura`                            | Raw `aura`.                                                                         |
| `auraToggle`                      | Raw `auratoggle`.                                                                   |
| `blood`                           | Raw `blood`.                                                                        |
| `chosenTaunt`                     | Raw `chosen_taunt`.                                                                 |
| `chosenVictoryDance`              | Raw `chosen_victorydance`.                                                          |
| `chosenFinisher`                  | Raw `chosen_finisher`.                                                              |
| `afterKillEffect`                 | Raw `afterkill`.                                                                    |
| `afterKillEffectTourney`          | Raw `afterkill_tourney`.                                                            |
| `killsSoloNormal`                 | Raw `kills_solo_normal`.                                                            |
| `killsTeamsNormal`                | Raw `kills_teams_normal`.                                                           |
| `killsSoloChaos`                  | Raw `kills_solo_chaos`.                                                             |
| `winsSoloNormal`                  | Raw `wins_solo_normal`.                                                             |
| `winsTeamsNormal`                 | Raw `wins_teams_normal`.                                                            |
| `winsSoloChaos`                   | Raw `wins_solo_chaos`.                                                              |
| `ramboWin`                        | Raw `rambo_win`.                                                                    |
| `ramboWins`                       | Raw `rambo_wins`.                                                                   |
| `randomWins`                      | Raw `random_wins`.                                                                  |
| `tauntKills`                      | Raw `taunt_kills`.                                                                  |
| `monthlyKillsA` / `monthlyKillsB` | Raw `monthly_kills_a` / `monthly_kills_b`.                                          |
| `weeklyKillsA` / `weeklyKillsB`   | Raw `weekly_kills_a` / `weekly_kills_b`.                                            |
| `lastTourneyAd`                   | Raw `lastTourneyAd` (epoch-ms number, not converted to `Date`).                     |
| `autoArmor`                       | Raw `autoarmor`.                                                                    |
| `defaultKit`                      | Raw `defaultkit`.                                                                   |
| `alternativeKillMessageEnabled`   | Raw `alternative_kill_message_enabled`.                                             |
| `prefersFullKitsMenu`             | Raw `prefers_full_kits_menu`.                                                       |
| `disablePrestigeFinisher`         | Raw `disableprestigefinisher`.                                                      |
| `fancyMode`                       | Raw `fancyMode`.                                                                    |
| `combatTracker`                   | Raw `combatTracker`.                                                                |
| `toggled`                         | Raw `toggled`.                                                                      |
| `toggleKillCounter`               | Raw `togglekillcounter`.                                                            |
| `votes`                           | Collected from keys matching `votes_<name>`; keyed by `<name>`.                     |
| `presentsCaps`                    | Collected from keys matching `inGamePresentsCap_<name>`; keyed by `<name>`.         |
| `kitPermutations`                 | Collected from keys matching `kit_permutations_<name>`; keyed by `<name>`.          |
| `kitItemRenames`                  | Collected from keys matching `kit_item_rename_<name>`; keyed by `<name>`.           |
| `kits`                            | Per-kit stats keyed by kit id; always populated for every known kit.                |
| `tourneyInstances`                | Per-tourney-instance stats keyed by the id parsed from `tourney_<id>_games_played`. |

---

## Combat counters

### BlitzCombatStats

The shared base combat counters reused by every Blitz stat block. The root reads them with no prefix/suffix; per-kit blocks read them suffixed by `_<kitId>`; tourney blocks read them prefixed by `tourney_<id>_`.

```ts
interface BlitzCombatStats {
  readonly wins: number;
  readonly winsTeams: number;
  readonly gamesPlayed: number;
  readonly arrowsHit: number;
  readonly arrowsFired: number;
  readonly chestsOpened: number;
  readonly damage: number;
  readonly damageTaken: number;
  readonly kills: number;
  readonly deaths: number;
  readonly mobsSpawned: number;
  readonly potionsDrunk: number;
  readonly potionsThrown: number;
  readonly timePlayed: number;
}
```

Raw key stems: `wins`, `wins_teams`, `games_played`, `arrows_hit`, `arrows_fired`, `chests_opened`, `damage`, `damage_taken`, `kills`, `deaths`, `mobs_spawned`, `potions_drunk`, `potions_thrown`, `time_played`.

### BlitzKitCombatStats

Per-kit combat counters. Extends `BlitzCombatStats` with kit-specific raw keys, all suffixed by `_<kitId>`.

```ts
interface BlitzKitCombatStats extends BlitzCombatStats {
  readonly exp: number;
  readonly tauntKills: number;
  readonly explosiveKills: number;
  readonly fallDamage: number;
  readonly itemsEnchanted: number;
  readonly bottlesThrown: number;
  readonly eggsCollected: number;
  readonly eggsThrown: number;
  readonly snowballsThrown: number;
  readonly railsPlaced: number;
  readonly tntPlaced: number;
  readonly blocksTraveledBoat: number;
  readonly blocksTraveledHorse: number;
  readonly blocksTraveledMinecart: number;
  readonly blocksTraveledPig: number;
  readonly extra: Readonly<Record<string, number>>;
}
```

Raw key stems: `exp`, `taunt_kills`, `explosive_kills`, `fall_damage`, `items_enchanted`, `bottles_thrown`, `eggs_collected`, `eggs_thrown`, `snowballs_thrown`, `rails_placed`, `tnt_placed`, `blocks_traveled_boat`, `blocks_traveled_horse`, `blocks_traveled_minecart`, `blocks_traveled_pig`.

`extra` collects any remaining numeric keys ending in `_<kitId>` that are not a known combat/kit stem and do not start with `tourney_`, keyed by the stem between the prefix and the kit suffix.

### BlitzKitStats

A single kit's full stats. Extends `BlitzKitCombatStats`.

```ts
interface BlitzKitStats extends BlitzKitCombatStats {
  readonly level: number;
  readonly prestige: number;
  readonly inventory: Readonly<Record<string, string>>;
}
```

| Field       | Notes                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `level`     | Kit level, read from the raw key equal to the kit id.                                                |
| `prestige`  | Kit prestige, read from the raw key `p<kitId>`.                                                      |
| `inventory` | String-to-string map of the kit's inventory layout; only string entries are kept, empty when absent. |

### BlitzTourneyStats

Stats for a single tournament instance. Extends `BlitzCombatStats`. Keyed in `BlitzStats.tourneyInstances` by the instance id parsed from `tourney_<id>_games_played` raw keys; all fields are read under the `tourney_<id>_` prefix.

```ts
interface BlitzTourneyStats extends BlitzCombatStats {
  readonly coins: number;
  readonly blitzUses: number;
  readonly tauntKills: number;
  readonly randomWins: number;
  readonly killsTeamsNormal: number;
  readonly winsTeamsNormal: number;
  readonly kits: Readonly<Record<string, BlitzKitCombatStats>>;
}
```

| Field              | Notes (raw key under `tourney_<id>_`)                         |
| ------------------ | ------------------------------------------------------------- |
| `coins`            | `coins`.                                                      |
| `blitzUses`        | `blitz_uses`.                                                 |
| `tauntKills`       | `taunt_kills`.                                                |
| `randomWins`       | `random_wins`.                                                |
| `killsTeamsNormal` | `kills_teams_normal`.                                         |
| `winsTeamsNormal`  | `wins_teams_normal`.                                          |
| `kits`             | Per-kit `BlitzKitCombatStats`, populated for every known kit. |

---

## Settings

### BlitzPrivateGamesSettings

Read from the raw `privategames` object.

```ts
interface BlitzPrivateGamesSettings {
  readonly healthBuff: string;
  readonly speed: string;
  readonly extraBlitzStars: string;
  readonly nightTime: boolean;
  readonly noKits: boolean;
  readonly maxKitsAndKillEffects: boolean;
  readonly lowGravity: boolean;
  readonly oneHitOneKill: boolean;
}
```

| Field                   | Raw key                            |
| ----------------------- | ---------------------------------- |
| `healthBuff`            | `health_buff`                      |
| `speed`                 | `speed`                            |
| `extraBlitzStars`       | `extra_blitz_stars`                |
| `nightTime`             | `enable_night_time`                |
| `noKits`                | `no_kits`                          |
| `maxKitsAndKillEffects` | `enable_max_kits_and_kill_effects` |
| `lowGravity`            | `low_gravity`                      |
| `oneHitOneKill`         | `one_hit_one_kill_blitz`           |

### BlitzLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface BlitzLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

| Field       | Raw key     |
| ----------- | ----------- |
| `mode`      | `mode`      |
| `resetType` | `resetType` |
