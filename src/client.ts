import { ResourceEndpoints } from "./endpoints/resource-endpoints";
import { SkyBlockEndpoints } from "./endpoints/skyblock-endpoints";
import { HousingEndpoints } from "./endpoints/housing-endpoints";
import { NetworkEndpoints } from "./endpoints/network-endpoints";
import { PlayerEndpoints } from "./endpoints/player-endpoints";
import { GuildEndpoints } from "./endpoints/guild-endpoints";
import { RequestPipeline } from "./http/request-pipeline";
import type { KeyDiagnostics } from "./http/key-pool";
import { PingService } from "./ping";
import {
  createMojangResolver,
  resolveUuid,
  type HypixelUuidResolver,
} from "./resolver";
import {
  toConfigSource,
  type HypixelApiConfigInput,
  type HypixelApiConfigSource,
} from "./config";

export interface IdentityApi {
  uuid(idOrName: string): Promise<string | null>;
  name(uuid: string): Promise<string | null>;
}

export class HypixelApiService {
  public readonly player: PlayerEndpoints;
  public readonly guild: GuildEndpoints;
  public readonly network: NetworkEndpoints;
  public readonly resources: ResourceEndpoints;
  public readonly skyblock: SkyBlockEndpoints;
  public readonly housing: HousingEndpoints;
  public readonly identity: IdentityApi;

  private readonly pipeline: RequestPipeline;
  private readonly pingService: PingService;

  constructor(
    config: HypixelApiConfigInput,
    resolver?: HypixelUuidResolver,
    now: () => number = () => Date.now(),
  ) {
    const getConfig: HypixelApiConfigSource = toConfigSource(config);
    const uuidResolver = resolver ?? createMojangResolver();
    this.pipeline = new RequestPipeline(getConfig, now);
    this.pingService = new PingService(this.pipeline, getConfig);

    this.player = new PlayerEndpoints(this.pipeline, uuidResolver);
    this.guild = new GuildEndpoints(this.pipeline, uuidResolver);
    this.network = new NetworkEndpoints(this.pipeline);
    this.resources = new ResourceEndpoints(this.pipeline);
    this.skyblock = new SkyBlockEndpoints(this.pipeline, uuidResolver);
    this.housing = new HousingEndpoints(this.pipeline, uuidResolver);
    this.identity = {
      uuid: (idOrName) => resolveUuid(uuidResolver, idOrName),
      name: (uuid) =>
        uuidResolver.getIgnFromUuid?.(uuid) ?? Promise.resolve(null),
    };
  }

  public hasApiKey(): boolean {
    return this.pipeline.hasApiKey();
  }

  public ping(uuid: string): Promise<number | null> {
    return this.pingService.ping(uuid);
  }

  public request<T = Record<string, unknown>>(
    endpoint: string,
  ): Promise<T | null> {
    return this.pipeline.request<T>(endpoint);
  }

  public keys(): KeyDiagnostics[] {
    return this.pipeline.keyDiagnostics();
  }

  public clearCache(): void {
    this.pipeline.clearCache();
  }
}

