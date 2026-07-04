import { parseGuild, type Guild } from "@breezil/hypixel-parsers";

import { ResolvingEndpointGroup } from "./resolving-endpoint-group";
import { enrichGuild, type EnrichedGuild } from "../computed";

function parseEnrichedGuild(
  raw: Record<string, unknown>,
): EnrichedGuild | null {
  const guild: Guild | null = parseGuild(raw);
  return guild === null ? null : enrichGuild(guild);
}

export class GuildEndpoints extends ResolvingEndpointGroup {
  public byId(id: string): Promise<EnrichedGuild | null> {
    return this.byParam("id", id);
  }

  public byName(name: string): Promise<EnrichedGuild | null> {
    return this.byParam("name", name);
  }

  public byPlayer(idOrName: string): Promise<EnrichedGuild | null> {
    return this.withUuid(idOrName, (uuid) => this.byParam("player", uuid));
  }

  private byParam(param: string, value: string): Promise<EnrichedGuild | null> {
    return this.parseObject(
      this.endpoint("/guild", { [param]: value }),
      "guild",
      parseEnrichedGuild,
    );
  }
}

