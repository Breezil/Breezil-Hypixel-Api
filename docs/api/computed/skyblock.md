# SkyBlock Member Computed

Source: `src/computed/skyblock.ts`. Attached as `.computed` on every
[`EnrichedSkyBlockMember`](./) inside a profile returned by `skyblockProfiles()` or
`skyblockProfile()` (both the queried `member` and every entry of `members`).

```ts
export function computeSkyBlockMember(
  raw: SkyBlockMember,
): SkyBlockMemberComputed;
```

## `SkyBlockMemberComputed`

```ts
interface SkyBlockMemberComputed {
  readonly skills: Record<SkillType, XpLevel>;
  readonly averageSkillLevel: number;
  readonly nonCosmeticAverageSkillLevel: number;
  readonly totalSkillXp: number;
  readonly maxedSkillCount: number;
  readonly farmingLevelCap: number;
  readonly tamingLevelCap: number;
  readonly slayers: Record<string, SkyBlockSlayerComputed>;
  readonly totalSlayerXp: number;
  readonly activeSlayerQuestElapsedMs: number | null;
  readonly catacombs: XpLevel;
  readonly masterCatacombs: XpLevel;
  readonly catacombsBestRunScores: Record<string, readonly number[]>;
  readonly masterCatacombsBestRunScores: Record<string, readonly number[]>;
  readonly dungeonClasses: Record<string, XpLevel>;
  readonly classAverage: number;
  readonly classXpShare: Record<string, number>;
  readonly dominantClass: string | null;
  readonly mostPlayedFloor: string | null;
  readonly secretsPerRun: number;
  readonly treasureChestCountByRun: Record<string, number>;
  readonly pets: readonly SkyBlockPetComputed[];
  readonly activePet: SkyBlockPetComputed | null;
  readonly petCount: number;
  readonly petScore: number;
  readonly maxedPetCount: number;
  readonly topSlayer: string | null;
  readonly skyblockLevel: number;
}
```

