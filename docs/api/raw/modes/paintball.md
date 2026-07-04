# Paintball

The Paintball module exposes a single parser, `parsePaintball`, which mirrors the raw `stats.Paintball` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parsePaintball

Parses a player's Paintball stats (`stats.Paintball`) into a typed object.

```ts
function parsePaintball(stats: Record<string, unknown>): PaintballStats | null;
```

### Null / empty behavior

`parsePaintball` returns `null` when `stats.Paintball` is missing, is not an object, or is an array. Otherwise it returns a fully-populated `PaintballStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- The `packages` string-array field becomes an empty array (`[]`) when absent or non-array; non-string elements are filtered out.

---

## Returned type tree

### PaintballStats

The root object returned by `parsePaintball`.

```ts
interface PaintballStats {
  readonly coins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly shotsFired: number;
  readonly shots: number;
  readonly killstreaks: number;
  readonly headstart: number;
  readonly forcefieldTime: number;
  readonly instantRespawn: boolean;
  readonly showKillPrefix: boolean;
  readonly selectedKillPrefix: string;
  readonly hat: string;
  readonly favoriteSlots: string;
  readonly packages: readonly string[];
  readonly monthly: PaintballPeriodKills;
  readonly weekly: PaintballPeriodKills;
  readonly perks: PaintballPerks;
  readonly mapVotes: PaintballMapVotes;
}
```

| Field                | Notes                                                               |
| -------------------- | ------------------------------------------------------------------- |
| `coins`              | Reads `coins`, falling back to `tokens` when `coins` is `0`/absent. |
| `shotsFired`         | Raw `shots_fired`.                                                  |
| `shots`              | Raw `shots`.                                                        |
| `forcefieldTime`     | Raw `forcefieldTime`.                                               |
| `instantRespawn`     | Raw `instant_respawn`.                                              |
| `showKillPrefix`     | Raw `showKillPrefix`.                                               |
| `selectedKillPrefix` | Raw `selectedKillPrefix`.                                           |
| `favoriteSlots`      | Raw `favorite_slots`.                                               |

---

## Period kills

### PaintballPeriodKills

The shared shape for `monthly` and `weekly`, each reading `<period>_kills_a` and `<period>_kills_b`.

```ts
interface PaintballPeriodKills {
  readonly killsA: number;
  readonly killsB: number;
}
```

---

## Perks

### PaintballPerks

Each field reads the raw key of the same name.

```ts
interface PaintballPerks {
  readonly adrenaline: number;
  readonly endurance: number;
  readonly fortune: number;
  readonly godfather: number;
  readonly superluck: number;
  readonly transfusion: number;
}
```

---

## Map votes

### PaintballMapVotes

Per-map vote counts, each read from a `votes_<Map>` raw key.

```ts
interface PaintballMapVotes {
  readonly Babyland: number;
  readonly Boletus: number;
  readonly Courtyard: number;
  readonly Egypt: number;
  readonly Gladiator: number;
  readonly Herobrine: number;
  readonly Juice: number;
  readonly LaLaLand: number;
  readonly Mansion: number;
  readonly Market: number;
  readonly Octagon: number;
  readonly "Oh Canada!": number;
  readonly Outback: number;
  readonly Siege: number;
  readonly Swamps: number;
  readonly Tide: number;
  readonly Victorian: number;
}
```
