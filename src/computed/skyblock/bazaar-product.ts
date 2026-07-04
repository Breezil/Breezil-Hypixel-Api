import { type BazaarProduct } from "@breezil/hypixel-parsers";

import { percent, ratio } from "../shared/ratio";

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

const DAYS_PER_WEEK = 7;

export function computeBazaarProduct(
  raw: BazaarProduct,
): BazaarProductComputed {
  // quickStatus prices are weighted averages over the book, so top-of-book
  // insta-buy/insta-sell prices only exist as the first summary entries.
  const instantBuyPrice = raw.buySummary[0]?.pricePerUnit ?? 0;
  const instantSellPrice = raw.sellSummary[0]?.pricePerUnit ?? 0;
  const spread = instantBuyPrice - instantSellPrice;
  const status = raw.quickStatus;
  return {
    instantBuyPrice,
    instantSellPrice,
    spread,
    marginPercent: percent(spread, instantSellPrice),
    averageBuyOrderSize: ratio(status.buyVolume, status.buyOrders),
    averageSellOrderSize: ratio(status.sellVolume, status.sellOrders),
    weeklyTradedVolume: status.buyMovingWeek + status.sellMovingWeek,
    weeklyDemandSupplyRatio: ratio(status.buyMovingWeek, status.sellMovingWeek),
    averageDailyBuyVolume: ratio(status.buyMovingWeek, DAYS_PER_WEEK),
    averageDailySellVolume: ratio(status.sellMovingWeek, DAYS_PER_WEEK),
  };
}

