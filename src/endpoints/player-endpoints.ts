import {
  parsePlayer,
  parseRecentGames,
  parseStatus,
  type PlayerStatus,
} from "@breezil/hypixel-parsers";

import { ResolvingEndpointGroup } from "./resolving-endpoint-group";
import {
  enrichPlayer,
  enrichRecentGames,
  type EnrichedPlayer,
  type EnrichedRecentGame,
} from "../computed";

export class PlayerEndpoints extends ResolvingEndpointGroup {
  public get(idOrName: string): Promise<EnrichedPlayer | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.parseObject(this.endpoint("/player", { uuid }), "player", (raw) =>
        enrichPlayer(parsePlayer(raw)),
      ),
    );
  }

  public raw(idOrName: string): Promise<Record<string, unknown> | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.rawObject(this.endpoint("/player", { uuid }), "player"),
    );
  }

  public status(idOrName: string): Promise<PlayerStatus | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.parseObject(
        this.endpoint("/status", { uuid }),
        "session",
        parseStatus,
      ),
    );
  }

  public recentGames(idOrName: string): Promise<EnrichedRecentGame[] | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.parseArray(this.endpoint("/recentgames", { uuid }), "games", (raw) =>
        enrichRecentGames(parseRecentGames(raw)),
      ),
    );
  }
}

