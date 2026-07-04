import { type SkyBlockAuction } from "@breezil/hypixel-parsers";

import { argMax } from "../shared/aggregate";
import { percent } from "../shared/ratio";

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

export function computeAuction(raw: SkyBlockAuction): AuctionComputed {
  const startsAt = raw.startedAt === null ? 0 : raw.startedAt.getTime();
  const endsAt = raw.endsAt === null ? 0 : raw.endsAt.getTime();
  const timeLeftMs = Math.max(endsAt - Date.now(), 0);
  const durationMs = Math.max(endsAt - startsAt, 0);
  const elapsed = Math.min(Math.max(Date.now() - startsAt, 0), durationMs);
  const topBid = raw.bin ? 0 : raw.highestBidAmount;
  return {
    ended: timeLeftMs === 0,
    timeLeftMs,
    durationMs,
    elapsedPercent: percent(elapsed, durationMs),
    bidCount: raw.bids.length,
    uniqueBidderCount: new Set(raw.bids.map((bid) => bid.bidder)).size,
    currentPrice: topBid > 0 ? topBid : raw.startingBid,
    highestBidderUuid: argMax(
      raw.bids.map((bid) => [bid.bidder, bid.amount] as const),
      0,
    ),
    bidPremiumPercent:
      topBid > 0 ? percent(topBid - raw.startingBid, raw.startingBid) : 0,
  };
}

