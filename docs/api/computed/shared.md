# Shared Computed Helpers

Source: `src/computed/shared/*`. These are the building blocks every computed module
uses: ratio math, leveling curves, aggregation, oscillating repository values, and time
constants. All exports are pure functions or constant tables.

## Ratio math

Source: `src/computed/shared/ratio.ts`. These four functions define the
[unit convention](./#unit-conventions) used across every computed value.

### `round2(n)`

```ts
function round2(n: number): number;
```

Rounds to 2 decimal places: `Math.round(n * 100) / 100`.

### `ratio(a, b)`

```ts
function ratio(a: number, b: number): number;
```

`a / b` rounded to 2 decimal places, with the K/D convention for a zero denominator:
when `b === 0` the result is `a` itself (10 kills, 0 deaths is a K/D of 10). Contrast
with `percent()`, which yields `0` on a zero denominator.

### `percent(part, whole)`

```ts
function percent(part: number, whole: number): number;
```

`part / whole * 100` rounded to 2 decimal places, on the 0 to 100 scale. Returns `0`
when `whole === 0`.

### `perGame(value, games)`

```ts
function perGame(value: number, games: number): number;
```

Alias for `ratio(value, games)`; exists so per-game averages read naturally at call
sites. Same zero-denominator behavior as `ratio`.

### `neededForNextWholeRatio(numerator, denominator)`

```ts
function neededForNextWholeRatio(
  numerator: number,
  denominator: number,
): number;
```

How many more of the numerator you need, holding the denominator fixed, for the ratio to
reach its next whole number. For example with 27 kills and 10 deaths (K/D 2.7), the next
whole K/D is 3 and you need `3 * 10 - 27 = 3` more kills.

Formula: `target = floor(numerator / denominator) + 1`, result is
`max(0, ceil(target * denominator - numerator))`. Returns `0` when `denominator === 0`.
This backs the `*ForNextWhole*` fields in the mode computed modules.

## Leveling barrel

Source: `src/computed/shared/leveling.ts`. A pure re-export barrel:

```ts
export * from "./network-leveling";
export * from "./bedwars-leveling";
export * from "./skywars-leveling";
export * from "./guild-leveling";
export * from "./pit-leveling";
export * from "./woolgames-leveling";
```

Everything below in this section is importable from the barrel.

## Network leveling

Source: `src/computed/shared/network-leveling.ts`. The Hypixel network level curve:
level 1 to 2 costs 10,000 exp, and each subsequent level costs 2,500 exp more than the
one before it (a quadratic total-exp curve).

### `LevelProgress`

```ts
interface LevelProgress {
  readonly level: number; // fractional level, rounded to 2 dp
  readonly totalXp: number; // the input networkExp
  readonly currentXp: number; // exp into the current level
  readonly xpToNext: number; // full size of the current level step
  readonly remainingXp: number; // xpToNext - currentXp
  readonly percent: number; // 0-100 progress through the current level
  readonly percentRemaining: number; // 100 - percent
}
```

### `levelStartXp(level)`

```ts
function levelStartXp(level: number): number;
```

Total network exp at which whole level `level` begins. With `p = level - 1`:
`1250 * p^2 + 8750 * p` (that is `(GROWTH/2) * p^2 + (BASE - GROWTH/2) * p` with
`BASE = 10_000`, `GROWTH = 2_500`). `levelStartXp(1)` is `0`.

### `networkLevel(networkExp)`

```ts
function networkLevel(networkExp: number): LevelProgress;
```

Full progress for a raw `networkExp`. The fractional level is the closed-form inverse of
the quadratic curve: `1 - 3.5 + sqrt(3.5^2 + exp / 1250)`, rounded to 2 decimal places.
The exp step for the current level is `2500 * floor(level) + 5000` (and a flat `10000`
below the first threshold).

## BedWars leveling

Source: `src/computed/shared/bedwars-leveling.ts`. BedWars stars advance in prestige
cycles of 100 levels. Within each cycle the first four levels are cheap (500, 1000,
2000, 3500 xp) and every later level costs a flat 5,000 xp.

### `BEDWARS_PRESTIGE_CYCLE_XP`

```ts
const BEDWARS_PRESTIGE_CYCLE_XP = 487_000;
```

Total xp of one full 100-level prestige cycle: `500 + 1000 + 2000 + 3500 + 96 * 5000`.

### `bedwarsStar(experience)`

```ts
function bedwarsStar(experience: number): number;
```

Fractional BedWars star for a raw experience value. The whole hundreds come from
`floor(experience / 487000) * 100`; the remainder walks the early-level thresholds
(totals 0, 500, 1500, 3500, 7000) and then the flat 5,000 xp steps. The fraction is the
linear progress inside the current step (not rounded).

### `bedwarsXpToNextLevel(experience)`

```ts
function bedwarsXpToNextLevel(experience: number): number;
```

Xp remaining to the next whole star. Inside the early levels it is the distance to the
next early threshold; afterwards it is `5000 - ((cycleXp - 7000) % 5000)`.

### `BedwarsPrestige` and `bedwarsPrestige(star)`

```ts
interface BedwarsPrestige {
  readonly bracket: number; // floor(star / 100), clamped to 0..100
  readonly name: string; // e.g. "Rainbow"
  readonly colorCode: string; // Minecraft-formatted tag, e.g. "§c[§61§e0§a0§b0§d✫§5]"
}

function bedwarsPrestige(star: number): BedwarsPrestige;
```

Maps a star count to its prestige bracket. The bracket index is `floor(star / 100)`
clamped to the range 0 to 100, then looked up in `BEDWARS_PRESTIGES`.

### `BEDWARS_PRESTIGES`

```ts
const BEDWARS_PRESTIGES: readonly {
  readonly level: number;
  readonly name: string;
  readonly colorCode: string;
}[];
```

The full 101-entry prestige table (brackets 0 through 100). Entry `i` covers stars
`i * 100` to `i * 100 + 99` (the first entry is listed at level 1; the last covers
10,000+).

| Level | Name           | Color code              |
| ----- | -------------- | ----------------------- |
| 1     | Stone          | `§7[1✫]`                |
| 100   | Iron           | `§f[100✫]`              |
| 200   | Gold           | `§6[200✫]`              |
| 300   | Diamond        | `§b[300✫]`              |
| 400   | Emerald        | `§2[400✫]`              |
| 500   | Sapphire       | `§3[500✫]`              |
| 600   | Ruby           | `§4[600✫]`              |
| 700   | Crystal        | `§d[700✫]`              |
| 800   | Opal           | `§9[800✫]`              |
| 900   | Amethyst       | `§5[900✫]`              |
| 1000  | Rainbow        | `§c[§61§e0§a0§b0§d✫§5]` |
| 1100  | Iron Prime     | `§7[§f1100§7✪]`         |
| 1200  | Gold Prime     | `§7[§e1200§6✪§7]`       |
| 1300  | Diamond Prime  | `§7[§b1300§3✪§7]`       |
| 1400  | Emerald Prime  | `§7[§a1400§2✪§7]`       |
| 1500  | Sapphire Prime | `§7[§31500§9✪§7]`       |
| 1600  | Ruby Prime     | `§7[§c1600§4✪§7]`       |
| 1700  | Crystal Prime  | `§7[§d1700§5✪§7]`       |
| 1800  | Opal Prime     | `§7[§91800§1✪§7]`       |
| 1900  | Amethyst Prime | `§7[§51900§8✪§7]`       |
| 2000  | Mirror         | `§8[§72§f00§70✪§8]`     |
| 2100  | Light          | `§7[2§e10§60⚝]`         |
| 2200  | Dawn           | `§6[2§f20§b0§3⚝]`       |
| 2300  | Dusk           | `§5[2§d30§60§e⚝]`       |
| 2400  | Air            | `§b[2§f40§70⚝§8]`       |
| 2500  | Wind           | `§7[2§a50§20⚝]`         |
| 2600  | Nebula         | `§4[2§c60§d0⚝§5]`       |
| 2700  | Thunder        | `§e[2§f70§80⚝]`         |
| 2800  | Earth          | `§a[2§280§60⚝§e]`       |
| 2900  | Water          | `§b[2§390§90⚝§1]`       |
| 3000  | Fire           | `§e[3§600§c0⚝§4]`       |
| 3100  | Sunrise        | `§9[3§310§60✥§e]`       |
| 3200  | Eclipse        | `§c[§43§720§40§c✥]`     |
| 3300  | Gamma          | `§9[33§d0§c0✥§4]`       |
| 3400  | Majestic       | `§2[§a3§d40§50✥§2]`     |
| 3500  | Andesine       | `§c[3§450§20§a✥]`       |
| 3600  | Marine         | `§a[36§b0§90✥§1]`       |
| 3700  | Element        | `§4[3§c70§b0§3✥]`       |
| 3800  | Galaxy         | `§1[3§98§500§d✥§1]`     |
| 3900  | Atomic         | `§c[3§a90§30§9✥]`       |
| 4000  | Sunset         | `§5[4§c00§60✥§e]`       |
| 4100  | Time           | `§e[4§61§c0§d0✥§5]`     |
| 4200  | Winter         | `§1[§94§32§b0§f0§7✥]`   |
| 4300  | Obsidian       | `§0[§54§830§50✥§0]`     |
| 4400  | Spring         | `§2[4§a4§e0§60§5✥§d]`   |
| 4500  | Ice            | `§f[4§b50§30✥]`         |
| 4600  | Summer         | `§3[§b4§e60§60§d✥§5]`   |
| 4700  | Spinel         | `§f[§44§c70§90§1✥§9]`   |
| 4800  | Autumn         | `§5[4§c8§600§b✥§3]`     |
| 4900  | Mystic         | `§2[§a4§f900§a✥§2]`     |
| 5000  | Eternal        | `§4[5§50§900§1✥§0]`     |
| 5100  | Burnout        | `§4[§c51§60§e0§f✥§4]`   |
| 5200  | Cooldown       | `§1[§95§32§b0§f0§e✥§1]` |
| 5300  | Obliteration   | `§5[§d5§e3§f0§e0§d✥§5]` |
| 5400  | Ender          | `§3[§a5§24§80§20§a✥§3]` |
| 5500  | Brust          | `§2[§a5§e5§f0§b0§d✥§5]` |
| 5600  | Comical        | `§4[§c5§e6§f0§e0§c✥§4]` |
| 5700  | Lusterlost     | `§4[§65§27§30§90§5✥§8]` |
| 5800  | Maelstrom      | `§5[§c5§68§f0§b0§3✥§9]` |
| 5900  | Time Undone    | `§7[§05§89§70§f0✥§7]`   |
| 6000  | Umbrella       | `§c[§f6000§c✥§f]`       |
| 6100  | Luminous       | `§6[§e6§f100§b✥§3]`     |
| 6200  | Tortilla       | `§e[§f6§e2§600§f✥§e]`   |
| 6300  | Corn           | `§a[§e6300§a✥§2]`       |
| 6400  | Bittersweet    | `§b[6§c400§a✥]`         |
| 6500  | Sweetsour      | `§3[6§a50§f0§a✥§3]`     |
| 6600  | Pop            | `§9[§d6600§b✥§9]`       |
| 6700  | Bubblegum      | `§5[§d6700§f✥§5]`       |
| 6800  | Contrast       | `§0[§668§e00§f✥]`       |
| 6900  | Blended        | `§a[690§20✥§8]`         |
| 7000  | Allay          | `§3[§b7000§f✥§3]`       |
| 7100  | Blaze          | `§4[§c7§61§e0§c0§6✥§e]` |
| 7200  | Creeper        | `§2[§a7§f2§20§a0§f✥§8]` |
| 7300  | Drowned        | `§2[§373§b00§a✥§2]`     |
| 7400  | Enderman       | `§8[7400§d✥§8]`         |
| 7500  | Frog           | `§6[7§250§f0✥]`         |
| 7600  | Ghast          | `§f[76§700§c✥§8]`       |
| 7700  | Hoglin         | `§d[§c7700§6✥§d]`       |
| 7800  | Iron Golem     | `§8[§77§f800§e✥§8]`     |
| 7900  | Jerry          | `§6[§f7§29§60§20§f✥§6]` |
| 8000  | Kringle        | `§2[§a800§c0§4✥§2]`     |
| 8100  | Liquid         | `§8[§78§f1§b0§30§9✥§1]` |
| 8200  | Mint           | `§f[8200§a✥§f]`         |
| 8300  | Neglected      | `§8[8§430§c0✥§8]`       |
| 8400  | Onion          | `§f[§d840§a0✥§f]`       |
| 8500  | Poser          | `§3[§68500§e✥§3]`       |
| 8600  | Quartz         | `§d[§f8600§e✥§d]`       |
| 8700  | Rich           | `§8[§68700✥§8]`         |
| 8800  | Sanguine       | `§4[88§c00§f✥]`         |
| 8900  | Titanic        | `§9[§b890§30✥§9]`       |
| 9000  | Unorthodox     | `§d[9000§5✥§8]`         |
| 9100  | Volcanic       | `§0[§c9§610§c0✥§4]`     |
| 9200  | Weeping Cherry | `§2[§d9200§a✥§2]`       |
| 9300  | X-Ray          | `§f[§89300§f✥]`         |
| 9400  | Yearn          | `§e[§69§44§800✥]`       |
| 9500  | Zebra          | `§0[9§850§70✥§f]`       |
| 9600  | Caution        | `§e[96§000§e✥§0]`       |
| 9700  | Indescribable  | `§d[97§e00§b✥§e]`       |
| 9800  | Forgotten      | `§0[§89800✥§0]`         |
| 9900  | Fuse           | `§8[§79§f900§e✥§f]`     |
| 10000 | Prestigious    | `§9[§b1§f0000§c✥§4]`    |

## SkyWars leveling

Source: `src/computed/shared/skywars-leveling.ts`. The first 19 levels use a fixed
per-level xp list (0, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 1250, 1500, 1750, 2000,
2500, 3000, 3500, 4000, 4500; total 26,760 xp), then every level costs a flat 5,000 xp,
capped at level 10,000.

### `SkyWarsLevel` and `skywarsLevel(experience)`

```ts
interface SkyWarsLevel {
  readonly level: number; // whole level
  readonly currentXp: number; // xp into the current level
  readonly required: number; // xp size of the current step (0 at the 10,000 cap)
  readonly totalXp: number; // the input experience
}

function skywarsLevel(experience: number): SkyWarsLevel;
```

Below the fixed-list total, the level is the index of the first cumulative threshold
above the xp, `currentXp` is the leftover after subtracting completed steps, and
`required` is the next step size from the list (`0` if none). At or above the fixed-list
total, the level is `floor((xp - 26760) / 5000) + 19` clamped to 10,000, `currentXp` is
`(xp - 26760) % 5000`, and `required` is `5000` (or `0` when capped).

## Guild leveling

Source: `src/computed/shared/guild-leveling.ts`. Per-level costs step through 100k,
150k, 250k, 500k, 750k, 1M, 1.25M, 1.5M, 2M, then 2.5M five times, then a flat 3M for
every level after that, up to a hard cap of level 1,000.

### `guildLevel(exp)`

```ts
function guildLevel(exp: number): number;
```

Fractional guild level rounded to 2 decimal places: whole levels consumed by the cost
table, plus `remaining / costOfCurrentLevel`. Returns `1000` at or beyond the cap.

### `guildExpUntilNextLevel(exp)`

```ts
function guildExpUntilNextLevel(exp: number): number;
```

Exp remaining until the next whole guild level (the current level's cost minus the exp
already inside it). Returns `0` at or beyond the level 1,000 cap.

## Pit leveling

Source: `src/computed/shared/pit-leveling.ts`. Pit progression has 51 prestiges, each
with an xp multiplier and a cumulative xp requirement (`sumXp`), and 120 levels per
prestige. Level costs come in blocks of 10: the base costs per block are 15, 30, 50, 75,
125, 300, 600, 800, 900, 1000, 1200, 1500, each multiplied by the prestige's multiplier
(1x at prestige 0, up to 100,000x at prestige 50).

The `prestiges` argument in all three functions is the player's raw prestige log
(`raw.prestiges` from the parsed Pit stats); only the `index` of the last entry is
read, defaulting to `0` when the log is empty.

### `PitProgress` and `pitProgress(xp, prestiges)`

```ts
interface PitProgress {
  readonly level: number; // 0-120 within the current prestige
  readonly prestige: number; // index of the latest prestige entry, 0 when none
}

function pitProgress(xp: number, prestiges: readonly unknown[]): PitProgress;
```

The xp is first reduced by the previous prestige's cumulative `sumXp` (prestige-adjusted
xp), then walked through the multiplied level-cost blocks, capping at level 120.

