# SkyBlock Economy (computed)

Derived SkyBlock economy statistics computed from the parsed bazaar, auction house, fire sale, and museum shapes. Sources: `src/computed/skyblock/bazaar-product.ts`, `auction.ts`, `firesale.ts`, `museum.ts`, and `ended-auctions.ts`.

Conventions used on this page (from the shared ratio helpers):

- Ratios and averages are bare numbers rounded to 2 decimals. A zero denominator yields the numerator (so `ratio(x, 0)` is `x`).
- `*Percent` and `*SharePercent` fields are percentages on a 0 to 100 scale, rounded to 2 decimals (`0` when the whole is `0`).
- Time-based fields are milliseconds unless named otherwise; fields comparing against the current time are evaluated with `Date.now()` at call time.

## Bazaar

### `BazaarProductComputed`

Produced by `computeBazaarProduct(raw: BazaarProduct): BazaarProductComputed`. The raw `quickStatus` prices are weighted averages over the whole order book, so the true top-of-book insta-buy and insta-sell prices are taken from the first entries of `buySummary` and `sellSummary` instead.

```ts
export interface BazaarProductComputed {
  readonly instantBuyPrice: number;
  readonly instantSellPrice: number;
  readonly spread: number;
  readonly marginPercent: number;
  readonly averageBuyOrderSize: number;
  readonly averageSellOrderSize: number;
  readonly weeklyTradedVolume: number;
  readonly weeklyDemandSupplyRatio: number;
  readonly averageDailyBuyVolume: number;
  readonly averageDailySellVolume: number;
}
```

| Field                     | Formula / meaning                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `instantBuyPrice`         | Price you pay to insta-buy one unit right now: `raw.buySummary[0].pricePerUnit`, or `0` when the buy side of the book is empty.             |
| `instantSellPrice`        | Price you receive to insta-sell one unit right now: `raw.sellSummary[0].pricePerUnit`, or `0` when the sell side is empty.                  |
| `spread`                  | Insta-buy minus insta-sell: `instantBuyPrice - instantSellPrice` (the gross flip profit per unit before taxes).                             |
| `marginPercent`           | Spread as a percentage (0 to 100) of the insta-sell price: `percent(spread, instantSellPrice)`.                                             |
| `averageBuyOrderSize`     | Average units per open buy order: `quickStatus.buyVolume / quickStatus.buyOrders`.                                                          |
| `averageSellOrderSize`    | Average units per open sell order: `quickStatus.sellVolume / quickStatus.sellOrders`.                                                       |
| `weeklyTradedVolume`      | Total units moved in the trailing week on both sides: `buyMovingWeek + sellMovingWeek`.                                                     |
| `weeklyDemandSupplyRatio` | Weekly buy volume per unit of weekly sell volume, as a bare ratio: `buyMovingWeek / sellMovingWeek` (above 1 means demand outpaces supply). |
| `averageDailyBuyVolume`   | `buyMovingWeek / 7`.                                                                                                                        |
| `averageDailySellVolume`  | `sellMovingWeek / 7`.                                                                                                                       |

## Auctions

### `AuctionComputed`

Produced by `computeAuction(raw: SkyBlockAuction): AuctionComputed` for a single active auction. A `null` `startedAt` or `endsAt` is treated as epoch `0` for the time math. For BIN listings the bid amount is ignored entirely (`topBid` is forced to `0`), so `currentPrice` is the BIN price stored in `startingBid`.

```ts
export interface AuctionComputed {
  readonly ended: boolean;
  readonly timeLeftMs: number;
  readonly durationMs: number;
  readonly elapsedPercent: number;
  readonly bidCount: number;
  readonly uniqueBidderCount: number;
  readonly currentPrice: number;
  readonly highestBidderUuid: string | null;
  readonly bidPremiumPercent: number;
}
```

