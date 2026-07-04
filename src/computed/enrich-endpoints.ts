import type {
  StaticGameCounts,
  StaticBooster,
  StaticLeaderboard,
  StaticWatchdogStats,
  RecentGame,
  BazaarProduct,
  SkyBlockAuction,
  SkyBlockAuctionsPage,
  SkyBlockFireSale,
  SkyBlockGarden,
  SkyBlockMuseum,
  SkyBlockMuseumMember,
} from "@breezil/hypixel-parsers";

import { attach, attachAll, attachRecord, type WithComputed } from "./enrich";
import { computeGarden, type GardenComputed } from "./skyblock-garden";
import {
  computeGameCounts,
  type GameCountsComputed,
} from "./network/game-counts";
import { computeBooster, type BoosterComputed } from "./network/booster";
import {
  computeRecentGame,
  type RecentGameComputed,
} from "./network/recent-game";
import {
  computeLeaderboard,
  computeLeaderboards,
  type LeaderboardComputed,
  type LeaderboardsComputed,
} from "./network/leaderboards";
import { computeWatchdog, type WatchdogComputed } from "./network/watchdog";
import {
  computeBazaarProduct,
  type BazaarProductComputed,
} from "./skyblock/bazaar-product";
import { computeAuction, type AuctionComputed } from "./skyblock/auction";
import {
  computeEndedAuctions,
  type EndedAuctionsComputed,
} from "./skyblock/ended-auctions";
import { computeFireSale, type FireSaleComputed } from "./skyblock/firesale";
import {
  computeMuseum,
  computeMuseumMember,
  type MuseumComputed,
  type MuseumMemberComputed,
} from "./skyblock/museum";

export type EnrichedGameCounts = WithComputed<
  StaticGameCounts,
  GameCountsComputed
>;

export function enrichGameCounts(counts: StaticGameCounts): EnrichedGameCounts {
  return attach(counts, computeGameCounts);
}

export type EnrichedBooster = WithComputed<StaticBooster, BoosterComputed>;

export function enrichBoosters(
  boosters: readonly StaticBooster[],
): EnrichedBooster[] {
  return attachAll(boosters, computeBooster);
}

export type EnrichedRecentGame = WithComputed<RecentGame, RecentGameComputed>;

export function enrichRecentGames(
  games: readonly RecentGame[],
): EnrichedRecentGame[] {
  return attachAll(games, computeRecentGame);
}

export type EnrichedLeaderboard = WithComputed<
  StaticLeaderboard,
  LeaderboardComputed
>;

export interface EnrichedLeaderboards {
  readonly games: Record<string, readonly EnrichedLeaderboard[]>;
  readonly computed: LeaderboardsComputed;
}

export function enrichLeaderboards(
  boards: Readonly<Record<string, readonly StaticLeaderboard[]>>,
): EnrichedLeaderboards {
  const games: Record<string, EnrichedLeaderboard[]> = {};
  for (const [game, list] of Object.entries(boards)) {
    games[game] = list.map((board, index) => ({
      ...board,
      computed: computeLeaderboard(board, game, index),
    }));
  }
  return { games, computed: computeLeaderboards(boards) };
}

export type EnrichedWatchdogStats = WithComputed<
  StaticWatchdogStats,
  WatchdogComputed
>;

export function enrichWatchdogStats(
  stats: StaticWatchdogStats,
): EnrichedWatchdogStats {
  return attach(stats, computeWatchdog);
}

export type EnrichedBazaarProduct = WithComputed<
  BazaarProduct,
  BazaarProductComputed
>;

export function enrichBazaar(
  products: Record<string, BazaarProduct>,
): Record<string, EnrichedBazaarProduct> {
  return attachRecord(products, computeBazaarProduct);
}

export type EnrichedAuction = WithComputed<SkyBlockAuction, AuctionComputed>;

export function enrichAuctions(
  auctions: readonly SkyBlockAuction[],
): EnrichedAuction[] {
  return attachAll(auctions, computeAuction);
}

export type EnrichedAuctionsPage = Omit<SkyBlockAuctionsPage, "auctions"> & {
  readonly auctions: readonly EnrichedAuction[];
};

export function enrichAuctionsPage(
  page: SkyBlockAuctionsPage,
): EnrichedAuctionsPage {
  return { ...page, auctions: enrichAuctions(page.auctions) };
}

export type EnrichedFireSale = WithComputed<SkyBlockFireSale, FireSaleComputed>;

export function enrichFireSales(
  sales: readonly SkyBlockFireSale[],
): EnrichedFireSale[] {
  return attachAll(sales, computeFireSale);
}

export interface EnrichedEndedAuctions {
  readonly auctions: readonly SkyBlockAuction[];
  readonly computed: EndedAuctionsComputed;
}

export function enrichEndedAuctions(
  auctions: readonly SkyBlockAuction[],
): EnrichedEndedAuctions {
  return { auctions, computed: computeEndedAuctions(auctions) };
}

export type EnrichedGarden = WithComputed<SkyBlockGarden, GardenComputed>;

export function enrichGarden(garden: SkyBlockGarden): EnrichedGarden {
  return attach(garden, computeGarden);
}

export type EnrichedMuseumMember = WithComputed<
  SkyBlockMuseumMember,
  MuseumMemberComputed
>;

export type EnrichedMuseum = Omit<SkyBlockMuseum, "members"> & {
  readonly members: Record<string, EnrichedMuseumMember>;
  readonly computed: MuseumComputed;
};

export function enrichMuseum(museum: SkyBlockMuseum): EnrichedMuseum {
  return {
    ...museum,
    members: attachRecord(museum.members, computeMuseumMember),
    computed: computeMuseum(museum),
  };
}