### `pitXpForNextLevel(xp, prestiges)`

```ts
function pitXpForNextLevel(xp: number, prestiges: readonly unknown[]): number;
```

Xp still needed to reach the next whole Pit level within the current prestige
(`ceil` of the difference, floored at `0`). Returns `0` at level 120.

### `pitXpForNextPrestige(xp, prestiges)`

```ts
function pitXpForNextPrestige(
  xp: number,
  prestiges: readonly unknown[],
): number;
```

`max(0, sumXp[currentPrestige] - xp)`: total xp still needed to unlock the next
prestige. Returns `0` when the prestige index has no table entry.

## Wool Games leveling

Source: `src/computed/shared/woolgames-leveling.ts`. The first five levels use fixed
cumulative thresholds (0, 1000, 3000, 6000, 10000, 15000 exp), then every level costs a
flat 5,000 exp up to level 100. The curve wraps every 490,000 exp: level 101 begins at
490,000 total exp and the whole curve repeats from level 1's costs (recursively, so it
wraps again at 200, 300, and so on).

### `WoolGamesLevel` and `woolGamesLevel(exp)`

```ts
interface WoolGamesLevel {
  readonly exactLevel: number; // fractional, rounded to 2 dp
  readonly level: number; // floor(exactLevel)
}

function woolGamesLevel(exp: number): WoolGamesLevel;
```

