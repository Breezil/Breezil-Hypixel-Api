# VampireZ

The VampireZ module exposes a single parser, `parseVampireZ`, which mirrors the raw `stats.VampireZ` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseVampireZ

Parses a player's VampireZ stats (`stats.VampireZ`) into a typed object.

```ts
function parseVampireZ(stats: Record<string, unknown>): VampireZStats | null;
```

### Null / empty behavior

`parseVampireZ` returns `null` when `stats.VampireZ` is missing or is not a plain object (i.e. it is absent, `null`, or an array). Otherwise it always returns a fully-populated `VampireZStats` object filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- `packages` becomes an empty array (`[]`) when absent or not an array, keeping only string entries.
- `boughtDyeColors` collects every raw key prefixed with `bought_dye_color:` whose value is exactly `true`, with the prefix stripped; it is `[]` when none are present.

---

## Returned type tree

### VampireZStats

The root object returned by `parseVampireZ`.

```ts
interface VampireZStats {
  readonly coins: number;
  readonly goldBought: number;
  readonly blood: boolean;
  readonly updatedStats: boolean;
  readonly usingOld: boolean;
  readonly usingOldVamp: boolean;
  readonly disableKillPing: boolean;
  readonly combatTracker: boolean;
  readonly noStartingCompass: boolean;
  readonly noStartingGear: boolean;
  readonly noStartingFood: boolean;
  readonly noStartingPotion: boolean;
  readonly noStartingTorch: boolean;
  readonly disabledLootDrops: boolean;
  readonly prefixDisabled: boolean;
  readonly vampColor: string;
  readonly vampireColor: string;
  readonly survivorColor: string;
  readonly boughtDyeColors: readonly string[];
  readonly zombieKills: number;
  readonly zombieDoubler: number;
  readonly vampireDoubler: number;
  readonly lootDrops: number;
  readonly terrorLevel: number;
  readonly mostVampireKills: number;
  readonly mostVampireKillsLegacy: number;
  readonly packages: readonly string[];
  readonly votes: VampireZMapVotes;
  readonly human: VampireZRoleStats;
  readonly vampire: VampireZRoleStats;
  readonly monthly: VampireZPeriodWins;
  readonly weekly: VampireZPeriodWins;
  readonly perks: VampireZPerks;
}
```

| Field                    | Raw source                | Notes                                                     |
| ------------------------ | ------------------------- | --------------------------------------------------------- |
| `coins`                  | `coins` or `tokens`       | Falls back to `tokens` when `coins` is `0`/absent.        |
| `goldBought`             | `gold_bought`             |                                                           |
| `blood`                  | `blood`                   |                                                           |
| `updatedStats`           | `updated_stats`           |                                                           |
| `usingOld`               | `using_old`               |                                                           |
| `usingOldVamp`           | `using_old_vamp`          |                                                           |
| `disableKillPing`        | `disable_kill_ping`       |                                                           |
| `combatTracker`          | `combatTracker`           |                                                           |
| `noStartingCompass`      | `no_starting_compass`     |                                                           |
| `noStartingGear`         | `no_starting_gear`        |                                                           |
| `noStartingFood`         | `no_starting_food`        |                                                           |
| `noStartingPotion`       | `no_starting_potion`      |                                                           |
| `noStartingTorch`        | `no_starting_torch`       |                                                           |
| `disabledLootDrops`      | `disabled_loot_drops`     |                                                           |
| `prefixDisabled`         | `prefix_disabled`         |                                                           |
| `vampColor`              | `vamp_color`              |                                                           |
| `vampireColor`           | `vampirecolor`            |                                                           |
| `survivorColor`          | `survivor_color`          |                                                           |
| `boughtDyeColors`        | `bought_dye_color:*` keys | See note below.                                           |
| `zombieKills`            | `zombie_kills`            |                                                           |
| `zombieDoubler`          | `zombie_doubler`          |                                                           |
| `vampireDoubler`         | `vampire_doubler`         |                                                           |
| `lootDrops`              | `loot_drops`              |                                                           |
| `terrorLevel`            | `terror_level`            |                                                           |
| `mostVampireKills`       | `most_vampire_kills_new`  |                                                           |
| `mostVampireKillsLegacy` | `most_vampire_kills`      |                                                           |
| `packages`               | `packages`                | String entries only; non-string entries are filtered out. |

`boughtDyeColors` is built from every raw key prefixed with `bought_dye_color:` whose value is exactly `true`; the resulting strings are those keys with the `bought_dye_color:` prefix stripped. `packages` is the raw `packages` array filtered to string entries only, or `[]` when it is not an array.

