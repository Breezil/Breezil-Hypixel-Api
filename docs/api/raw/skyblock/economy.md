# Bazaar & Auctions

The economy parsers cover the SkyBlock bazaar (`skyblock-bazaar.ts`) and the auction house (`skyblock-auctions.ts`). Each function mirrors the raw Hypixel API JSON field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseBazaar

Parses the SkyBlock bazaar (`/skyblock/bazaar`) into a plain object keyed by product id. Each value is a `BazaarProduct`.

```ts
function parseBazaar(
  products: Record<string, unknown>,
): Record<string, BazaarProduct>;
```

### Null / empty behavior

- Entries whose value is not a non-array object are skipped entirely.
- `productId` reads raw `product_id`, falling back to the map key when `product_id` is absent or empty.
- `sellSummary` / `buySummary` return `[]` when the raw `sell_summary` / `buy_summary` is missing or not an array; individual entries that are not non-array objects are skipped.
- `quickStatus` is always present and populated by the safe readers (missing numbers become `0`, missing strings become `""`).
- The function always returns an object (possibly empty); it never returns `null`.

## parseAuction

Parses a single SkyBlock auction (`/skyblock/auction`) into a typed object.

```ts
function parseAuction(raw: Record<string, unknown>): SkyBlockAuction;
```

### Null / empty behavior

- `parseAuction` always returns a fully-populated `SkyBlockAuction`; it never returns `null`. Missing numbers become `0`, missing strings become `""`, and boolean fields are `true` only when the raw value is exactly `true`.
- `id` is read from raw `_id`.
- Several fields fall back to a legacy key: `uuid` (raw `uuid` then `auction_id`), `auctioneer` (raw `auctioneer` then `seller`), `profileId` (raw `profile_id` then `seller_profile`).
- Date fields (`startedAt`, `endsAt`, `lastUpdatedAt`, `soldAt`) are `null` when the underlying epoch-ms timestamp is absent or not a positive number.
- `coop`, `categories`, and `claimedBidders` return `[]` when the raw field is missing or not an array; non-string entries are filtered out.
- `bids` returns `[]` when raw `bids` is missing or not an array; non-object entries are skipped.
- `item` holds the NBT items decoded from `itemBytes`; it may be empty when `item_bytes` is missing or cannot be decoded.

## parseAuctionList

Parses a list of SkyBlock auctions (`/skyblock/auction`) into an array of `SkyBlockAuction`.

```ts
function parseAuctionList(auctions: unknown[]): SkyBlockAuction[];
```

### Null / empty behavior

- Entries that are not non-array objects are skipped.
- Always returns an array (possibly empty); never `null`.

## parseAuctionsPage

Parses a SkyBlock auctions page (`/skyblock/auctions`) into a typed object.

```ts
function parseAuctionsPage(raw: Record<string, unknown>): SkyBlockAuctionsPage;
```

### Null / empty behavior

- `lastUpdatedAt` is `null` when `lastUpdated` is absent or unparseable.
- `auctions` is `[]` when the raw `auctions` field is missing or not an array.
- The function always returns a `SkyBlockAuctionsPage` object, never `null`.

---

## Returned type tree

### BazaarProduct

The value type of the map returned by `parseBazaar`.

```ts
interface BazaarProduct {
  readonly productId: string;
  readonly sellSummary: readonly BazaarOrder[];
  readonly buySummary: readonly BazaarOrder[];
  readonly quickStatus: BazaarQuickStatus;
}
```

| Field         | Notes                                                  |
| ------------- | ------------------------------------------------------ |
| `productId`   | Raw `product_id`, falling back to the map key.         |
| `sellSummary` | Per-order sell-side summary list (raw `sell_summary`). |
| `buySummary`  | Per-order buy-side summary list (raw `buy_summary`).   |
| `quickStatus` | Aggregated quick-status block (raw `quick_status`).    |

### BazaarOrder

A single order-book entry, used by both `sellSummary` and `buySummary`.

```ts
interface BazaarOrder {
  readonly amount: number;
  readonly pricePerUnit: number;
  readonly orders: number;
}
```

### BazaarQuickStatus

```ts
interface BazaarQuickStatus {
  readonly productId: string;
  readonly sellPrice: number;
  readonly sellVolume: number;
  readonly sellMovingWeek: number;
  readonly sellOrders: number;
  readonly buyPrice: number;
  readonly buyVolume: number;
  readonly buyMovingWeek: number;
  readonly buyOrders: number;
}
```

| Field                              | Notes                            |
| ---------------------------------- | -------------------------------- |
| `sellPrice` / `buyPrice`           | Current sell / buy price.        |
| `sellVolume` / `buyVolume`         | Current sell / buy volume.       |
| `sellMovingWeek` / `buyMovingWeek` | Weekly moving sell / buy volume. |
| `sellOrders` / `buyOrders`         | Number of sell / buy orders.     |

### SkyBlockAuction

The object returned by `parseAuction` (and each element of `parseAuctionList` / `SkyBlockAuctionsPage.auctions`).

```ts
interface SkyBlockAuction {
  readonly id: string;
  readonly uuid: string;
  readonly auctioneer: string;
  readonly profileId: string;
  readonly buyer: string;
  readonly buyerProfile: string;
  readonly coop: readonly string[];
  readonly itemName: string;
  readonly itemLore: string;
  readonly itemUuid: string;
  readonly extra: string;
  readonly tier: string;
  readonly categories: readonly string[];
  readonly category: string;
  readonly startedAt: Date | null;
  readonly endsAt: Date | null;
  readonly lastUpdatedAt: Date | null;
  readonly soldAt: Date | null;
  readonly startingBid: number;
  readonly highestBidAmount: number;
  readonly price: number;
  readonly bin: boolean;
  readonly claimed: boolean;
  readonly claimedBidders: readonly string[];
  readonly itemBytes: string;
  readonly item: readonly NbtItem[];
  readonly bids: readonly SkyBlockAuctionBid[];
}
```