### `woolGamesXpForNextLevel(exp)`

```ts
function woolGamesXpForNextLevel(exp: number): number;
```

Exp remaining to the next whole Wool Games level: the exp required at
`floor(exactLevel) + 1` minus the current exp, floored at `0`. Handles the post-100
wraparound by recursing in 490,000-exp cycles.

## SkyBlock leveling

Source: `src/computed/shared/skyblock-leveling.ts`. The general SkyBlock xp engine plus
skill, dungeon, garden, slayer, and pet levels.

### `XpLevel`

The shape shared by skills, dungeons, garden, and crop milestones:

```ts
interface XpLevel {
  readonly level: number; // whole level, capped unless the curve is infinite
  readonly xpCurrent: number; // xp into the current level
  readonly xpForNext: number; // cost of the next level (Infinity when capped and finite)
  readonly progress: number; // xpCurrent / xpForNext clamped to 0..1; 0 when maxed on a finite curve
  readonly totalXp: number; // the raw input xp (NaN and non-numbers coerce to 0)
  readonly maxed: boolean; // level >= cap (or >= cap on an infinite curve)
}
```

### `SkillType`

```ts
type SkillType =
  | "farming"
  | "mining"
  | "combat"
  | "foraging"
  | "fishing"
  | "enchanting"
  | "alchemy"
  | "taming"
  | "carpentry"
  | "runecrafting"
  | "social"
  | "hunting";
```

