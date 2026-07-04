# Housing

The Housing module exposes a single parser, `parseHousingStats`, which mirrors the raw `stats.Housing` mini-block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

> This page documents the player-stats `stats.Housing` block only. It is **not** the standalone `/housing` API endpoint, which is documented separately under [static-housing](../static-housing.md).

## parseHousingStats

Parses a player's Housing stats block (`stats.Housing`) into a typed object.

```ts
function parseHousingStats(block: Record<string, unknown>): HousingStats | null;
```

### Null / empty behavior

`parseHousingStats` returns `null` when the raw block is empty (no keys). Otherwise it returns a fully-populated `HousingStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- `packages` becomes an empty array (`[]`) when absent or not an array; non-string entries are dropped.
- Missing nested objects are treated as empty objects, so `layoutItems`, `layoutItemsById`, and `leaderboardSettings` are still present.

---

## Returned type tree

### HousingStats

The root object returned by `parseHousingStats`.

```ts
interface HousingStats {
  readonly packages: readonly string[];
  readonly layoutItems: Record<string, unknown>;
  readonly layoutItemsById: Record<string, Record<string, unknown>>;
  readonly coins: number;
  readonly activeKillMessages: string;
  readonly leaderboardSettings: HousingLeaderboardSettings;
}
```

| Field             | Notes                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `layoutItems`     | The raw `layout_items` object, passed through untyped.                                                             |
| `layoutItemsById` | Collects every raw key beginning with `layout_items_` (e.g. per-id layout objects); each value is that raw object. |

---

## Settings

### HousingLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface HousingLeaderboardSettings {
  readonly resetType: string;
}
```
