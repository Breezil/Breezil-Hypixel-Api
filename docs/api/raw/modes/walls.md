# Walls

The Walls module exposes a single parser, `parseWalls`, which mirrors the raw `stats.Walls` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseWalls

Parses a player's Walls stats (`stats.Walls`) into a typed object.

```ts
function parseWalls(stats: Record<string, unknown>): WallsStats | null;
```

### Null / empty behavior

`parseWalls` returns `null` when `stats.Walls` is missing or is not a plain object (i.e. it is absent, `null`, or an array). Otherwise it always returns a fully-populated `WallsStats` object filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- `coins` reads `coins`, falling back to the raw `tokens` value when `coins` is `0`/absent.
- `packages` becomes an empty array (`[]`) when absent or not an array, keeping only string entries.
- The inventory maps (`inventory`, `inventoryLayout`, `inventoryLayout2`) keep only the slots whose raw values are strings, so they may be empty objects when absent.

---

## Returned type tree

### WallsStats

The root object returned by `parseWalls`. Combines top-level totals, per-map vote counts, periodic (monthly/weekly) breakdowns, per-perk levels, and inventory layouts.

```ts
interface WallsStats {
  readonly coins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly wins: number;
  readonly losses: number;
  readonly insaneFarmer: number;
  readonly blood: boolean;
  readonly combatTracker: boolean;
  readonly noStartingArmor: boolean;
  readonly noStartingItems: boolean;
  readonly noStartingTools: boolean;
  readonly shoutCount: number;
  readonly votesAztec: number;
  readonly votesCandyland: number;
  readonly votesCastle: number;
  readonly votesDwarven: number;
  readonly votesEgypt: number;
  readonly votesFantasy: number;
  readonly votesHarmony: number;
  readonly votesIsland: number;
  readonly votesJungle: number;
  readonly votesLoveLand: number;
  readonly votesModern: number;
  readonly votesNordic: number;
  readonly votesOutback: number;
  readonly votesSaraat: number;
  readonly votesShire: number;
  readonly votesSpace: number;
  readonly votesWild: number;
  readonly monthlyAssistsA: number;
  readonly monthlyAssistsB: number;
  readonly weeklyAssistsA: number;
  readonly weeklyAssistsB: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
  readonly monthlyWinsA: number;
  readonly monthlyWinsB: number;
  readonly weeklyWinsA: number;
  readonly weeklyWinsB: number;
  readonly adrenaline: number;
  readonly artisan: number;
  readonly attractor: number;
  readonly bacon: number;
  readonly berserk: number;
  readonly blacksmith: number;
  readonly blacksmithStarter: number;
  readonly bomberman: number;
  readonly bossDigger: number;
  readonly bossGuardian: number;
  readonly bossSkills: number;
  readonly burnBabyBurn: number;
  readonly canadian: number;
  readonly catsEye: number;
  readonly chainkiller: number;
  readonly chef: number;
  readonly chemist: number;
  readonly creeperEgg: number;
  readonly dwarwenSkills: number;
  readonly ecologist: number;
  readonly einstein: number;
  readonly escapist: number;
  readonly excavator: number;
  readonly expertMiner: number;
  readonly farmer: number;
  readonly finalForm: number;
  readonly fireproof: number;
  readonly fisherman: number;
  readonly fortune: number;
  readonly getToTheChoppa: number;
  readonly goldRush: number;
  readonly graveDigger: number;
  readonly grimReaper: number;
  readonly guitarist: number;
  readonly haste: number;
  readonly hunter: number;
  readonly lazyman: number;
  readonly leatherWorker: number;
  readonly masterTroll: number;
  readonly necromancer: number;
  readonly opportunity: number;
  readonly pyromaniac: number;
  readonly ready: number;
  readonly reallyShiny: number;
  readonly redstoneExpert: number;
  readonly sage: number;
  readonly scotsman: number;
  readonly skybaseKing: number;
  readonly smartBoy: number;
  readonly snackLover: number;
  readonly soupDrinker: number;
  readonly step: number;
  readonly stoneGuardian: number;
  readonly swift: number;
  readonly tenacity: number;
  readonly thatsHot: number;
  readonly tragedy: number;
  readonly trapEngineer: number;
  readonly vampirism: number;
  readonly veryFortunate: number;
  readonly vitality: number;
  readonly packages: readonly string[];
  readonly inventory: Readonly<Record<string, string>>;
  readonly inventoryLayout: Readonly<Record<string, string>>;
  readonly inventoryLayout2: Readonly<Record<string, string>>;
}
```

#### Core fields

| Field             | Type      | Raw key                         |
| ----------------- | --------- | ------------------------------- |
| `coins`           | `number`  | `coins`, falls back to `tokens` |
| `kills`           | `number`  | `kills`                         |
| `deaths`          | `number`  | `deaths`                        |
| `assists`         | `number`  | `assists`                       |
| `wins`            | `number`  | `wins`                          |
| `losses`          | `number`  | `losses`                        |
| `insaneFarmer`    | `number`  | `insane_farmer`                 |
| `blood`           | `boolean` | `blood`                         |
| `combatTracker`   | `boolean` | `combatTracker`                 |
| `noStartingArmor` | `boolean` | `no_starting_armor`             |
| `noStartingItems` | `boolean` | `no_starting_items`             |
| `noStartingTools` | `boolean` | `no_starting_tools`             |
| `shoutCount`      | `number`  | `shout_count`                   |

