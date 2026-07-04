import { canonicalUuid, type IdentityStore } from "./store/identity-store";
import { SingleFlightCache } from "./cache/single-flight-cache";

export interface HypixelUuidResolver {
  getUuidFromIgn(ign: string): Promise<string | null>;
  getIgnFromUuid?(uuid: string): Promise<string | null>;
}

export interface IdentityProfile {
  readonly uuid: string;
  readonly name: string;
}

export interface IdentityProvider {
  readonly name?: string;
  lookupByName(ign: string): Promise<IdentityProfile | null>;
  lookupByUuid(uuid: string): Promise<IdentityProfile | null>;
}

export interface ResolverOptions {
  providers?: IdentityProvider[];
  store?: IdentityStore;
  successTtlMs?: number;
  negativeTtlMs?: number;
  maxEntries?: number;
}

export type MojangResolverOptions = Omit<
  ResolverOptions,
  "providers" | "store"
>;

const DEFAULT_SUCCESS_TTL_MS = 60 * 60 * 1000;
const DEFAULT_NEGATIVE_TTL_MS = 60 * 1000;
const DEFAULT_MAX_ENTRIES = 10_000;

export function createResolver(
  options: ResolverOptions = {},
): HypixelUuidResolver {
  const providers = options.providers ?? [mojangProvider()];
  const store = options.store;
  const successTtlMs = options.successTtlMs ?? DEFAULT_SUCCESS_TTL_MS;
  const negativeTtlMs = options.negativeTtlMs ?? DEFAULT_NEGATIVE_TTL_MS;
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const cache = new SingleFlightCache(() => Date.now(), maxEntries);

  const nameKey = (name: string): string => `name:${name.toLowerCase()}`;
  const uuidKey = (id: string): string => `uuid:${id}`;

  const crossPopulate = (profile: IdentityProfile): void => {
    const id = canonicalUuid(profile.uuid);
    cache.set(nameKey(profile.name), id, successTtlMs);
    cache.set(uuidKey(id), profile.name, successTtlMs);
    if (store !== undefined) {
      void Promise.resolve(store.save(profile.name, id)).catch(() => undefined);
    }
  };

  const fromProviders = async (
    lookup: (provider: IdentityProvider) => Promise<IdentityProfile | null>,
  ): Promise<IdentityProfile | null> => {
    for (const provider of providers) {
      const profile = await safe(() => lookup(provider));
      if (profile !== null) {
        crossPopulate(profile);
        return profile;
      }
    }
    return null;
  };

  return {
    getUuidFromIgn(ign: string): Promise<string | null> {
      const name = ign.trim();
      if (name.length === 0) {
        return Promise.resolve(null);
      }
      return cache.resolve(
        nameKey(name),
        successTtlMs,
        async () => {
          const stored = store && (await safe(() => store.getByName(name)));
          if (stored) {
            return stored;
          }
          const profile = await fromProviders((provider) =>
            provider.lookupByName(name),
          );
          return profile === null ? null : canonicalUuid(profile.uuid);
        },
        negativeTtlMs,
      );
    },

    getIgnFromUuid(uuid: string): Promise<string | null> {
      const id = canonicalUuid(uuid);
      if (id.length !== 32) {
        return Promise.resolve(null);
      }
      return cache.resolve(
        uuidKey(id),
        successTtlMs,
        async () => {
          const stored = store && (await safe(() => store.getByUuid(id)));
          if (stored) {
            return stored.name;
          }
          const profile = await fromProviders((provider) =>
            provider.lookupByUuid(id),
          );
          return profile === null ? null : profile.name;
        },
        negativeTtlMs,
      );
    },
  };
}

export function createMojangResolver(
  store?: IdentityStore,
  options: MojangResolverOptions = {},
): HypixelUuidResolver {
  return createResolver({ ...options, store, providers: [mojangProvider()] });
}

export function mojangProvider(): IdentityProvider {
  return {
    name: "mojang",
    lookupByName(ign) {
      return fetchProfile(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(ign)}`,
      );
    },
    lookupByUuid(uuid) {
      return fetchProfile(
        `https://sessionserver.mojang.com/session/minecraft/profile/${encodeURIComponent(uuid)}`,
      );
    },
  };
}

export async function resolveUuid(
  resolver: HypixelUuidResolver,
  idOrName: string,
): Promise<string | null> {
  const trimmed = idOrName.trim();
  const undashed = trimmed.replace(/-/g, "");
  if (/^[0-9a-fA-F]{32}$/.test(undashed)) {
    return undashed.toLowerCase();
  }
  return resolver.getUuidFromIgn(trimmed);
}

async function safe<T>(fn: () => Promise<T> | T): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function fetchProfile(url: string): Promise<IdentityProfile | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as { id?: unknown; name?: unknown };
    return typeof body.id === "string" && typeof body.name === "string"
      ? { uuid: body.id, name: body.name }
      : null;
  } catch {
    return null;
  }
}