### `levelByXp(rawXp, xpTable, levelCap, isInfinite)`

```ts
function levelByXp(
  rawXp: number,
  xpTable: Record<number, number>,
  levelCap: number,
  isInfinite: boolean,
): XpLevel;
```

The core engine. `xpTable` maps level number to the xp cost of reaching that level from
the one before. The xp is walked through the table; with `isInfinite` set, leftover xp
past the end of the table keeps granting levels at the table's last cost (this is how
Catacombs continues past 50). On a finite curve the level is clamped to `levelCap`,
`xpForNext` is `Infinity` once capped, and `progress` reads `0` when maxed. `NaN` or
non-numeric xp is treated as `0`.

### `skillLevel(xp, type, cap?)`

```ts
function skillLevel(xp: number, type: SkillType, cap?: number): XpLevel;
```

Level for one of the twelve skills. Tables: `runecrafting` and `social` have their own
25-level tables; every other skill uses the default 60-level table (50 xp for level 1 up
to 7,000,000 xp for level 60). Default caps: 60 for `mining`, `combat`, `enchanting`;
25 for `runecrafting`, `social`; 60 for `hunting` (the full default table); 50 for
everything else. Pass `cap` to override (used for the member-specific farming and taming
caps). Skill curves are always finite.

### `dungeonLevel(xp)`