#### Map vote counts

Each vote field is a `number` read from the raw `votes_<Map>` key.

| Field            | Raw key           |
| ---------------- | ----------------- |
| `votesAztec`     | `votes_Aztec`     |
| `votesCandyland` | `votes_Candyland` |
| `votesCastle`    | `votes_Castle`    |
| `votesDwarven`   | `votes_Dwarven`   |
| `votesEgypt`     | `votes_Egypt`     |
| `votesFantasy`   | `votes_Fantasy`   |
| `votesHarmony`   | `votes_Harmony`   |
| `votesIsland`    | `votes_Island`    |
| `votesJungle`    | `votes_Jungle`    |
| `votesLoveLand`  | `votes_LoveLand`  |
| `votesModern`    | `votes_Modern`    |
| `votesNordic`    | `votes_Nordic`    |
| `votesOutback`   | `votes_Outback`   |
| `votesSaraat`    | `votes_Saraat`    |
| `votesShire`     | `votes_Shire`     |
| `votesSpace`     | `votes_Space`     |
| `votesWild`      | `votes_Wild`      |

#### Periodic counters

| Field             | Type     | Raw key             |
| ----------------- | -------- | ------------------- |
| `monthlyAssistsA` | `number` | `monthly_assists_a` |
| `monthlyAssistsB` | `number` | `monthly_assists_b` |
| `weeklyAssistsA`  | `number` | `weekly_assists_a`  |
| `weeklyAssistsB`  | `number` | `weekly_assists_b`  |
| `monthlyKillsA`   | `number` | `monthly_kills_a`   |
| `monthlyKillsB`   | `number` | `monthly_kills_b`   |
| `weeklyKillsA`    | `number` | `weekly_kills_a`    |
| `weeklyKillsB`    | `number` | `weekly_kills_b`    |
| `monthlyWinsA`    | `number` | `monthly_wins_a`    |
| `monthlyWinsB`    | `number` | `monthly_wins_b`    |
| `weeklyWinsA`     | `number` | `weekly_wins_a`     |
| `weeklyWinsB`     | `number` | `weekly_wins_b`     |

#### Perks and skills

Each of the following fields is a `number` mapped from the matching raw key (camelCase property to snake_case raw key where they differ):

`adrenaline` (`adrenaline`), `artisan` (`artisan`), `attractor` (`attractor`), `bacon` (`bacon`), `berserk` (`berserk`), `blacksmith` (`blacksmith`), `blacksmithStarter` (`blacksmith_starter`), `bomberman` (`bomberman`), `bossDigger` (`boss_digger`), `bossGuardian` (`boss_guardian`), `bossSkills` (`boss_skills`), `burnBabyBurn` (`burn_baby_burn`), `canadian` (`canadian`), `catsEye` (`cats_eye`), `chainkiller` (`chainkiller`), `chef` (`chef`), `chemist` (`chemist`), `creeperEgg` (`creeper_egg`), `dwarwenSkills` (`dwarwen_skills`), `ecologist` (`ecologist`), `einstein` (`einstein`), `escapist` (`escapist`), `excavator` (`excavator`), `expertMiner` (`expert_miner`), `farmer` (`farmer`), `finalForm` (`final_form`), `fireproof` (`fireproof`), `fisherman` (`fisherman`), `fortune` (`fortune`), `getToTheChoppa` (`get_to_the_choppa`), `goldRush` (`gold_rush`), `graveDigger` (`grave_digger`), `grimReaper` (`grim_reaper`), `guitarist` (`guitarist`), `haste` (`haste`), `hunter` (`hunter`), `lazyman` (`lazyman`), `leatherWorker` (`leather_worker`), `masterTroll` (`master_troll`), `necromancer` (`necromancer`), `opportunity` (`opportunity`), `pyromaniac` (`pyromaniac`), `ready` (`ready`), `reallyShiny` (`really_shiny`), `redstoneExpert` (`redstone_expert`), `sage` (`sage`), `scotsman` (`scotsman`), `skybaseKing` (`skybase_king`), `smartBoy` (`smart_boy`), `snackLover` (`snack_lover`), `soupDrinker` (`soup_drinker`), `step` (`step`), `stoneGuardian` (`stone_guardian`), `swift` (`swift`), `tenacity` (`tenacity`), `thatsHot` (`thats_hot`), `tragedy` (`tragedy`), `trapEngineer` (`trap_engineer`), `vampirism` (`vampirism`), `veryFortunate` (`very_fortunate`), `vitality` (`vitality`).

#### Collections

| Field              | Type                               | Raw key            | Notes                                                               |
| ------------------ | ---------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `packages`         | `readonly string[]`                | `packages`         | Filtered to string entries; empty array when absent or not an array |
| `inventory`        | `Readonly<Record<string, string>>` | `Inventory`        | Slot-to-item string map; empty object when absent                   |
| `inventoryLayout`  | `Readonly<Record<string, string>>` | `InventoryLayout`  | Slot-to-item string map; empty object when absent                   |
| `inventoryLayout2` | `Readonly<Record<string, string>>` | `InventoryLayout2` | Slot-to-item string map; empty object when absent                   |
