import {
  parseAuctionList,
  parseAuctionsPage,
  parseBazaar,
  parseFireSales,
  parseGarden,
  parseMuseum,
  parsePlayerBingo,
  parseSkyBlockBingo,
  parseSkyBlockCollections,
  parseSkyBlockElection,
  parseSkyBlockItems,
  parseSkyBlockNews,
  parseSkyBlockProfile,
  parseSkyBlockProfiles,
  parseSkyBlockSkills,
  type PlayerBingoEvent,
  type SkyBlockBingoResource,
  type SkyBlockCollectionsResource,
  type SkyBlockElectionResource,
  type SkyBlockItem,
  type SkyBlockNewsItem,
  type SkyBlockSkillsResource,
} from "@breezil/hypixel-parsers";

import { ResolvingEndpointGroup } from "./resolving-endpoint-group";
import type { Timestamped } from "./envelope";
import {
  enrichSkyBlockProfile,
  enrichGarden,
  enrichMuseum,
  enrichBazaar,
  enrichAuctions,
  enrichAuctionsPage,
  enrichEndedAuctions,
  enrichFireSales,
  type EnrichedSkyBlockProfile,
  type EnrichedGarden,
  type EnrichedMuseum,
  type EnrichedBazaarProduct,
  type EnrichedAuction,
  type EnrichedAuctionsPage,
  type EnrichedEndedAuctions,
  type EnrichedFireSale,
} from "../computed";

export class SkyBlockEndpoints extends ResolvingEndpointGroup {
  public profiles(
    idOrName: string,
  ): Promise<readonly EnrichedSkyBlockProfile[] | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.parseEnvelope(this.endpoint("/skyblock/profiles", { uuid }), (raw) =>
        parseSkyBlockProfiles(raw, uuid).map(enrichSkyBlockProfile),
      ),
    );
  }

  public profile(profileId: string): Promise<EnrichedSkyBlockProfile | null> {
    return this.parseObject(
      this.endpoint("/skyblock/profile", { profile: profileId }),
      "profile",
      (raw) => {
        const profile = parseSkyBlockProfile(raw);
        return profile === null ? null : enrichSkyBlockProfile(profile);
      },
    );
  }

  public garden(profileId: string): Promise<EnrichedGarden | null> {
    return this.parseObject(
      this.endpoint("/skyblock/garden", { profile: profileId }),
      "garden",
      (raw) => {
        const garden = parseGarden(raw);
        return garden === null ? null : enrichGarden(garden);
      },
    );
  }

  public museum(profileId: string): Promise<EnrichedMuseum | null> {
    return this.parseObject(
      this.endpoint("/skyblock/museum", { profile: profileId }),
      "members",
      (raw) => enrichMuseum(parseMuseum(raw)),
    );
  }

  public bazaar(): Promise<Timestamped<
    Record<string, EnrichedBazaarProduct>
  > | null> {
    return this.parseTimestampedObject("/skyblock/bazaar", "products", (raw) =>
      enrichBazaar(parseBazaar(raw)),
    );
  }

  public auctions(page = 0): Promise<EnrichedAuctionsPage | null> {
    return this.parseEnvelope(
      this.endpoint("/skyblock/auctions", { page }),
      (raw) => enrichAuctionsPage(parseAuctionsPage(raw)),
    );
  }

  public auction(
    by: "uuid" | "player" | "profile",
    query: string,
  ): Promise<EnrichedAuction[] | null> {
    if (by === "player") {
      return this.withUuid(query, (uuid) => this.auctionsBy("player", uuid));
    }
    return this.auctionsBy(by, query);
  }

  public endedAuctions(): Promise<Timestamped<EnrichedEndedAuctions> | null> {
    return this.parseTimestampedArray(
      "/skyblock/auctions_ended",
      "auctions",
      (raw) => enrichEndedAuctions(parseAuctionList(raw)),
    );
  }

  public fireSales(): Promise<EnrichedFireSale[] | null> {
    return this.parseArray("/skyblock/firesales", "sales", (raw) =>
      enrichFireSales(parseFireSales(raw)),
    );
  }

  public news(): Promise<SkyBlockNewsItem[] | null> {
    return this.parseArray("/skyblock/news", "items", parseSkyBlockNews);
  }

  public items(): Promise<Timestamped<SkyBlockItem[]> | null> {
    return this.parseTimestampedArray(
      "/resources/skyblock/items",
      "items",
      parseSkyBlockItems,
    );
  }

  public skills(): Promise<SkyBlockSkillsResource | null> {
    return this.parseEnvelope(
      "/resources/skyblock/skills",
      parseSkyBlockSkills,
    );
  }

  public collections(): Promise<SkyBlockCollectionsResource | null> {
    return this.parseEnvelope(
      "/resources/skyblock/collections",
      parseSkyBlockCollections,
    );
  }

  public election(): Promise<SkyBlockElectionResource | null> {
    return this.parseEnvelope(
      "/resources/skyblock/election",
      parseSkyBlockElection,
    );
  }

  public bingo(): Promise<SkyBlockBingoResource | null> {
    return this.parseEnvelope("/resources/skyblock/bingo", parseSkyBlockBingo);
  }

  public playerBingo(
    idOrName: string,
  ): Promise<readonly PlayerBingoEvent[] | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.parseEnvelope(
        this.endpoint("/skyblock/bingo", { uuid }),
        parsePlayerBingo,
      ),
    );
  }

  private auctionsBy(
    param: string,
    value: string,
  ): Promise<EnrichedAuction[] | null> {
    return this.parseArray(
      this.endpoint("/skyblock/auction", { [param]: value }),
      "auctions",
      (raw) => enrichAuctions(parseAuctionList(raw)),
    );
  }
}

