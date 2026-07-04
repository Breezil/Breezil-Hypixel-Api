# Turbo Kart Racers

The Turbo Kart Racers module exposes a single parser, `parseTurboKartRacers`, which mirrors the raw `stats.GingerBread` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseTurboKartRacers

Parses a player's Turbo Kart Racers stats (`stats.GingerBread`) into a typed object.

```ts
function parseTurboKartRacers(
  stats: Record<string, unknown>,
): TurboKartRacersStats | null;
```

### Null / empty behavior

`parseTurboKartRacers` returns `null` when the passed object has no keys (an empty `stats.GingerBread` block). Otherwise it always returns a fully-populated `TurboKartRacersStats` object filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- `packages` becomes an empty array (`[]`) when absent or not an array, keeping only string entries.
- `lastTourneyAd` is a `Date` only when the raw value is a positive epoch-ms number, otherwise `null`.
- `horn` falls back to `"DEFAULT"` when the raw value is not one of the known horns.
- The dynamic maps (`monthlyPoints`, `tourneys`) contain only the keys discovered in the raw data, so they may be empty objects when no data exists.

---

## Constants and unions

```ts
const turboKartRacersHorns = [
  "DEFAULT",
  "SHY",
  "ALIEN",
  "TAXI",
  "KLAXON",
  "TRICYCLE",
  "ALARM",
  "KLOON",
  "TEDDY",
  "TRUCK",
  "JERRY",
] as const;

type TurboKartRacersHorn = (typeof turboKartRacersHorns)[number];
```

```ts
const turboKartRacersMapIds = [
  "retro",
  "hypixelgp",
  "olympus",
  "junglerush",
  "canyon",
] as const;

type TurboKartRacersMapId = (typeof turboKartRacersMapIds)[number];
```

Both `turboKartRacersHorns` and `turboKartRacersMapIds` (and their derived types) are exported.

---

## Returned type tree

### TurboKartRacersStats

The root object returned by `parseTurboKartRacers`.

```ts
interface TurboKartRacersStats {
  readonly coins: number;
  readonly coinsPickedUp: number;
  readonly wins: number;
  readonly completedLaps: number;
  readonly boxPickups: number;
  readonly goldTrophies: number;
  readonly silverTrophies: number;
  readonly bronzeTrophies: number;
  readonly horn: TurboKartRacersHorn;
  readonly bananaHitsReceived: number;
  readonly bananaHitsSent: number;
  readonly blueTorpedoHits: number;
  readonly grandPrix: boolean;
  readonly grandPrixTokens: number;
  readonly lastTourneyAd: Date | null;
  readonly packages: readonly string[];
  readonly lobbyResourcePack: boolean;
  readonly showWinPrefix: boolean;
  readonly prefixColor: string;
  readonly itemMessages: boolean;
  readonly temperatureGaugeIndicator: boolean;
  readonly announcer: boolean;
  readonly loadout: TurboKartRacersLoadout;
  readonly maps: Readonly<
    Record<TurboKartRacersMapId, TurboKartRacersMapStats>
  >;
  readonly periods: TurboKartRacersPeriods;
  readonly monthlyPoints: Readonly<
    Record<string, TurboKartRacersMonthlyPoints>
  >;
  readonly tourneys: Readonly<Record<string, TurboKartRacersTourneyStats>>;
}
```

| Field                       | Type                                                    | Raw source / notes                                                |
| --------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `coins`                     | `number`                                                | `coins`                                                           |
| `coinsPickedUp`             | `number`                                                | `coins_picked_up`                                                 |
| `wins`                      | `number`                                                | `wins`                                                            |
| `completedLaps`             | `number`                                                | `laps_completed`                                                  |
| `boxPickups`                | `number`                                                | `box_pickups`                                                     |
| `goldTrophies`              | `number`                                                | `gold_trophy`                                                     |
| `silverTrophies`            | `number`                                                | `silver_trophy`                                                   |
| `bronzeTrophies`            | `number`                                                | `bronze_trophy`                                                   |
| `horn`                      | `TurboKartRacersHorn`                                   | `horn`, falls back to `"DEFAULT"`                                 |
| `bananaHitsReceived`        | `number`                                                | `banana_hits_received`                                            |
| `bananaHitsSent`            | `number`                                                | `banana_hits_sent`                                                |
| `blueTorpedoHits`           | `number`                                                | `blue_torpedo_hit`                                                |
| `grandPrix`                 | `boolean`                                               | `grand_prix`                                                      |
| `grandPrixTokens`           | `number`                                                | `grand_prix_tokens`                                               |
| `lastTourneyAd`             | `Date \\                                                | null`                                                             | `lastTourneyAd` epoch-ms timestamp, `null` when absent |
| `packages`                  | `readonly string[]`                                     | `packages`, string entries only; `[]` when absent or not an array |
| `lobbyResourcePack`         | `boolean`                                               | `lobby_resource_pack`                                             |
| `showWinPrefix`             | `boolean`                                               | `show_win_prefix`                                                 |
| `prefixColor`               | `string`                                                | `prefix_color`                                                    |
| `itemMessages`              | `boolean`                                               | `item_messages`                                                   |
| `temperatureGaugeIndicator` | `boolean`                                               | `temperature_gauge_indicator`                                     |
| `announcer`                 | `boolean`                                               | `announcer`                                                       |
| `loadout`                   | `TurboKartRacersLoadout`                                | Active cosmetics and parts                                        |
| `maps`                      | `Record<TurboKartRacersMapId, TurboKartRacersMapStats>` | Per-map lifetime stats (no prefix), one entry per known map id    |
| `periods`                   | `TurboKartRacersPeriods`                                | Rolling period stats (no prefix)                                  |
| `monthlyPoints`             | `Record<string, TurboKartRacersMonthlyPoints>`          | Keyed by `<month>_<year>` (e.g. `"1_2024"`)                       |
| `tourneys`                  | `Record<string, TurboKartRacersTourneyStats>`           | Keyed by `solo_<index>`                                           |

