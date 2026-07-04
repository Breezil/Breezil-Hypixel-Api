# WoolGames

The WoolGames module exposes a single parser, `parseWoolGames`, which mirrors the raw `stats.WoolGames` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals. WoolGames bundles several sub-games, including the now-retired legacy Sheep Wars and Capture the Wool, whose blocks are still typed here because old players retain that data.

## parseWoolGames

Parses a player's WoolGames stats (`stats.WoolGames`) into a typed object.

```ts
function parseWoolGames(block: Record<string, unknown>): WoolGamesStats | null;
```

### Null / empty behavior

`parseWoolGames` returns `null` when the raw block has no keys (empty or absent). Otherwise it returns a fully-populated `WoolGamesStats` object, with missing values filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- String-array fields (`packages`) become empty arrays (`[]`) when absent.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.

The dynamic maps (`woolWars.classes`, `woolWars.tourney`, `woolWars.layouts`, `sheepWars.layout.slot`, `captureTheWool.layout`) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### WoolGamesStats

The root object returned by `parseWoolGames`.

```ts
interface WoolGamesStats {
  readonly coins: number;
  readonly dataMigrationVersion: number;
  readonly playtime: number;
  readonly lastTourneyAd: Date | null;
  readonly hat: string;
  readonly cage: string;
  readonly glyph: string;
  readonly barrier: string;
  readonly deathcry: string;
  readonly killmessages: string;
  readonly preroundBow: string;
  readonly projectileTrail: string;
  readonly woolWarsPrestigeIcon: string;
  readonly shopSort: string;
  readonly shopSortEnableOwnedFirst: boolean;
  readonly packages: readonly string[];
  readonly leaderboardSettings: WoolGamesLeaderboardSettings;
  readonly privateGames: WoolGamesPrivateGames;
  readonly progression: WoolGamesProgression;
  readonly woolWars: WoolWarsStats;
  readonly sheepWars: SheepWarsStats;
  readonly sheepWarsLegacy: SheepWarsLegacyStats;
  readonly captureTheWool: CaptureTheWoolStats;
}
```

| Field             | Notes                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `lastTourneyAd`   | Epoch-ms timestamp as `Date`, or `null`.                                                        |
| `projectileTrail` | Raw `projectiletrail`.                                                                          |
| `preroundBow`     | Root-level `preround_bow` cosmetic (distinct from the Wool Wars `settings.preroundBow` toggle). |
| `sheepWars`       | Current Sheep Wars block (raw `sheep_wars`).                                                    |
| `sheepWarsLegacy` | Legacy Sheep Wars block (raw `sheepwars`).                                                      |

---

## Settings and progression

### WoolGamesLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface WoolGamesLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

### WoolGamesPrivateGames

Read from the raw `privategames` object.

```ts
interface WoolGamesPrivateGames {
  readonly blockPlace: boolean;
  readonly gameSpeed: string;
  readonly healthBuff: string;
  readonly jumpBoost: string;
  readonly magicWoolSpawnRate: string;
  readonly mapDestructibility: string;
  readonly noBlockBreak: boolean;
  readonly noClass: boolean;
  readonly noKits: boolean;
  readonly noPowerups: boolean;
  readonly oneHitOneKill: boolean;
  readonly rainbowWool: boolean;
  readonly respawnEnable: boolean;
  readonly sheepSpawnRate: string;
  readonly speed: string;
}
```

### WoolGamesProgression

Read from the raw `progression` object.

```ts
interface WoolGamesProgression {
  readonly availableLayers: number;
  readonly experience: number;
}
```

---

## Wool Wars

### WoolWarsStats

Read from the raw `wool_wars` object.

```ts
interface WoolWarsStats {
  readonly selectedClass: string;
  readonly settings: WoolWarsSettings;
  readonly stats: WoolWarsOverallStats;
  readonly classes: Readonly<Record<string, WoolWarsClassStats>>;
  readonly tourney: Readonly<Record<string, WoolWarsTourneyStats>>;
  readonly layouts: Readonly<Record<string, Readonly<Record<string, string>>>>;
}
```

| Field     | Notes                                                            |
| --------- | ---------------------------------------------------------------- |
| `classes` | Keyed by class name (dynamic raw keys under `stats.classes`).    |
| `tourney` | Keyed by tournament id (dynamic raw keys under `stats.tourney`). |
| `layouts` | Keyed by layout name; each value is a slot-to-item string map.   |

