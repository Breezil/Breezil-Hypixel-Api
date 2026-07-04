# Resolver

The resolver module turns Minecraft usernames into UUIDs and back. `createResolver` builds a `HypixelUuidResolver` from an ordered chain of `IdentityProvider`s, an in-memory single-flight cache with negative caching, and an optional persistent `IdentityStore`. `createMojangResolver` is the common preset that uses the public Mojang API, and it is what `HypixelApiService` constructs when you do not pass your own resolver. Two store implementations ship with the package: `MemoryIdentityStore` and `JsonFileIdentityStore`.

```ts
import {
  createMojangResolver,
  JsonFileIdentityStore,
} from "@breezil/hypixel-api";

const resolver = createMojangResolver(
  new JsonFileIdentityStore("./cache/identities.json"),
);

const uuid = await resolver.getUuidFromIgn("Technoblade");
const name = await resolver.getIgnFromUuid?.(uuid ?? "");
```

## createResolver

Builds a resolver over an arbitrary provider chain and optional store.

```ts
export function createResolver(options?: ResolverOptions): HypixelUuidResolver;
```

Lookup order for both directions (`getUuidFromIgn` and `getIgnFromUuid`):

1. **In-memory cache.** Keys are `name:<lowercased name>` and `uuid:<canonical uuid>`. A fresh hit is returned immediately; concurrent lookups for the same key share one in-flight promise (single flight).
2. **Store** (if configured). `getByName` / `getByUuid` are consulted before any provider; store errors are swallowed and treated as a miss.
3. **Provider chain.** Providers are tried in array order. A provider that throws or returns `null` is skipped and the next one is tried. The first non-null `IdentityProfile` wins; if all providers miss, the result is `null`.

Input handling:

- `getUuidFromIgn(ign)` trims the name and resolves to `null` for an empty string without touching cache, store, or providers. Cache keys are case-insensitive (lowercased), but the original-cased trimmed name is what reaches the store and providers.
- `getIgnFromUuid(uuid)` canonicalizes the UUID (trim, strip dashes, lowercase) and resolves to `null` when the result is not exactly 32 characters.

Caching of results:

- A successful resolution is cached for `successTtlMs` (default 1 hour).
- A miss (`null`) is negatively cached for `negativeTtlMs` (default 1 minute), so repeated lookups of unknown names do not hammer the providers.
- The cache is LRU-bounded at `maxEntries` (default 10,000); reads refresh recency, and the oldest entries are evicted past the cap.

Cross-population: whenever a provider returns a profile, both cache directions are filled at once. `name:<profile.name lowercased>` maps to the canonical UUID and `uuid:<canonical uuid>` maps to `profile.name`, each with the success TTL, so a name lookup also warms the reverse UUID lookup and vice versa. If a store is configured, `store.save(profile.name, canonicalUuid)` is fired in the background; save failures are ignored. Store hits are returned as-is and do not cross-populate or re-save.

## createMojangResolver

Preset over `createResolver` pinned to the Mojang provider.

```ts
export function createMojangResolver(
  store?: IdentityStore,
  options?: MojangResolverOptions,
): HypixelUuidResolver;
```

Equivalent to `createResolver({ ...options, store, providers: [mojangProvider()] })`. This is the resolver `HypixelApiService` creates by default (with no store and default TTLs).

## mojangProvider

The built-in `IdentityProvider` backed by Mojang's public endpoints.

```ts
export function mojangProvider(): IdentityProvider;
```

- `name` is `"mojang"`.
- `lookupByName(ign)` fetches `https://api.mojang.com/users/profiles/minecraft/<ign>`.
- `lookupByUuid(uuid)` fetches `https://sessionserver.mojang.com/session/minecraft/profile/<uuid>`.

Both return `{ uuid, name }` when the response is OK and the body has string `id` and `name` fields, and `null` on any non-OK status, malformed body, or network error. The `uuid` in the returned profile is Mojang's raw `id` (undashed); canonicalization happens in the resolver.

## resolveUuid

Helper used by the client's `identity.uuid` and by every `idOrName` endpoint method.

```ts
export async function resolveUuid(
  resolver: HypixelUuidResolver,
  idOrName: string,
): Promise<string | null>;
```

Trims the input; if it is already a UUID (32 hex characters after removing dashes), returns it undashed and lowercased without calling the resolver. Otherwise delegates to `resolver.getUuidFromIgn` with the trimmed input.

---

## Types

### HypixelUuidResolver

The port every resolver implements and the type `HypixelApiService` accepts.

```ts
export interface HypixelUuidResolver {
  getUuidFromIgn(ign: string): Promise<string | null>;
  getIgnFromUuid?(uuid: string): Promise<string | null>;
}
```

`getIgnFromUuid` is optional; when absent, `client.identity.name()` resolves to `null`. Resolvers built by `createResolver` always implement both directions.

### IdentityProfile

What a provider returns on a hit.

```ts
export interface IdentityProfile {
  readonly uuid: string;
  readonly name: string;
}
```

### IdentityProvider

One source in the provider chain.

