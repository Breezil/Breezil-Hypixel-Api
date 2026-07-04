# NBT

The NBT module decodes Hypixel's base64 + gzipped-NBT blobs (item bytes, inventory dumps, and similar payloads) into plain, readonly, fully-typed JavaScript. It exposes two parsers — `decodeNbt` for an arbitrary compound and `decodeItemBytes` for an inventory of items — plus the typed item shapes the latter produces. Decoding is strict-raw and fully synchronous: the blob is decoded from base64, gunzipped with `gunzipSync`, parsed as big-endian uncompressed NBT, and simplified into a plain object via `prismarine-nbt`'s `simplify`. Decoding never throws — any empty or invalid input degrades to `null` or `[]`. Item fields are read through the safe readers from the common module, so missing numbers become `0`, missing strings become `""`, and missing nested objects become empty objects.

## decodeNbt

Decodes a single NBT compound.

```ts
function decodeNbt(base64: string): NbtCompound | null;
```

Returns the simplified compound on success. Returns `null` when `base64` is not a string or is an empty string, when the base64-decoded buffer is empty, when decompression / NBT parsing / simplification throws (all errors are caught), or when the simplified result is not a non-array object (i.e. a primitive, `null`, or an array). Otherwise returns the simplified value cast to `NbtCompound`.

## decodeItemBytes

Decodes an inventory blob into typed items, one entry per slot.

```ts
function decodeItemBytes(base64: string): NbtItem[];
```

Decodes the blob the same way as `decodeNbt`, then reads the item list from the root compound's `i` key. Returns `[]` when the underlying decode returns `null` (same conditions as `decodeNbt`) or when `i` is not an array. Each list entry that is a non-null, non-array object is converted into an `NbtItem`, in list order; entries that are primitives, `null`, or arrays are skipped. Empty slots that still decode to objects produce an `NbtItem` populated with the safe-reader defaults.

---

## Types

### NbtCompound

The shape returned by `decodeNbt`: an open, readonly record where keys are NBT tag names and values are the simplified NBT values. No specific keys are guaranteed by the type.

```ts
type NbtCompound = Readonly<Record<string, unknown>>;
```

### NbtItemDisplay

The item's `display` compound.

```ts
interface NbtItemDisplay {
  readonly name: string;
  readonly lore: readonly string[];
  readonly color: number | null;
}
```

| Field   | Type                | Notes                                                                                  |
| ------- | ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `name`  | `string`            | Raw `display.Name` via the safe string reader; `""` when absent or non-string.         |
| `lore`  | `readonly string[]` | Raw `display.Lore` filtered to its `string` entries; `[]` when absent or not an array. |
| `color` | `number \\          | null`                                                                                  | Raw `display.color` when it is a `number`, otherwise `null`. |

### NbtEnchantment

A single entry of the item tag's `ench` list.

```ts
interface NbtEnchantment {
  readonly id: number;
  readonly level: number;
}
```

| Field   | Type     | Notes                                                        |
| ------- | -------- | ------------------------------------------------------------ |
| `id`    | `number` | Raw entry `id` via the safe number reader; `0` when absent.  |
| `level` | `number` | Raw entry `lvl` via the safe number reader; `0` when absent. |

### NbtExtraAttributes

The SkyBlock `ExtraAttributes` compound. The entire raw compound is spread through first, then the known fields below are normalized on top, so arbitrary additional keys remain present (hence the `[key: string]: unknown` index signature).

```ts
interface NbtExtraAttributes {
  readonly id: string;
  readonly uuid: string | null;
  readonly timestamp: string | number | readonly [number, number] | null;
  readonly rarity_upgrades: number;
  readonly modifier: string | null;
  readonly enchantments: Readonly<Record<string, number>>;
  readonly hot_potato_count: number;
  readonly [key: string]: unknown;
}
```

| Field              | Type                               | Notes                                                                                 |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`               | `string`                           | Raw `id` via the safe string reader; `""` when absent or non-string.                  |
| `uuid`             | `string \\                         | null`                                                                                 | Raw `uuid` when it is a `string`, otherwise `null`.     |
| `timestamp`        | `string \\                         | number \\                                                                             | readonly [number, number] \\                            | null` | Raw `timestamp` as-is when a `string` or `number`; a `[number, number]` tuple when the raw value is a 2-element numeric array; otherwise `null`. |
| `rarity_upgrades`  | `number`                           | Raw `rarity_upgrades` via the safe number reader; `0` when absent.                    |
| `modifier`         | `string \\                         | null`                                                                                 | Raw `modifier` when it is a `string`, otherwise `null`. |
| `enchantments`     | `Readonly<Record<string, number>>` | Raw `enchantments` object reduced to only its `number`-valued keys; `{}` when absent. |
| `hot_potato_count` | `number`                           | Raw `hot_potato_count` via the safe number reader; `0` when absent.                   |
| `[key: string]`    | `unknown`                          | Every other raw `ExtraAttributes` key, spread through unchanged.                      |

### NbtItemTag

The decoded `tag` compound of an item.

```ts
interface NbtItemTag {
  readonly display: NbtItemDisplay;
  readonly enchantments: readonly NbtEnchantment[];
  readonly extraAttributes: NbtExtraAttributes;
  readonly raw: NbtCompound;
}
```

| Field             | Type                        | Notes                                                                 |
| ----------------- | --------------------------- | --------------------------------------------------------------------- |
| `display`         | `NbtItemDisplay`            | The item's `display` block (name, lore, color).                       |
| `enchantments`    | `readonly NbtEnchantment[]` | Decoded from the tag's `ench` list; `[]` when absent or not an array. |
| `extraAttributes` | `NbtExtraAttributes`        | The SkyBlock `ExtraAttributes` compound.                              |
| `raw`             | `NbtCompound`               | The complete, unmodified `tag` compound.                              |

### NbtItem

A single decoded inventory item — the per-slot object returned in the `decodeItemBytes` array.

```ts
interface NbtItem {
  readonly id: number;
  readonly count: number;
  readonly damage: number;
  readonly tag: NbtItemTag;
}
```

| Field    | Type         | Notes                                                                       |
| -------- | ------------ | --------------------------------------------------------------------------- |
| `id`     | `number`     | Raw `id` via the safe number reader; `0` when absent.                       |
| `count`  | `number`     | Raw `Count` (stack count) via the safe number reader; `0` when absent.      |
| `damage` | `number`     | Raw `Damage` (damage/metadata) via the safe number reader; `0` when absent. |
| `tag`    | `NbtItemTag` | The item's decoded `tag` tree.                                              |

---

## Returned type tree

- `decodeNbt` returns `NbtCompound | null`.
- `decodeItemBytes` returns `NbtItem[]`, where each `NbtItem` nests:
  - `tag: NbtItemTag`
    - `display: NbtItemDisplay`
    - `enchantments: readonly NbtEnchantment[]`
    - `extraAttributes: NbtExtraAttributes`
    - `raw: NbtCompound`
