# TNT Games

The TNT Games module exposes a single parser, `parseTNTGames`, which mirrors the raw `stats.TNTGames` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseTNTGames

Parses a player's TNT Games stats (`stats.TNTGames`) into a typed object.

```ts
function parseTNTGames(stats: Record<string, unknown>): TNTGamesStats | null;
```

### Null / empty behavior

`parseTNTGames` returns `null` when `stats.TNTGames` is absent, is not an object, or is an array. Otherwise it returns a fully-populated `TNTGamesStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects (`flags`, `privategames`, `leaderboardSettings`, `favorites`, and the hotbar maps) are treated as empty objects, so every nested block is still present and populated with the defaults above.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.
- Array fields (`packages`, `favorites.deathEffect`, `mapVotes`, `tntRunTournament`) become empty arrays (`[]`) when absent, and non-string / non-matching entries are filtered out.

The dynamic maps (the per-mode hotbars) and the dynamic arrays (`mapVotes`, `tntRunTournament`) contain only the entries present in the raw data, so they may be empty when no data exists.

---

## Returned type tree

### TNTGamesStats

The root object returned by `parseTNTGames`.

```ts
interface TNTGamesStats {
  readonly coins: number;
  readonly wins: number;
  readonly winstreak: number;
  readonly lastTourneyAd: Date | null;
  readonly activeArrowTrail: string;
  readonly activeDeathEffect: string;
  readonly activeDoubleJump: string;
  readonly activeParticle: string;
  readonly activeParticleEffect: string;
  readonly activeVoidMessage: string;
  readonly doubleJumpEffect: string;
  readonly newActiveDeathEffect: string;
  readonly newActiveParticleEffect: string;
  readonly newDoubleJumpEffect: string;
  readonly newSelectedHat: string;
  readonly selectedHat: string;
  readonly runDoubleJumps: number;
  readonly shopSort: string;
  readonly shopSortEnableOwnedFirst: boolean;
  readonly packages: readonly string[];
  readonly favorites: TNTGamesFavorites;
  readonly mapVotes: readonly TNTGamesMapVote[];
  readonly flags: TNTGamesFlags;
  readonly privateGames: TNTGamesPrivateGames;
  readonly leaderboardSettings: TNTGamesLeaderboardSettings;
  readonly tntRun: TNTGamesTNTRunStats;
  readonly tntRunTournament: readonly TNTGamesTournamentRound[];
  readonly pvpRun: TNTGamesPVPRunStats;
  readonly bowSpleef: TNTGamesBowSpleefStats;
  readonly tntTag: TNTGamesTNTTagStats;
  readonly wizards: TNTGamesWizardsStats;
  readonly tntRunHotbar: Readonly<Record<string, string>>;
  readonly pvpRunHotbar: Readonly<Record<string, string>>;
  readonly bowSpleefHotbar: Readonly<Record<string, string>>;
  readonly tntTagHotbar: Readonly<Record<string, string>>;
  readonly wizardsHotbar: Readonly<Record<string, string>>;
}
```

| Field                      | Raw source                     | Notes                                                                |
| -------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| `coins`                    | `coins` / `tokens`             | Reads `coins`, falling back to `tokens` when `coins` is `0`/absent.  |
| `wins`                     | `wins`                         |                                                                      |
| `winstreak`                | `winstreak`                    |                                                                      |
| `lastTourneyAd`            | `lastTourneyAd`                | Epoch-ms timestamp as `Date`, or `null`.                             |
| `activeArrowTrail`         | `active_arrow_trail`           |                                                                      |
| `activeDeathEffect`        | `active_death_effect`          |                                                                      |
| `activeDoubleJump`         | `active_double_jump`           |                                                                      |
| `activeParticle`           | `active_particle`              |                                                                      |
| `activeParticleEffect`     | `active_particle_effect`       |                                                                      |
| `activeVoidMessage`        | `active_void_message`          |                                                                      |
| `doubleJumpEffect`         | `double_jump_effect`           |                                                                      |
| `newActiveDeathEffect`     | `new_active_death_effect`      |                                                                      |
| `newActiveParticleEffect`  | `new_active_particle_effect`   |                                                                      |
| `newDoubleJumpEffect`      | `new_double_jump_effect`       |                                                                      |
| `newSelectedHat`           | `new_selected_hat`             |                                                                      |
| `selectedHat`              | `selected_hat`                 |                                                                      |
| `runDoubleJumps`           | `new_run_double_jumps`         |                                                                      |
| `shopSort`                 | `shop_sort`                    |                                                                      |
| `shopSortEnableOwnedFirst` | `shop_sort_enable_owned_first` |                                                                      |
| `packages`                 | `packages`                     | Filtered to string entries.                                          |
| `mapVotes`                 | `votes_*`                      | Collected from every raw key prefixed `votes_`; `map` is the suffix. |
| `tntRunTournament`         | `wins_tourney_tnt_run_<n>`     | Collected from every raw key matching `wins_tourney_tnt_run_<n>`.    |
| `tntRunHotbar`             | `tntrun`                       | Slot → item map, keeping only string values.                         |
| `pvpRunHotbar`             | `pvprun`                       | Slot → item map, keeping only string values.                         |
| `bowSpleefHotbar`          | `spleef`                       | Slot → item map, keeping only string values.                         |
| `tntTagHotbar`             | `tnttag`                       | Slot → item map, keeping only string values.                         |
| `wizardsHotbar`            | `wizards`                      | Slot → item map, keeping only string values.                         |

---

## Per-mode stat types

### TNTGamesTNTRunStats

```ts
interface TNTGamesTNTRunStats {
  readonly wins: number;
  readonly deaths: number;
  readonly bestTime: number;
  readonly doubleJumpTier: number;
  readonly doubleJumps: number;
  readonly doubleJumpsLegacy: number;
  readonly slownessPotions: number;
  readonly speedPotions: number;
  readonly potionsSplashedOnPlayers: number;
  readonly prefix: string;
}
```

| Field                      | Raw source                        |
| -------------------------- | --------------------------------- |
| `wins`                     | `wins_tntrun`                     |
| `deaths`                   | `deaths_tntrun`                   |
| `bestTime`                 | `record_tntrun`                   |
| `doubleJumpTier`           | `doublejump_tntrun`               |
| `doubleJumps`              | `new_tntrun_double_jumps`         |
| `doubleJumpsLegacy`        | `new_tntrun_double_jumps_legacy`  |
| `slownessPotions`          | `new_tntrun_slowness_potions`     |
| `speedPotions`             | `new_tntrun_speed_potions`        |
| `potionsSplashedOnPlayers` | `run_potions_splashed_on_players` |
| `prefix`                   | `prefix_tntrun`                   |

### TNTGamesTournamentRound

One entry per `wins_tourney_tnt_run_<round>` key found in the raw data.

```ts
interface TNTGamesTournamentRound {
  readonly round: number;
  readonly wins: number;
  readonly deaths: number;
}
```

| Field    | Raw source                       |
| -------- | -------------------------------- |
| `round`  | The numeric `<round>` suffix.    |
| `wins`   | `wins_tourney_tnt_run_<round>`   |
| `deaths` | `deaths_tourney_tnt_run_<round>` |

### TNTGamesPVPRunStats

```ts
interface TNTGamesPVPRunStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly bestTime: number;
  readonly regeneration: number;
  readonly notoriety: number;
  readonly fortitude: number;
  readonly doubleJumps: number;
  readonly doubleJumpsLegacy: number;
  readonly prefix: string;
}
```

| Field               | Raw source                       |
| ------------------- | -------------------------------- |
| `wins`              | `wins_pvprun`                    |
| `kills`             | `kills_pvprun`                   |
| `deaths`            | `deaths_pvprun`                  |
| `bestTime`          | `record_pvprun`                  |
| `regeneration`      | `new_pvprun_regeneration`        |
| `notoriety`         | `new_pvprun_notoriety`           |
| `fortitude`         | `new_pvprun_fortitude`           |
| `doubleJumps`       | `new_pvprun_double_jumps`        |
| `doubleJumpsLegacy` | `new_pvprun_double_jumps_legacy` |
| `prefix`            | `prefix_pvprun`                  |

### TNTGamesBowSpleefStats

```ts
interface TNTGamesBowSpleefStats {
  readonly wins: number;
  readonly deaths: number;
  readonly tags: number;
  readonly doubleJumpTier: number;
  readonly repulsorTier: number;
  readonly tripleShotTier: number;
  readonly doubleJumps: number;
  readonly doubleJumpsLegacy: number;
  readonly repulsor: number;
  readonly repulsorLegacy: number;
  readonly tripleShot: number;
  readonly tripleShotLegacy: number;
  readonly arrowRain: number;
  readonly explosiveDash: number;
  readonly fireFlurry: number;
  readonly fireFlurryCapitalized: number;
  readonly arrowTrail: string;
  readonly arrowTrailLegacy: string;
  readonly prefix: string;
}
```

| Field                   | Raw source                                          |
| ----------------------- | --------------------------------------------------- |
| `wins`                  | `wins_bowspleef`                                    |
| `deaths`                | `deaths_bowspleef`                                  |
| `tags`                  | `tags_bowspleef`                                    |
| `doubleJumpTier`        | `spleef_doublejump`                                 |
| `repulsorTier`          | `spleef_repulse`                                    |
| `tripleShotTier`        | `spleef_triple`                                     |
| `doubleJumps`           | `new_spleef_double_jumps`                           |
| `doubleJumpsLegacy`     | `new_spleef_double_jumps_legacy`                    |
| `repulsor`              | `new_spleef_repulsor`                               |
| `repulsorLegacy`        | `new_spleef_repulsor_legacy`                        |
| `tripleShot`            | `new_spleef_tripleshot`                             |
| `tripleShotLegacy`      | `new_spleef_tripleshot_legacy`                      |
| `arrowRain`             | `new_spleef_arrowrain`                              |
| `explosiveDash`         | `new_spleef_exlosive_dash` (raw key is misspelled). |
| `fireFlurry`            | `new_spleef_fireflurry`                             |
| `fireFlurryCapitalized` | `new_spleef_FireFlurry`                             |
| `arrowTrail`            | `new_spleef_arrowtrail`                             |
| `arrowTrailLegacy`      | `spleef_arrowtrail`                                 |
| `prefix`                | `prefix_bowspleef`                                  |

### TNTGamesTNTTagStats

```ts
interface TNTGamesTNTTagStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly speedy: number;
  readonly speed: number;
  readonly blastProtection: number;
  readonly speedItUp: number;
  readonly slowItDown: number;
  readonly suit: string;
  readonly suitLegacy: string;
  readonly prefix: string;
}
```

| Field             | Raw source            |
| ----------------- | --------------------- |
| `wins`            | `wins_tntag`          |
| `kills`           | `kills_tntag`         |
| `deaths`          | `deaths_tntag`        |
| `speedy`          | `new_tntag_speedy`    |
| `speed`           | `tag_speed`           |
| `blastProtection` | `tag_blastprotection` |
| `speedItUp`       | `tag_speeditup`       |
| `slowItDown`      | `tag_slowitdown`      |
| `suit`            | `new_tag_suit`        |
| `suitLegacy`      | `tag_suit`            |
| `prefix`          | `prefix_tntag`        |

---

## Wizards

### TNTGamesWizardsStats

Aggregate Wizards stats plus a typed block for each of the ten wizard classes.

```ts
interface TNTGamesWizardsStats {
  readonly wins: number;
  readonly kills: number;
  readonly assists: number;
  readonly deaths: number;
  readonly points: number;
  readonly kineticHealing: number;
  readonly airTime: number;
  readonly captureClass: string;
  readonly selectedClass: string;
  readonly prefix: string;
  readonly ancient: TNTGamesAncientWizard;
  readonly arcane: TNTGamesArcaneWizard;
  readonly blood: TNTGamesBloodWizard;
  readonly fire: TNTGamesFireWizard;
  readonly hydro: TNTGamesHydroWizard;
  readonly ice: TNTGamesIceWizard;
  readonly kinetic: TNTGamesKineticWizard;
  readonly storm: TNTGamesStormWizard;
  readonly toxic: TNTGamesToxicWizard;
  readonly wither: TNTGamesWitherWizard;
}
```

| Field            | Raw source                |
| ---------------- | ------------------------- |
| `wins`           | `wins_capture`            |
| `kills`          | `kills_capture`           |
| `assists`        | `assists_capture`         |
| `deaths`         | `deaths_capture`          |
| `points`         | `points_capture`          |
| `kineticHealing` | `kinetic_healing_capture` |
| `airTime`        | `air_time_capture`        |
| `captureClass`   | `capture_class`           |
| `selectedClass`  | `wizards_selected_class`  |
| `prefix`         | `prefix_capture`          |

### TNTGamesWizardBase

The shared shape underlying every wizard class. Read with a per-class raw key prefix (e.g. `new_firewizard`, `arcane_wizard`).

```ts
interface TNTGamesWizardBase {
  readonly explode: number;
  readonly regen: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly healing: number;
  readonly damageTaken: number;
  readonly alternateEffectsStatus: boolean;
  readonly alternateEffects: string;
}
```

| Field                    | Raw source (relative to prefix)     |
| ------------------------ | ----------------------------------- |
| `explode`                | `<prefix>_explode`                  |
| `regen`                  | `<prefix>_regen`                    |
| `kills`                  | `<prefix>_kills`                    |
| `deaths`                 | `<prefix>_deaths`                   |
| `assists`                | `<prefix>_assists`                  |
| `healing`                | `<prefix>_healing`                  |
| `damageTaken`            | `<prefix>_damage_taken`             |
| `alternateEffectsStatus` | `<prefix>_alternate_effects_status` |
| `alternateEffects`       | `<prefix>_alternate_effects`        |

### TNTGamesWizardPrestige

```ts
interface TNTGamesWizardPrestige {
  readonly prestigeField: string;
}
```

`prestigeField` reads `<prefix>_prestige_field`.

### TNTGamesWizardLegacy

```ts
interface TNTGamesWizardLegacy {
  readonly explodeLegacy: number;
  readonly regenLegacy: number;
}
```

| Field           | Raw source (relative to prefix) |
| --------------- | ------------------------------- |
| `explodeLegacy` | `<prefix>_explode_legacy`       |
| `regenLegacy`   | `<prefix>_regen_legacy`         |

### TNTGamesWizardTier

Read with the legacy (non-`new_`) wizard key (e.g. `firewizard`).

```ts
interface TNTGamesWizardTier {
  readonly explodeTier: number;
  readonly regenTier: number;
  readonly prestigeFieldLegacy: string;
}
```

| Field                 | Raw source (relative to legacy key) |
| --------------------- | ----------------------------------- |
| `explodeTier`         | `<wizard>_explode`                  |
| `regenTier`           | `<wizard>_regen`                    |
| `prestigeFieldLegacy` | `<wizard>_prestige_field`           |

### Per-class wizard interfaces

Each wizard class composes a subset of the base / prestige / legacy / tier shapes above. The table lists the interface, the raw key prefix used for the base / prestige / legacy parts, the legacy key used for the tier part, and the interfaces it extends.

```ts
interface TNTGamesAncientWizard
  extends TNTGamesWizardBase, TNTGamesWizardPrestige {}