### TurboKartRacersLoadout

Active cosmetics and parts. Each field is read directly from its raw key.

```ts
interface TurboKartRacersLoadout {
  readonly boosterActive: string;
  readonly engineActive: string;
  readonly frameActive: string;
  readonly helmetActive: string;
  readonly jacketActive: string;
  readonly pantsActive: string;
  readonly shoesActive: string;
  readonly skinActive: string;
  readonly particleTrail: string;
  readonly parts: string;
}
```

| Field           | Raw source       |
| --------------- | ---------------- |
| `boosterActive` | `booster_active` |
| `engineActive`  | `engine_active`  |
| `frameActive`   | `frame_active`   |
| `helmetActive`  | `helmet_active`  |
| `jacketActive`  | `jacket_active`  |
| `pantsActive`   | `pants_active`   |
| `shoesActive`   | `shoes_active`   |
| `skinActive`    | `skin_active`    |
| `particleTrail` | `particle_trail` |
| `parts`         | `parts`          |

### TurboKartRacersMapStats

Per-map stats. The `maps` record always contains one entry for each id in `turboKartRacersMapIds`. Lifetime reads use no prefix; tourney reads use the tourney prefix.

```ts
interface TurboKartRacersMapStats {
  readonly map: TurboKartRacersMapId;
  readonly plays: number;
  readonly boxPickups: number;
  readonly bronzeTrophies: number;
  readonly silverTrophies: number;
  readonly goldTrophies: number;
}
```

| Field            | Raw source (no prefix) |
| ---------------- | ---------------------- |
| `map`            | the map id itself      |
| `plays`          | `<map>_plays`          |
| `boxPickups`     | `box_pickups_<map>`    |
| `bronzeTrophies` | `bronze_trophy_<map>`  |
| `silverTrophies` | `silver_trophy_<map>`  |
| `goldTrophies`   | `gold_trophy_<map>`    |

### TurboKartRacersPeriods

Rolling monthly/weekly period buckets.

```ts
interface TurboKartRacersPeriods {
  readonly monthlyA: TurboKartRacersPeriodStats;
  readonly monthlyB: TurboKartRacersPeriodStats;
  readonly weeklyA: TurboKartRacersPeriodStats;
  readonly weeklyB: TurboKartRacersPeriodStats;
}
```

| Field      | Period token |
| ---------- | ------------ |
| `monthlyA` | `monthly_a`  |
| `monthlyB` | `monthly_b`  |
| `weeklyA`  | `weekly_a`   |
| `weeklyB`  | `weekly_b`   |

### TurboKartRacersPeriodStats

```ts
interface TurboKartRacersPeriodStats {
  readonly boxPickups: number;
  readonly bronzeTrophies: number;
  readonly silverTrophies: number;
  readonly goldTrophies: number;
}
```

| Field            | Raw source (no prefix)   |
| ---------------- | ------------------------ |
| `boxPickups`     | `box_pickups_<period>`   |
| `bronzeTrophies` | `bronze_trophy_<period>` |
| `silverTrophies` | `silver_trophy_<period>` |
| `goldTrophies`   | `gold_trophy_<period>`   |

### TurboKartRacersMonthlyPoints

One entry per month found in the raw data. Keys are `<month>_<year>`, derived from `GingerBread_tkr_points__<month>_points` / `GingerBread_tkr_points__<month>_position`.

```ts
interface TurboKartRacersMonthlyPoints {
  readonly points: number;
  readonly position: number;
}
```

### TurboKartRacersTourneyStats

One entry per tourney found in the raw data, keyed by `solo_<index>` and read with the prefix `tourney_gingerbread_solo_<index>_`. The nested `maps` and `periods` are read with the same prefix.

```ts
interface TurboKartRacersTourneyStats {
  readonly wins: number;
  readonly lapsCompleted: number;
  readonly coinsPickedUp: number;
  readonly boxPickups: number;
  readonly goldTrophies: number;
  readonly silverTrophies: number;
  readonly bronzeTrophies: number;
  readonly bananaHitsReceived: number;
  readonly bananaHitsSent: number;
  readonly blueTorpedoHits: number;
  readonly maps: Readonly<
    Record<TurboKartRacersMapId, TurboKartRacersMapStats>
  >;
  readonly periods: TurboKartRacersPeriods;
}
```

| Field                | Raw source (with prefix)       |
| -------------------- | ------------------------------ |
| `wins`               | `<prefix>wins`                 |
| `lapsCompleted`      | `<prefix>laps_completed`       |
| `coinsPickedUp`      | `<prefix>coins_picked_up`      |
| `boxPickups`         | `<prefix>box_pickups`          |
| `goldTrophies`       | `<prefix>gold_trophy`          |
| `silverTrophies`     | `<prefix>silver_trophy`        |
| `bronzeTrophies`     | `<prefix>bronze_trophy`        |
| `bananaHitsReceived` | `<prefix>banana_hits_received` |
| `bananaHitsSent`     | `<prefix>banana_hits_sent`     |
| `blueTorpedoHits`    | `<prefix>blue_torpedo_hit`     |
