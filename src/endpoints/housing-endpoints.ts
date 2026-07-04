import {
  parseHouse,
  parseHouses,
  type HousingHouse,
} from "@breezil/hypixel-parsers";

import { ResolvingEndpointGroup } from "./resolving-endpoint-group";

export class HousingEndpoints extends ResolvingEndpointGroup {
  public active(): Promise<HousingHouse[] | null> {
    return this.parseRootArray("/housing/active", parseHouses);
  }

  public get(houseId: string): Promise<HousingHouse | null> {
    return this.parseEnvelope(
      this.endpoint("/housing/house", { house: houseId }),
      parseHouse,
    );
  }

  public forPlayer(idOrName: string): Promise<HousingHouse[] | null> {
    return this.withUuid(idOrName, (uuid) =>
      this.parseRootArray(
        this.endpoint("/housing/houses", { player: uuid }),
        parseHouses,
      ),
    );
  }
}