interface TNTGamesArcaneWizard extends TNTGamesWizardBase {}
interface TNTGamesBloodWizard
  extends
    TNTGamesWizardBase,
    TNTGamesWizardPrestige,
    TNTGamesWizardLegacy,
    TNTGamesWizardTier {}
interface TNTGamesFireWizard
  extends
    TNTGamesWizardBase,
    TNTGamesWizardPrestige,
    TNTGamesWizardLegacy,
    TNTGamesWizardTier {}
interface TNTGamesHydroWizard
  extends TNTGamesWizardBase, TNTGamesWizardPrestige {}
interface TNTGamesIceWizard
  extends
    TNTGamesWizardBase,
    TNTGamesWizardPrestige,
    TNTGamesWizardLegacy,
    TNTGamesWizardTier {}
interface TNTGamesKineticWizard
  extends
    TNTGamesWizardBase,
    TNTGamesWizardPrestige,
    TNTGamesWizardLegacy,
    TNTGamesWizardTier {}
interface TNTGamesStormWizard
  extends TNTGamesWizardBase, TNTGamesWizardPrestige {}
interface TNTGamesToxicWizard
  extends
    TNTGamesWizardBase,
    TNTGamesWizardPrestige,
    TNTGamesWizardLegacy,
    TNTGamesWizardTier {}
