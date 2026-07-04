import { resolveUuid, type HypixelUuidResolver } from "../resolver";
import type { HttpRequester } from "../http/requester";
import { EndpointGroup } from "./endpoint-group";

export abstract class ResolvingEndpointGroup extends EndpointGroup {
  constructor(
    http: HttpRequester,
    private readonly resolver: HypixelUuidResolver,
  ) {
    super(http);
  }

  protected async withUuid<T>(
    idOrName: string,
    use: (uuid: string) => Promise<T | null>,
  ): Promise<T | null> {
    const uuid = await resolveUuid(this.resolver, idOrName);
    return uuid === null ? null : use(uuid);
  }
}