```ts
function dungeonLevel(xp: number): XpLevel;
```

Catacombs/class level on the 51-entry dungeoneering table (50 xp at level 1 through
200,000,000 at level 51), cap 50, **infinite**: past the table, each additional level
costs the last table entry, so `level` can exceed 50 while `maxed` is `true` from 50 on.

### `gardenLevel(xp)`

```ts
function gardenLevel(xp: number): XpLevel;
```

Garden level on the fixed 15-level table (0, 70, 70, 140, 240, 600, 1500, 2000, 2500,
3000, then 10,000 for each of levels 11 to 15), cap 15, finite.

### `SlayerLevel` and `slayerLevel(type, xp)`

```ts
interface SlayerLevel {
  readonly level: number;
  readonly xp: number;
  readonly xpForNext: number; // cumulative xp required for the next level, 0 when maxed
  readonly progress: number; // xp / xpForNext clamped to 0..1, 0 when maxed
  readonly maxLevel: number; // 9 for most bosses, 5 for vampire
  readonly maxed: boolean;
}

function slayerLevel(type: string, xp: number): SlayerLevel;
```

Slayer levels use **cumulative** thresholds per boss type (unlike the incremental skill
tables): the level is the highest threshold the xp meets. Tables exist for `zombie`,
`spider`, `wolf`, `enderman`, `blaze` (nine levels, 1,000,000 xp at level 9; the early
thresholds differ slightly per boss) and `vampire` (five levels: 20, 75, 240, 840,
2400). An unknown `type` returns an all-zero `SlayerLevel` with `maxed: false`.

