import { type SkyBlockAuction } from "@breezil/hypixel-parsers";

import { median, sum } from "../shared/aggregate";
import { percent, ratio } from "../shared/ratio";

const MS_PER_MINUTE = 60000;

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

export function computeEndedAuctions(
  raw: readonly SkyBlockAuction[],
): EndedAuctionsComputed {
  const prices = raw.map((auction) => auction.price);
  const times = raw
    .map((auction) => auction.soldAt)
    .filter((soldAt): soldAt is Date => soldAt !== null)
    .map((soldAt) => soldAt.getTime());
  const firstSold = times.length === 0 ? null : Math.min(...times);
  const lastSold = times.length === 0 ? null : Math.max(...times);
  const spanMinutes =
    firstSold === null || lastSold === null
      ? 0
      : (lastSold - firstSold) / MS_PER_MINUTE;
  const binCount = raw.filter((auction) => auction.bin).length;
  const totalSaleValue = sum(prices);
  return {
    saleCount: raw.length,
    binCount,
    bidSaleCount: raw.length - binCount,
    binSharePercent: percent(binCount, raw.length),
    totalSaleValue,
    averageSalePrice: ratio(totalSaleValue, raw.length),
    medianSalePrice: median(prices),
    minSalePrice: prices.length === 0 ? 0 : Math.min(...prices),
    maxSalePrice: prices.length === 0 ? 0 : Math.max(...prices),
    uniqueBuyerCount: new Set(raw.map((auction) => auction.buyer)).size,
    uniqueSellerCount: new Set(raw.map((auction) => auction.auctioneer)).size,
    firstSoldAt: firstSold === null ? null : new Date(firstSold),
    lastSoldAt: lastSold === null ? null : new Date(lastSold),
    salesPerMinute: ratio(raw.length, spanMinutes),
  };
}