| Field                     | Notes                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                      | Database id (raw `_id`).                                                                                                                                                                                                                                                                                                                                   |
| `uuid`                    | Auction id (raw `uuid`, falling back to `auction_id`).                                                                                                                                                                                                                                                                                                     |
| `auctioneer`              | Seller id (raw `auctioneer`, falling back to `seller`).                                                                                                                                                                                                                                                                                                    |
| `profileId`               | Seller profile id (raw `profile_id`, falling back to `seller_profile`).                                                                                                                                                                                                                                                                                    |
| `buyer` / `buyerProfile`  | Buyer id and buyer profile id (raw `buyer` / `buyer_profile`).                                                                                                                                                                                                                                                                                             |
| `coop`                    | Co-op member ids (raw `coop`).                                                                                                                                                                                                                                                                                                                             |
| `itemName` / `itemLore`   | Display name and lore text (raw `item_name` / `item_lore`).                                                                                                                                                                                                                                                                                                |
| `itemUuid`                | Item uuid (raw `item_uuid`).                                                                                                                                                                                                                                                                                                                               |
| `extra`                   | Extra search/index string (raw `extra`).                                                                                                                                                                                                                                                                                                                   |
| `tier`                    | Item tier (raw `tier`).                                                                                                                                                                                                                                                                                                                                    |
| `categories` / `category` | Item categories list and primary category.                                                                                                                                                                                                                                                                                                                 |
| `startedAt` / `endsAt`    | Auction start / end timestamps (raw `start` / `end`).                                                                                                                                                                                                                                                                                                      |
| `lastUpdatedAt`           | Last-update timestamp (raw `last_updated`).                                                                                                                                                                                                                                                                                                                |
| `soldAt`                  | Sale timestamp (raw `timestamp`).                                                                                                                                                                                                                                                                                                                          |
| `startingBid`             | Starting bid amount.                                                                                                                                                                                                                                                                                                                                       |
| `highestBidAmount`        | Highest bid amount.                                                                                                                                                                                                                                                                                                                                        |
| `price`                   | Price field (raw `price`).                                                                                                                                                                                                                                                                                                                                 |
| `bin`                     | Whether this is a buy-it-now listing.                                                                                                                                                                                                                                                                                                                      |
| `claimed`                 | Whether the auction has been claimed.                                                                                                                                                                                                                                                                                                                      |
| `claimedBidders`          | Ids of bidders who have claimed (raw `claimed_bidders`).                                                                                                                                                                                                                                                                                                   |
| `itemBytes`               | Raw base64/gzip-encoded item bytes (raw `item_bytes`). On the paged `/skyblock/auctions` endpoint the raw value is a base64 string; on the single `/skyblock/auction` endpoint it arrives as an object of the shape `{ type, data }` where `data` holds the base64 string. `parseAuction` accepts both forms, and `itemBytes` is always the base64 string. |
| `item`                    | NBT items decoded from `itemBytes`.                                                                                                                                                                                                                                                                                                                        |
| `bids`                    | Bid history (raw `bids`).                                                                                                                                                                                                                                                                                                                                  |

### SkyBlockAuctionBid

```ts
interface SkyBlockAuctionBid {
  readonly auctionId: string;
  readonly profileId: string;
  readonly bidder: string;
  readonly amount: number;
  readonly placedAt: Date | null;
}
```

| Field       | Notes                                      |
| ----------- | ------------------------------------------ |
| `auctionId` | Auction id for the bid (raw `auction_id`). |
| `profileId` | Bidder profile id (raw `profile_id`).      |
| `bidder`    | Bidder id (raw `bidder`).                  |
| `amount`    | Bid amount.                                |
| `placedAt`  | Bid timestamp (raw `timestamp`).           |

### SkyBlockAuctionsPage

The object returned by `parseAuctionsPage`.

```ts
interface SkyBlockAuctionsPage {
  readonly page: number;
  readonly totalPages: number;
  readonly totalAuctions: number;
  readonly lastUpdatedAt: Date | null;
  readonly auctions: readonly SkyBlockAuction[];
}
```

| Field           | Notes                                            |
| --------------- | ------------------------------------------------ |
| `page`          | Current page index (raw `page`).                 |
| `totalPages`    | Total number of pages (raw `totalPages`).        |
| `totalAuctions` | Total number of auctions (raw `totalAuctions`).  |
| `lastUpdatedAt` | Page last-updated timestamp (raw `lastUpdated`). |
| `auctions`      | Parsed auctions on this page (raw `auctions`).   |

---

## Decoded NBT item types

The `SkyBlockAuction.item` field is decoded from `itemBytes` into NBT item objects. These types are re-exported from the library's NBT module (`nbt.ts`).

### NbtItem

```ts
interface NbtItem {
  readonly id: number;
  readonly count: number;
  readonly damage: number;
  readonly tag: NbtItemTag;
}
```

### NbtItemTag

```ts
interface NbtItemTag {
  readonly display: NbtItemDisplay;
  readonly enchantments: readonly NbtEnchantment[];
  readonly extraAttributes: NbtExtraAttributes;
  readonly raw: NbtCompound;
}
```

### NbtItemDisplay

```ts
interface NbtItemDisplay {
  readonly name: string;
  readonly lore: readonly string[];
  readonly color: number | null;
}
```

### NbtEnchantment

```ts
interface NbtEnchantment {
  readonly id: number;
  readonly level: number;
}
```

### NbtExtraAttributes

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

### NbtCompound

```ts
type NbtCompound = Readonly<Record<string, unknown>>;
```