interface TNTGamesWitherWizard
  extends
    TNTGamesWizardBase,
    TNTGamesWizardPrestige,
    TNTGamesWizardLegacy,
    TNTGamesWizardTier {}
```

| Wizard field | Interface               | Base/prestige/legacy prefix | Tier key        |
| ------------ | ----------------------- | --------------------------- | --------------- |
| `ancient`    | `TNTGamesAncientWizard` | `new_ancientwizard`         | —               |
| `arcane`     | `TNTGamesArcaneWizard`  | `arcane_wizard`             | —               |
| `blood`      | `TNTGamesBloodWizard`   | `new_bloodwizard`           | `bloodwizard`   |
| `fire`       | `TNTGamesFireWizard`    | `new_firewizard`            | `firewizard`    |
| `hydro`      | `TNTGamesHydroWizard`   | `new_hydrowizard`           | —               |
| `ice`        | `TNTGamesIceWizard`     | `new_icewizard`             | `icewizard`     |
| `kinetic`    | `TNTGamesKineticWizard` | `new_kineticwizard`         | `kineticwizard` |
| `storm`      | `TNTGamesStormWizard`   | `new_stormwizard`           | —               |
| `toxic`      | `TNTGamesToxicWizard`   | `new_toxicwizard`           | `toxicwizard`   |
| `wither`     | `TNTGamesWitherWizard`  | `new_witherwizard`          | `witherwizard`  |

---

## Settings and cosmetics

### TNTGamesFlags

Read from the raw `flags` object.

```ts
interface TNTGamesFlags {
  readonly enableExplosiveDash: boolean;
  readonly giveDjFeather: boolean;
  readonly showPreGameHints: boolean;
  readonly showTipHolograms: boolean;
  readonly showTntRunActionbarInfo: boolean;
  readonly showTntTagActionbarInfo: boolean;
  readonly showWinPrefixes: boolean;
  readonly showWizPres: boolean;
  readonly showWizardsActionbarInfo: boolean;
  readonly showWizardsCooldownNotifications: boolean;
}
```

| Field                              | Raw source                            |
| ---------------------------------- | ------------------------------------- |
| `enableExplosiveDash`              | `enable_explosive_dash`               |
| `giveDjFeather`                    | `give_dj_feather`                     |
| `showPreGameHints`                 | `show_pre_game_hints`                 |
| `showTipHolograms`                 | `show_tip_holograms`                  |
| `showTntRunActionbarInfo`          | `show_tntrun_actionbar_info`          |
| `showTntTagActionbarInfo`          | `show_tnttag_actionbar_info`          |
| `showWinPrefixes`                  | `show_win_prefixes`                   |
| `showWizPres`                      | `show_wiz_pres`                       |
| `showWizardsActionbarInfo`         | `show_wizards_actionbar_info`         |
| `showWizardsCooldownNotifications` | `show_wizards_cooldown_notifications` |

### TNTGamesPrivateGames

Read from the raw `privategames` object.

```ts
interface TNTGamesPrivateGames {
  readonly bowSpleefHeavyArrows: boolean;
  readonly bowSpleefQuintuple: boolean;
  readonly bowSpleefDjMultiplier: string;
  readonly healthBuff: string;
  readonly lowGravity: boolean;
  readonly maxedPerks: boolean;
  readonly oneHitOneKill: boolean;
  readonly pvpRunArmorType: string;
  readonly pvpRunKnockback: boolean;
  readonly pvpRunSwordType: string;
  readonly speed: string;
  readonly tntRunHeavyFeet: boolean;
  readonly tntRunSnowballs: boolean;
  readonly tntTagDeathmatch: boolean;
  readonly tntTagNoPowerups: boolean;
  readonly wizardsCaptureSpeed: string;
  readonly wizardsDeathPenalty: string;
  readonly wizardsManaRegen: string;
  readonly wizardsMaxClasses: boolean;
  readonly wizardsNoRegen: boolean;
}
```

| Field                   | Raw source                |
| ----------------------- | ------------------------- |
| `bowSpleefHeavyArrows`  | `bow_spleef_heavy_arrows` |
| `bowSpleefQuintuple`    | `bow_spleef_quintuple`    |
| `bowSpleefDjMultiplier` | `bowspleef_dj_multiplier` |
| `healthBuff`            | `health_buff`             |
| `lowGravity`            | `low_gravity`             |
| `maxedPerks`            | `maxed_perks`             |
| `oneHitOneKill`         | `one_hit_one_kill`        |
| `pvpRunArmorType`       | `pvp_run_armor_type`      |
| `pvpRunKnockback`       | `pvp_run_knockback`       |
| `pvpRunSwordType`       | `pvp_run_sword_type`      |
| `speed`                 | `speed`                   |
| `tntRunHeavyFeet`       | `tnt_run_heavy_feet`      |
| `tntRunSnowballs`       | `tnt_run_snowballs`       |
| `tntTagDeathmatch`      | `tnt_tag_deathmatch`      |
| `tntTagNoPowerups`      | `tnt_tag_no_powerups`     |
| `wizardsCaptureSpeed`   | `wizards_capture_speed`   |
| `wizardsDeathPenalty`   | `wizards_death_penalty`   |
| `wizardsManaRegen`      | `wizards_mana_regen`      |
| `wizardsMaxClasses`     | `wizards_max_classes`     |
| `wizardsNoRegen`        | `wizards_no_regen`        |

### TNTGamesLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface TNTGamesLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

| Field       | Raw source  |
| ----------- | ----------- |
| `mode`      | `mode`      |
| `resetType` | `resetType` |

### TNTGamesMapVote

One entry per raw key prefixed `votes_`.

```ts
interface TNTGamesMapVote {
  readonly map: string;
  readonly votes: number;
}
```

| Field   | Raw source                             |
| ------- | -------------------------------------- |
| `map`   | The portion of the key after `votes_`. |
| `votes` | The numeric value at `votes_<map>`.    |

### TNTGamesFavorites

Read from the raw `favorites` object.

```ts
interface TNTGamesFavorites {
  readonly deathEffect: readonly string[];
}
```

`deathEffect` reads the raw `death_effect` array, keeping only string entries.