### VampireZMapVotes

Per-map vote counts (`votes` field of `VampireZStats`), each read from the raw `votes_<Map>` key.

```ts
interface VampireZMapVotes {
  readonly cavern: number;
  readonly church: number;
  readonly darkValley: number;
  readonly dusk: number;
  readonly erias: number;
  readonly kudong: number;
  readonly overhill: number;
  readonly plundered: number;
  readonly pyramids: number;
  readonly village: number;
}
```

| Field        | Raw source          |
| ------------ | ------------------- |
| `cavern`     | `votes_Cavern`      |
| `church`     | `votes_Church`      |
| `darkValley` | `votes_Dark Valley` |
| `dusk`       | `votes_Dusk`        |
| `erias`      | `votes_Erias`       |
| `kudong`     | `votes_Kudong`      |
| `overhill`   | `votes_Overhill`    |
| `plundered`  | `votes_Plundered`   |
| `pyramids`   | `votes_Pyramids`    |
| `village`    | `votes_Village`     |

### VampireZRoleStats

Per-role kill/death/win totals (used by both `human` and `vampire`).

```ts
interface VampireZRoleStats {
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
}
```

| Field    | Raw source (`human`) | Raw source (`vampire`) |
| -------- | -------------------- | ---------------------- |
| `kills`  | `human_kills`        | `vampire_kills`        |
| `deaths` | `human_deaths`       | `vampire_deaths`       |
| `wins`   | `human_wins`         | `vampire_wins`         |

### VampireZPeriodWins

Periodic win counters (used by both `monthly` and `weekly`).

```ts
interface VampireZPeriodWins {
  readonly humanWinsA: number;
  readonly humanWinsB: number;
  readonly vampireWinsA: number;
  readonly vampireWinsB: number;
}
```

| Field          | Raw source (`monthly`)   | Raw source (`weekly`)   |
| -------------- | ------------------------ | ----------------------- |
| `humanWinsA`   | `monthly_human_wins_a`   | `weekly_human_wins_a`   |
| `humanWinsB`   | `monthly_human_wins_b`   | `weekly_human_wins_b`   |
| `vampireWinsA` | `monthly_vampire_wins_a` | `weekly_vampire_wins_a` |
| `vampireWinsB` | `monthly_vampire_wins_b` | `weekly_vampire_wins_b` |

### VampireZPerks

Purchased/levelled perk values (`perks` field of `VampireZStats`).

```ts
interface VampireZPerks {
  readonly advancedSwag: number;
  readonly babyHater: number;
  readonly basicSwag: number;
  readonly bloodBooster: number;
  readonly bloodDrinker: number;
  readonly constitution: number;
  readonly drainPunch: number;
  readonly expertSwag: number;
  readonly explosiveKiller: number;
  readonly finalBreath: number;
  readonly fireproofing: number;
  readonly foresight: number;
  readonly frankensteinsMonster: number;
  readonly goldBooster: number;
  readonly goldStarter: number;
  readonly hellborn: number;
  readonly killBooster: number;
  readonly renfield: number;
  readonly theology: number;
  readonly transfusion: number;
  readonly vampiricMinion: number;
  readonly vampiricScream: number;
  readonly vanHelsing: number;
  readonly waveBooster: number;
}
```

| Field                  | Raw source              |
| ---------------------- | ----------------------- |
| `advancedSwag`         | `advanced_swag`         |
| `babyHater`            | `baby_hater`            |
| `basicSwag`            | `basic_swag`            |
| `bloodBooster`         | `blood_booster`         |
| `bloodDrinker`         | `blood_drinker`         |
| `constitution`         | `constitution`          |
| `drainPunch`           | `drain_punch`           |
| `expertSwag`           | `expert_swag`           |
| `explosiveKiller`      | `explosive_killer`      |
| `finalBreath`          | `final_breath`          |
| `fireproofing`         | `fireproofing`          |
| `foresight`            | `foresight`             |
| `frankensteinsMonster` | `frankensteins_monster` |
| `goldBooster`          | `gold_booster`          |
| `goldStarter`          | `gold_starter`          |
| `hellborn`             | `hellborn`              |
| `killBooster`          | `kill_booster`          |
| `renfield`             | `renfield`              |
| `theology`             | `theology`              |
| `transfusion`          | `transfusion`           |
| `vampiricMinion`       | `vampiric_minion`       |
| `vampiricScream`       | `vampiric_scream`       |
| `vanHelsing`           | `van_helsing`           |
| `waveBooster`          | `wave_booster`          |
