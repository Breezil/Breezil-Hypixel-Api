import {
  parseBoosters,
  parseGameCounts,
  parseLeaderboards,
  parseWatchdogStats,
} from "@breezil/hypixel-parsers";

import { parseBoosterState, type BoosterState } from "./envelope";
import { EndpointGroup } from "./endpoint-group";
import { pickArray } from "../http/extractors";
import {
  enrichBoosters,
  enrichGameCounts,
  enrichLeaderboards,
  enrichWatchdogStats,
  type EnrichedBooster,
  type EnrichedGameCounts,
  type EnrichedLeaderboards,
  type EnrichedWatchdogStats,
} from "../computed";

export interface BoosterFeed {
  readonly boosterState: BoosterState;
  readonly boosters: EnrichedBooster[];
}

export class NetworkEndpoints extends EndpointGroup {
  public boosters(): Promise<BoosterFeed | null> {
    return this.parseEnvelope("/boosters", (raw) => {
      const list = pickArray(raw, "boosters");
      return list === null
        ? null
        : {
            boosterState: parseBoosterState(raw),
            boosters: enrichBoosters(parseBoosters(list)),
          };
    });
  }

  public counts(): Promise<EnrichedGameCounts | null> {
    return this.parseEnvelope("/counts", (raw) =>
      enrichGameCounts(parseGameCounts(raw)),
    );
  }

  public leaderboards(): Promise<EnrichedLeaderboards | null> {
    return this.parseEnvelope("/leaderboards", (raw) =>
      enrichLeaderboards(parseLeaderboards(raw)),
    );
  }

  public watchdog(): Promise<EnrichedWatchdogStats | null> {
    return this.parseEnvelope("/punishmentstats", (raw) =>
      enrichWatchdogStats(parseWatchdogStats(raw)),
    );
  }
}