### WoolWarsSettings

```ts
interface WoolWarsSettings {
  readonly preroundBow: boolean;
  readonly preroundPotion: boolean;
}
```

### WoolWarsOverallStats

Read from the raw `wool_wars.stats` object.

```ts
interface WoolWarsOverallStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly powerupsGotten: number;
  readonly woolPlaced: number;
  readonly blocksBroken: number;
}
```

### WoolWarsClassStats

One entry per class in the `classes` map.

```ts
interface WoolWarsClassStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly woolPlaced: number;
  readonly blocksBroken: number;
  readonly powerupsGotten: number;
}
```

### WoolWarsTourneyStats

One entry per tournament in the `tourney` map. Identical shape to `WoolWarsClassStats`.

```ts
interface WoolWarsTourneyStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly woolPlaced: number;
  readonly blocksBroken: number;
  readonly powerupsGotten: number;
}
```

---

## Sheep Wars

### SheepWarsStats

Read from the raw `sheep_wars` object.

```ts
interface SheepWarsStats {
  readonly defaultKit: string;
  readonly settings: SheepWarsSettings;
  readonly stats: SheepWarsOverallStats;
  readonly layout: SheepWarsLayout;
}
```

### SheepWarsSettings

```ts
interface SheepWarsSettings {
  readonly projectileTrail: string;
}
```

### SheepWarsOverallStats

Read from the raw `sheep_wars.stats` object.

```ts
interface SheepWarsOverallStats {
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly losses: number;
  readonly kills: number;
  readonly killsBow: number;
  readonly killsExplosive: number;
  readonly killsMelee: number;
  readonly killsVoid: number;
  readonly deaths: number;
  readonly deathsBow: number;
  readonly deathsExplosive: number;
  readonly deathsMelee: number;
  readonly deathsVoid: number;
  readonly damageDealt: number;
  readonly sheepThrown: number;
  readonly magicWoolHit: number;
}
```

### SheepWarsLayout

`slot` is a slot-to-item string map keyed by the raw slot keys present.

```ts
interface SheepWarsLayout {
  readonly opened: boolean;
  readonly slot: Readonly<Record<string, string>>;
}
```

---

## Legacy Sheep Wars

### SheepWarsLegacyStats

Read from the raw `sheepwars` object. Retired mode; still typed because old players retain the data.

```ts
interface SheepWarsLegacyStats {
  readonly layout: SheepWarsLegacyLayout;
}
```

### SheepWarsLegacyLayout

```ts
interface SheepWarsLegacyLayout {
  readonly opened: boolean;
}
```

---

## Capture the Wool

### CaptureTheWoolStats

Read from the raw `capture_the_wool` object. `layout` is a number-valued map keyed by the raw slot keys present.

```ts
interface CaptureTheWoolStats {
  readonly settings: CaptureTheWoolSettings;
  readonly stats: CaptureTheWoolOverallStats;
  readonly layout: Readonly<Record<string, number>>;
}
```

### CaptureTheWoolSettings

```ts
interface CaptureTheWoolSettings {
  readonly showAllKillfeed: boolean;
  readonly showEnemyWoolDropped: boolean;
  readonly showEnemyWoolPickedUp: boolean;
  readonly showOwnWoolDropped: boolean;
  readonly showOwnWoolPickedUp: boolean;
  readonly showTipHologram: boolean;
  readonly showTips: boolean;
  readonly showTutorialBook: boolean;
}
```

### CaptureTheWoolOverallStats

Read from the raw `capture_the_wool.stats` object.

```ts
interface CaptureTheWoolOverallStats {
  readonly participatedWins: number;
  readonly participatedLosses: number;
  readonly participatedDraws: number;
  readonly experiencedWins: number;
  readonly experiencedLosses: number;
  readonly experiencedDraws: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly killsWithWool: number;
  readonly deathsWithWool: number;
  readonly killsOnWoolholder: number;
  readonly deathsToWoolholder: number;
  readonly woolsCaptured: number;
  readonly woolsStolen: number;
  readonly goldEarned: number;
  readonly goldSpent: number;
  readonly mostGoldEarned: number;
  readonly mostKillsAndAssists: number;
  readonly fastestWin: number;
  readonly fastestWoolCapture: number;
  readonly longestGame: number;
}
```