`XpLevel` is the shared leveling shape (`level`, `xpCurrent`, `xpForNext`, `progress`,
`totalXp`, `maxed`) documented in [Shared helpers](./shared#xplevel).

## Skills

### `skills`

One `XpLevel` per skill, computed by `skillLevel(xp, type, cap)` over all twelve skill
types: `farming`, `mining`, `combat`, `foraging`, `fishing`, `enchanting`, `alchemy`,
`taming`, `carpentry`, `runecrafting`, `social`, `hunting`.

Two skills use member-specific caps instead of the table defaults:

- **farming**: `farmingLevelCap` (see below);
- **taming**: `tamingLevelCap` (see below).

All other skills use the shared default caps (mining, combat, enchanting cap at 60;
runecrafting and social at 25; the rest at 50).

### `averageSkillLevel`

The plain mean of the `level` values of these eleven skills, rounded to 2 decimal
places: `farming`, `mining`, `combat`, `foraging`, `fishing`, `enchanting`, `alchemy`,
`taming`, `carpentry`, `runecrafting`, `social`. Hunting is excluded.

### `nonCosmeticAverageSkillLevel`

The same mean over the nine non-cosmetic skills only: `farming`, `mining`, `combat`,
`foraging`, `fishing`, `enchanting`, `alchemy`, `taming`, `carpentry` (excludes
`runecrafting`, `social`, and `hunting`). This matches the community "skill average"
convention.

### `totalSkillXp`

The sum of `raw.skillExperience[type]` across all twelve skill types.

### `maxedSkillCount`

How many of the twelve skills have `maxed === true` (level at or above their cap).

### `farmingLevelCap`

`50 + raw.jacobContests.perks.farmingLevelCap`. The base cap of 50 plus the levels
bought with Jacob's contest medals (up to 60 in-game).

### `tamingLevelCap`

`50 + raw.pets.sacrificedPetTypes.length`. The base cap of 50 plus one level per unique
pet type sacrificed at the Forge (up to 60 in-game).

## Slayers

### `slayers`

One entry per boss present in `raw.slayers.bosses` (keys such as `zombie`, `spider`,
`wolf`, `enderman`, `blaze`, `vampire`):

```ts
interface SkyBlockSlayerComputed extends SlayerLevel {
  readonly totalBossKills: number; // kills summed over tiers 0-4
  readonly bossAccuracy: number; // totalBossKills / total attempts (tiers 0-4)
}
```

`SlayerLevel` contributes `level`, `xp`, `xpForNext`, `progress`, `maxLevel`, and
`maxed` from `slayerLevel(name, boss.xp)`; see
[Shared helpers](./shared#slayerlevel-and-slayerlevel). `bossAccuracy` is a bare
quotient following the `ratio()` convention (with zero attempts it equals the kill
count).

### `totalSlayerXp`

The sum of `boss.xp` over every boss in `raw.slayers.bosses`.

### `activeSlayerQuestElapsedMs`

`Date.now() - activeQuest.startTimestamp` when a slayer quest is active and has a
non-zero start timestamp; otherwise `null`.

### `topSlayer`

The boss name with the highest xp, via `argMax` with floor `0`: a boss must have xp
strictly greater than `0`, otherwise `null`.

## Dungeons

### `catacombs` and `masterCatacombs`

`dungeonLevel(experience)` for the normal and master mode Catacombs experience. The
dungeoneering curve is infinite past level 50 (it keeps consuming the last step's xp),
so `maxed` flips at 50 but `level` can keep growing.

### `catacombsBestRunScores` and `masterCatacombsBestRunScores`

For each floor key in the mode's `bestRuns`, an array of total scores, one per recorded
best run: `scoreExploration + scoreSpeed + scoreSkill + scoreBonus`.

### `dungeonClasses`

An `XpLevel` per dungeon class (`healer`, `mage`, `berserk`, `archer`, `tank`) from
`dungeonLevel(classExperience[name].experience)`. A class the member never played is
computed from `0` xp.

### `classAverage`

The mean of the five class `level` values, rounded to 2 decimal places.

### `classXpShare`

Each class's share of the summed class experience, 0 to 100 (`percent()`; all shares are
`0` when total class xp is `0`).

### `dominantClass`

The class with the most experience via `argMax` (default floor `-Infinity`). Because
xp is non-negative and the floor is `-Infinity`, this always resolves to a class; a
member with zero xp in every class gets the first one checked (`healer`). Ties keep the
earlier class in the fixed order `healer`, `mage`, `berserk`, `archer`, `tank`.

### `mostPlayedFloor`

The catacombs floor key with the most tier completions, taken from
`raw.dungeons.catacombs.tierCompletions` with the `"total"` key filtered out. `null`
when there are no floor entries.

### `secretsPerRun`

`ratio(raw.dungeons.secrets, tierCompletions.total ?? 0)`: found secrets per completed
run, a bare quotient (equal to the secret count when the member has zero completions).

### `treasureChestCountByRun`

A record from dungeon run id to how many treasure chests were rolled for that run. Every
run in `treasures.runs` starts at `0`; each chest in `treasures.chests` increments its
`runId` (chests whose run is not listed still get counted, starting from `0`).

## Pets

### `pets`

Every pet the member owns:

```ts
interface SkyBlockPetComputed {
  readonly type: string; // e.g. "ENDER_DRAGON"
  readonly tier: string; // rarity, e.g. "LEGENDARY"
  readonly active: boolean;
  readonly level: PetLevel; // from petLevel(experience, tier, type)
}
```

`PetLevel` (`level`, `xpCurrent`, `xpForMax`, `progress`, `maxed`) is documented in
[Shared helpers](./shared#petlevel-and-petlevel). Golden Dragons level to 200; every
other pet levels to 100.

### `activePet`

The first pet with `active === true`, or `null`.

### `petCount`

`pets.length`.

### `petScore`

The in-game pet score, matching the SkyCrypt/reborn convention:

- for each distinct pet type, take the rarity index of the highest-rarity copy owned
  (`COMMON` 1, `UNCOMMON` 2, `RARE` 3, `EPIC` 4, `LEGENDARY` 5, `MYTHIC` 6, `DIVINE` 7,
  `SUPREME` 8, `SPECIAL` 9, `VERY_SPECIAL` 10, `ADMIN` 11) and sum those indices;
- add `+1` for each distinct pet type that has at least one max-level copy.

Pets with type `"UNKNOWN"`, pets whose tier is not in the rarity table, and the
Rift-only `FRACTURED_MONTEZUMA_SOUL` are excluded entirely.

### `maxedPetCount`

How many owned pets (individual pets, not distinct types) have `level.maxed === true`.

## SkyBlock level

### `skyblockLevel`

`raw.leveling.experience / 100`: the member's fractional SkyBlock level (the game grants
one level per 100 SkyBlock leveling xp). Not rounded.

## Exports

| Export                   | Kind      | Description                                            |
| ------------------------ | --------- | ------------------------------------------------------ |
| `SkyBlockSlayerComputed` | interface | `SlayerLevel` plus `totalBossKills` and `bossAccuracy` |
| `SkyBlockPetComputed`    | interface | Pet identity plus its computed `PetLevel`              |
| `SkyBlockMemberComputed` | interface | The `.computed` shape on an enriched profile member    |
| `computeSkyBlockMember`  | function  | `(raw: SkyBlockMember) => SkyBlockMemberComputed`      |

