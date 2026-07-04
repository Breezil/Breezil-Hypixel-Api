export {
  HypixelApiService,
  HypixelApiService as HypixelClient,
} from "./client";
export type { IdentityApi } from "./client";

export { PlayerEndpoints } from "./endpoints/player-endpoints";
export { GuildEndpoints } from "./endpoints/guild-endpoints";
export { NetworkEndpoints } from "./endpoints/network-endpoints";
export type { BoosterFeed } from "./endpoints/network-endpoints";
export { ResourceEndpoints } from "./endpoints/resource-endpoints";
export { SkyBlockEndpoints } from "./endpoints/skyblock-endpoints";
export { HousingEndpoints } from "./endpoints/housing-endpoints";

export type { Timestamped, BoosterState } from "./endpoints/envelope";

export type {
  HypixelApiConfig,
  HypixelApiConfigInput,
  HypixelApiConfigSource,
} from "./config";

export {
  createMojangResolver,
  createResolver,
  mojangProvider,
} from "./resolver";
export type {
  HypixelUuidResolver,
  IdentityProfile,
  IdentityProvider,
  MojangResolverOptions,
  ResolverOptions,
} from "./resolver";

export type {
  IdentityRecord,
  IdentityStore,
  MaybePromise,
} from "./store/identity-store";
export { MemoryIdentityStore } from "./store/memory-identity-store";
export { JsonFileIdentityStore } from "./store/json-file-identity-store";

export * from "./computed";

export * from "@breezil/hypixel-parsers";