### `PetLevel` and `petLevel(xp, rarity, type?)`

```ts
interface PetLevel {
  readonly level: number; // 1-based; 1 at 0 xp
  readonly xpCurrent: number; // xp past the last completed level
  readonly xpForMax: number; // total xp of the full curve for this rarity
  readonly progress: number; // xpCurrent / cost of the next level (0 when NaN)
  readonly maxed: boolean;
}

function petLevel(xp: number, rarity: string, type?: string): PetLevel;
```

Pet levels slice a single global 119-entry cost list at a rarity offset: `COMMON` 0,
`UNCOMMON` 6, `RARE` 11, `EPIC` 16, `LEGENDARY` and `MYTHIC` 20; `DIVINE`, `SPECIAL`,
`VERY_SPECIAL`, `UNKNOWN`, and unknown rarities use offset 0. Two type overrides:

- `type === "BINGO"` forces offset 0 regardless of rarity;
- `type === "GOLDEN_DRAGON"` raises the max level from 100 to 200 by appending a special
  tail (level 101 is free, level 102 costs 5,555 xp, then 98 levels at 1,886,700 xp
  each).

`maxed` is `true` only at exactly the max level (100, or 200 for Golden Dragons).

## Garden crop leveling

Source: `src/computed/shared/garden-leveling.ts`.

### `CropType`

```ts
type CropType =
  | "wheat"
  | "carrot"
  | "sugarCane"
  | "potato"
  | "pumpkin"
  | "melon"
  | "cactus"
  | "cocoaBeans"
  | "mushroom"
  | "netherWart"
  | "moonFlower"
  | "sunFlower"
  | "wildRose";
```

### Crop milestones

Milestone tables are built from two 25-step base curves and extended to the milestone
cap of 46 by repeating the last step:

- **Wheat curve** (30, 50, 80, 200, ... 800,000): used directly by `wheat`, `pumpkin`,
  `mushroom`, `sunFlower`; scaled by 2 for `sugarCane`, `cactus`, `wildRose`; scaled by
  3 for `cocoaBeans`, `netherWart`; scaled by 5 for `melon`.
- **Carrot curve** (100, 150, 250, 500, ... 2,600,000): used by `carrot` and `potato`.
- **Moonflower curve**: the wheat curve with step 5 changed from 350 to 700, used by
  `moonFlower`.

### `cropMilestoneLevel(crop, xp)`

```ts
function cropMilestoneLevel(crop: CropType, xp: number): XpLevel;
```

`levelByXp` over the crop's table with cap 46, finite. The "xp" is the crop's collection
count.

## Aggregation

Source: `src/computed/shared/aggregate.ts`.

### `sum(values)`

```ts
function sum(
  values: readonly number[] | Readonly<Record<string, number>>,
): number;
```

Sums an array of numbers or the values of a numeric record. Empty input sums to `0`.

### `argMax(source, floor?)`

```ts
function argMax(
  source:
    | Readonly<Record<string, number>>
    | readonly (readonly [string, number])[],
  floor = -Infinity,
): string | null;
```

Returns the key (or tuple first element) with the strictly greatest value. A candidate
must exceed `floor` (default `-Infinity`) to be considered, so passing `floor = 0`
returns `null` unless some value is positive. Ties keep the first entry encountered.
Returns `null` for empty input.