| Field               | Formula / meaning                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ended`             | Whether the end time has passed: `timeLeftMs === 0`.                                                                                                                                                            |
| `timeLeftMs`        | Milliseconds until `endsAt`, floored at `0`: `max(endsAt - now, 0)`.                                                                                                                                            |
| `durationMs`        | Scheduled auction length: `max(endsAt - startedAt, 0)`.                                                                                                                                                         |
| `elapsedPercent`    | Percentage (0 to 100) of the duration already elapsed: `percent(clamp(now - startedAt, 0, durationMs), durationMs)`.                                                                                            |
| `bidCount`          | `raw.bids.length`.                                                                                                                                                                                              |
| `uniqueBidderCount` | Number of distinct bidder UUIDs across `raw.bids`.                                                                                                                                                              |
| `currentPrice`      | Effective price with a fallback chain: `highestBidAmount` when the auction is not BIN and that amount is greater than `0`; otherwise `startingBid` (which for BIN listings is the buy-it-now price).            |
| `highestBidderUuid` | UUID of the bidder with the largest single bid amount (arg-max over `raw.bids` with a floor of `0`); `null` when there are no bids with a positive amount.                                                      |
| `bidPremiumPercent` | How far bidding has driven the price above the start, as a percentage (0 to 100 scale, unbounded above): `percent(topBid - startingBid, startingBid)` when `topBid > 0`, else `0`. Always `0` for BIN listings. |

### `EndedAuctionsComputed`

Produced by `computeEndedAuctions(raw: readonly SkyBlockAuction[]): EndedAuctionsComputed` over a batch of recently ended (sold) auctions.

```ts
export interface EndedAuctionsComputed {
  readonly saleCount: number;
  readonly binCount: number;
  readonly bidSaleCount: number;
  readonly binSharePercent: number;
  readonly totalSaleValue: number;
  readonly averageSalePrice: number;
  readonly medianSalePrice: number;
  readonly minSalePrice: number;
  readonly maxSalePrice: number;
  readonly uniqueBuyerCount: number;
  readonly uniqueSellerCount: number;
  readonly firstSoldAt: Date | null;
  readonly lastSoldAt: Date | null;
  readonly salesPerMinute: number;
}
```

| Field               | Formula / meaning                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `saleCount`         | `raw.length`: number of sales in the batch.                                                                                                                                                                                |
| `binCount`          | Number of sales where `auction.bin` is `true`.                                                                                                                                                                             |
| `bidSaleCount`      | Regular (bid) sales: `saleCount - binCount`.                                                                                                                                                                               |
| `binSharePercent`   | Percentage (0 to 100) of sales that were BIN: `percent(binCount, saleCount)`.                                                                                                                                              |
| `totalSaleValue`    | Sum of `auction.price` across all sales.                                                                                                                                                                                   |
| `averageSalePrice`  | `totalSaleValue / saleCount` as a bare ratio (equals `totalSaleValue` when the batch is empty).                                                                                                                            |
| `medianSalePrice`   | Median of the sale prices (mean of the middle two for an even count; `0` for an empty batch).                                                                                                                              |
| `minSalePrice`      | Lowest sale price, or `0` for an empty batch.                                                                                                                                                                              |
| `maxSalePrice`      | Highest sale price, or `0` for an empty batch.                                                                                                                                                                             |
| `uniqueBuyerCount`  | Number of distinct `buyer` values.                                                                                                                                                                                         |
| `uniqueSellerCount` | Number of distinct `auctioneer` values.                                                                                                                                                                                    |
| `firstSoldAt`       | Earliest non-`null` `soldAt` timestamp as a `Date`, or `null` when no sale has one.                                                                                                                                        |
| `lastSoldAt`        | Latest non-`null` `soldAt` timestamp as a `Date`, or `null`.                                                                                                                                                               |
| `salesPerMinute`    | Sales throughput over the observed window: `saleCount / spanMinutes`, where `spanMinutes = (lastSoldAt - firstSoldAt) / 60000` (`0` when timestamps are missing; a zero span yields `saleCount` per the ratio convention). |

## Fire sales

### `FireSaleComputed`

Produced by `computeFireSale(raw: SkyBlockFireSale): FireSaleComputed`. All time fields compare `raw.startTimestamp` and `raw.endTimestamp` (epoch milliseconds) against `Date.now()`.

```ts
export interface FireSaleComputed {
  readonly hasStarted: boolean;
  readonly hasEnded: boolean;
  readonly isActive: boolean;
  readonly timeUntilStartMs: number;
  readonly timeUntilEndMs: number;
  readonly durationMs: number;
  readonly elapsedPercent: number;
  readonly totalStockValue: number;
}
```

| Field              | Formula / meaning                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `hasStarted`       | `startTimestamp - now <= 0`.                                                                                    |
| `hasEnded`         | `endTimestamp - now <= 0`.                                                                                      |
| `isActive`         | `hasStarted && !hasEnded`.                                                                                      |
| `timeUntilStartMs` | Milliseconds until the sale opens: `max(startTimestamp - now, 0)`.                                              |
| `timeUntilEndMs`   | Milliseconds until the sale closes: `max(endTimestamp - now, 0)`.                                               |
| `durationMs`       | Sale window length: `max(endTimestamp - startTimestamp, 0)`.                                                    |
| `elapsedPercent`   | Percentage (0 to 100) of the window elapsed: `percent(clamp(now - startTimestamp, 0, durationMs), durationMs)`. |
| `totalStockValue`  | Gems value of the full stock: `raw.amount * raw.price`.                                                         |

## Museum

### `MuseumMemberComputed`

Produced by `computeMuseumMember(raw: SkyBlockMuseumMember): MuseumMemberComputed` for one profile member's museum. Donations are the union of `raw.items` (regular donations) and `raw.special` (special items); donation timestamps ignore entries with a `null` `donatedAt`.

```ts
export interface MuseumMemberComputed {
  readonly donatedItemCount: number;
  readonly specialItemCount: number;
  readonly totalDonationCount: number;
  readonly featuredItemCount: number;
  readonly borrowedItemCount: number;
  readonly firstDonatedAt: Date | null;
  readonly lastDonatedAt: Date | null;
  readonly valuePerDonation: number;
}
```

| Field                | Formula / meaning                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `donatedItemCount`   | `raw.items.length`: regular museum donations.                                                                                          |
| `specialItemCount`   | `raw.special.length`: special item donations.                                                                                          |
| `totalDonationCount` | `donatedItemCount + specialItemCount`.                                                                                                 |
| `featuredItemCount`  | Regular items placed in a featured slot: entries of `raw.items` with `featuredSlot !== null`.                                          |
| `borrowedItemCount`  | Regular items currently borrowed back: entries of `raw.items` with `borrowing` set.                                                    |
| `firstDonatedAt`     | Earliest non-`null` `donatedAt` across items and specials, or `null` when none exists.                                                 |
| `lastDonatedAt`      | Latest non-`null` `donatedAt` across items and specials, or `null`.                                                                    |
| `valuePerDonation`   | Average museum value per donation, as a bare ratio: `raw.value / totalDonationCount` (equals `raw.value` when there are no donations). |

### `MuseumComputed`

Produced by `computeMuseum(raw: SkyBlockMuseum): MuseumComputed` over all members of a profile's museum.

```ts
export interface MuseumComputed {
  readonly memberCount: number;
  readonly appraisedMemberCount: number;
  readonly totalValue: number;
  readonly totalDonatedItemCount: number;
  readonly totalSpecialItemCount: number;
  readonly totalDonationCount: number;
  readonly averageValuePerMember: number;
  readonly averageDonationsPerMember: number;
  readonly topValueMemberUuid: string | null;
  readonly topDonorMemberUuid: string | null;
  readonly lastDonatedAt: Date | null;
}
```

| Field                       | Formula / meaning                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `memberCount`               | Number of member entries in `raw.members`.                                                                                                |
| `appraisedMemberCount`      | Members whose `appraisal` flag is set.                                                                                                    |
| `totalValue`                | Sum of `member.value` across all members.                                                                                                 |
| `totalDonatedItemCount`     | Sum of `member.items.length` across all members.                                                                                          |
| `totalSpecialItemCount`     | Sum of `member.special.length` across all members.                                                                                        |
| `totalDonationCount`        | `totalDonatedItemCount + totalSpecialItemCount`.                                                                                          |
| `averageValuePerMember`     | `totalValue / memberCount` as a bare ratio.                                                                                               |
| `averageDonationsPerMember` | `totalDonationCount / memberCount` as a bare ratio.                                                                                       |
| `topValueMemberUuid`        | UUID of the member with the highest `value` (arg-max with a floor of `0`); `null` when no member has a positive value.                    |
| `topDonorMemberUuid`        | UUID of the member with the most donations (`items.length + special.length`, arg-max with a floor of `0`); `null` when no member has any. |
| `lastDonatedAt`             | Latest non-`null` `donatedAt` across every member's items and specials, or `null`.                                                        |