```ts
export interface IdentityProvider {
  readonly name?: string;
  lookupByName(ign: string): Promise<IdentityProfile | null>;
  lookupByUuid(uuid: string): Promise<IdentityProfile | null>;
}
```

Providers may throw; the resolver catches and treats a throw as a miss, moving on to the next provider.

### ResolverOptions

```ts
export interface ResolverOptions {
  providers?: IdentityProvider[];
  store?: IdentityStore;
  successTtlMs?: number;
  negativeTtlMs?: number;
  maxEntries?: number;
}
```

| Option          | Type                 | Default              | Description                                                                                    |
| --------------- | -------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| `providers`     | `IdentityProvider[]` | `[mojangProvider()]` | Ordered chain; first non-null result wins.                                                     |
| `store`         | `IdentityStore`      | none                 | Persistent lookaside checked before providers and written after provider hits.                 |
| `successTtlMs`  | `number`             | `3_600_000` (1 hour) | In-memory TTL for successful resolutions (both directions, including cross-populated entries). |
| `negativeTtlMs` | `number`             | `60_000` (1 minute)  | In-memory TTL for `null` results.                                                              |
| `maxEntries`    | `number`             | `10_000`             | LRU cap of the in-memory cache.                                                                |

### MojangResolverOptions

`ResolverOptions` without the fields `createMojangResolver` fixes itself.

```ts
export type MojangResolverOptions = Omit<
  ResolverOptions,
  "providers" | "store"
>;
```

---

## The IdentityStore port

Defined in `src/store/identity-store.ts`. A store is a bidirectional name/UUID lookaside; implementations may be synchronous or asynchronous thanks to `MaybePromise`.

### MaybePromise

```ts
export type MaybePromise<T> = T | Promise<T>;
```

### IdentityRecord

```ts
export interface IdentityRecord {
  readonly uuid: string;
  readonly name: string;
}
```

### IdentityStore

```ts
export interface IdentityStore {
  getByName(name: string): MaybePromise<string | null>;
  getByUuid(uuid: string): MaybePromise<IdentityRecord | null>;
  save(name: string, uuid: string): MaybePromise<void>;
}
```

- `getByName` returns the UUID for a name, or `null`.
- `getByUuid` returns the full record (canonical UUID plus last-known name), or `null`.
- `save` persists a name/UUID pair; the resolver calls it fire-and-forget after every provider hit.

The module also exports the normalization helper used throughout:

```ts
export function canonicalUuid(uuid: string): string;
```

Trims, strips dashes, and lowercases.

## MemoryIdentityStore

Synchronous in-memory store backed by two `Map`s (name-indexed and UUID-indexed). Unbounded; note that the resolver's own LRU cache (10k entries) sits in front of it, so this store only matters as a shared lookaside or as the backing for `JsonFileIdentityStore`.

```ts
export class MemoryIdentityStore implements IdentityStore {
  public getByName(name: string): string | null;
  public getByUuid(uuid: string): IdentityRecord | null;
  public save(name: string, uuid: string): void;
  public snapshot(): Record<string, IdentityRecord>;
}
```

- `getByName` matches case-insensitively (trimmed, lowercased key).
- `save` stores the trimmed name and the canonical UUID, indexing the record under both.
- `snapshot()` returns a plain object keyed by canonical UUID, used by `JsonFileIdentityStore` for serialization.

## JsonFileIdentityStore

Asynchronous store that persists a `MemoryIdentityStore` to a single JSON file with debounced writes.

```ts
export class JsonFileIdentityStore implements IdentityStore {
  constructor(filePath: string, flushDelayMs?: number);

  public getByName(name: string): Promise<string | null>;
  public getByUuid(uuid: string): Promise<IdentityRecord | null>;
  public save(name: string, uuid: string): Promise<void>;
  public flush(): Promise<void>;
}
```

| Parameter      | Type     | Default  | Description                                                                          |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| `filePath`     | `string` | required | Path of the JSON file. The parent directory is created on flush (`mkdir` recursive). |
| `flushDelayMs` | `number` | `1000`   | Debounce window between a `save` and the disk write.                                 |

Behavior:

- **Lazy loading.** The file is read once, on the first `getByName` / `getByUuid` / `save` call. Entries are validated (must be objects with string `uuid` and `name`) and loaded into the in-memory store; a missing or unparseable file is treated as empty.
- **Debounced persistence.** `save` updates memory immediately and schedules a flush after `flushDelayMs`; further saves inside the window coalesce into the one pending write. The timer is `unref`ed where supported, so a pending flush never keeps the process alive.
- **flush().** Cancels any pending timer and writes the full snapshot (JSON object keyed by canonical UUID) when dirty. On write failure the store stays dirty so a later flush retries. Call `flush()` on shutdown to guarantee the last writes hit disk.

## Exports documented

`createResolver`, `createMojangResolver`, `mojangProvider`, `resolveUuid`, `HypixelUuidResolver`, `IdentityProfile`, `IdentityProvider`, `ResolverOptions`, `MojangResolverOptions`, `IdentityStore`, `IdentityRecord`, `MaybePromise`, `canonicalUuid`, `MemoryIdentityStore`, `JsonFileIdentityStore`.