### `median(values)`

```ts
function median(values: readonly number[]): number;
```

The median of the values (mean of the two middle values for even lengths). Returns `0`
for an empty array. Does not mutate the input.

### `minPositive(values)`

```ts
function minPositive(values: readonly number[]): number;
```

The smallest value strictly greater than `0`, or `0` when there is none.

## Game registry

Source: `src/computed/shared/games.ts`.

### `GameInfo` and `GAMES`

```ts
interface GameInfo {
  readonly id: number; // Hypixel numeric game type id
  readonly code: string; // API code, e.g. "BEDWARS"
  readonly name: string; // display name, e.g. "Bed Wars"
}

const GAMES: readonly GameInfo[];
```

The known game types:

| Id  | Code             | Name                 |
| --- | ---------------- | -------------------- |
| 2   | `QUAKECRAFT`     | Quakecraft           |
| 3   | `WALLS`          | Walls                |
| 4   | `PAINTBALL`      | Paintball            |
| 5   | `SURVIVAL_GAMES` | Blitz Survival Games |
| 6   | `TNTGAMES`       | The TNT Games        |
| 7   | `VAMPIREZ`       | VampireZ             |
| 13  | `WALLS3`         | Mega Walls           |
| 14  | `ARCADE`         | Arcade               |
| 17  | `ARENA`          | Arena Brawl          |
| 20  | `UHC`            | UHC Champions        |
| 21  | `MCGO`           | Cops and Crims       |
| 23  | `BATTLEGROUND`   | Warlords             |
| 24  | `SUPER_SMASH`    | Smash Heroes         |
| 25  | `GINGERBREAD`    | Turbo Kart Racers    |
| 26  | `HOUSING`        | Housing              |
| 51  | `SKYWARS`        | SkyWars              |
| 52  | `TRUE_COMBAT`    | Crazy Walls          |
| 54  | `SPEED_UHC`      | Speed UHC            |
| 55  | `SKYCLASH`       | SkyClash             |
| 56  | `LEGACY`         | Classic Games        |
| 57  | `PROTOTYPE`      | Prototype            |
| 58  | `BEDWARS`        | Bed Wars             |
| 59  | `MURDER_MYSTERY` | Murder Mystery       |
| 60  | `BUILD_BATTLE`   | Build Battle         |
| 61  | `DUELS`          | Duels                |
| 63  | `SKYBLOCK`       | SkyBlock             |
| 64  | `PIT`            | Pit                  |
| 65  | `REPLAY`         | Replay               |
| 67  | `SMP`            | SMP                  |
| 68  | `WOOL_GAMES`     | Wool Games           |

### `gameByCode(code)` and `gameById(id)`

```ts
function gameByCode(code: string): GameInfo;
function gameById(id: number): GameInfo;
```

Total lookups (they never return `undefined`). An unknown code yields
`{ id: 0, code, name: code }`; an unknown id yields
`{ id, code: "UNKNOWN", name: "Unknown" }`.

## Oscillation

Source: `src/computed/shared/oscillation.ts`. Hypixel's repository data encodes some
values as an `a`/`b` pair that alternates monthly or weekly; these helpers pick the
active one for a given `Date`.

### `monthBucket(now)`

```ts
function monthBucket(now: Date): "a" | "b";
```

`"a"` in odd months (February, April, ...; `getMonth() % 2 === 1`), `"b"` in even
months (January, March, ...).

### `weekBucket(now)`

```ts
function weekBucket(now: Date): "a" | "b";
```

Whole weeks elapsed since the fixed epoch `1417237200000` (2014-11-29 05:00 UTC, the
weekly oscillation start): odd week counts are `"a"`, even are `"b"`.

### `monthlyValue(a, b, now)` and `weeklyValue(a, b, now)`

```ts
function monthlyValue(a: number, b: number, now: Date): number;
function weeklyValue(a: number, b: number, now: Date): number;
```

Return `a` when the corresponding bucket is `"a"`, otherwise `b`.

## Time constants

Source: `src/computed/shared/time.ts`.

```ts
const DAY_MS = 86_400_000; // one day in milliseconds
const WEEK_MS = 7 * DAY_MS; // one week in milliseconds (604,800,000)
```

Used for `ageInDays`-style fields and the weekly oscillation bucket.

