# Getting Started

`@breezil/hypixel-api` is a fully open-source TypeScript library: a typed client for the
[Hypixel API](https://api.hypixel.net). It owns the parts that are easy to get wrong: fetching,
a TTL cache with single-flight de-duplication, a header-driven rate-limit gate, per-player
cooldown handling, and a stall-proof request path. Every response is parsed into strict-raw
typed objects and enriched with an always-on `.computed` namespace of derived values. Config
and the name to UUID resolver are injected, so the client runs standalone or embedded.

## Install

You will need Node.js `>=20` and a Hypixel API key for most endpoints.

```bash
npm install @breezil/hypixel-api
```

## Getting your keys

**Hypixel API key.** Sign in at the [Hypixel Developer Dashboard](https://developer.hypixel.net/)
and create a **development key**. That is the `apiKey` you pass to the client; without it,
endpoint methods return `null`. Two things to know about how Hypixel keys work:

- Development keys are **temporary**: they expire after a few days, so you have to regenerate
  them on the dashboard while developing. They come with the default rate limit (300 requests
  per 5 minutes), which this client's rate-limit gate reads from the response headers and
  respects automatically.
- If you do not want to keep regenerating keys, **apply for a personal (production) key** on
  the same dashboard: create an app, describe what you are building, and submit it for review.
  Approved keys do not expire and can be granted higher rate limits.

**Aurora API key (optional, only for `ping()`).** The `ping()` method uses the Aurora API by
Bordic, which needs its own key:

1. Add the [Vega Discord bot](https://discord.com/oauth2/authorize?client_id=1244205279697174539).
2. Run the `/api view` command on it.
3. Copy the plain **Aurora API Key** from the reply (the bare key, not the Cubelify URL it also shows).
4. Pass it as the `pingApiKey` config option.

Everything except `ping()` works without an Aurora key.

The raw parsed types live in [`@breezil/hypixel-parsers`](https://breezil.github.io/Breezil-Hypixel-Parsers/),
which is re-exported here. If you also want static reference data (teams, prestiges, ranks, maps,
and render helpers), that is a separate, optional package,
[`@breezil/hypixel-utils`](https://github.com/Breezil/Breezil-Hypixel-Utils), which you install on its own.

## Quick Start

```ts
import { HypixelClient } from "@breezil/hypixel-api";

const hypixel = new HypixelClient("YOUR-API-KEY");

const player = await hypixel.player.get("Technoblade");
if (player) {
  console.log(player.computed.level.level); // network level from XP
  console.log(player.computed.rank); // display rank, e.g. "MVP+"

  const bw = player.stats.bedwars;
  console.log(bw?.wins); // raw, straight from the API
  console.log(bw?.computed.level); // fractional star
  console.log(bw?.computed.prestige.name); // prestige name
  console.log(bw?.computed.overall.finalsForNextFkdr); // finals to next whole FKDR
}
```

`HypixelClient` is an alias for `HypixelApiService`. The client is organised by subdomain:
`hypixel.player.*`, `hypixel.guild.*`, `hypixel.network.*`, `hypixel.resources.*`,
`hypixel.skyblock.*`, and `hypixel.housing.*`, plus top-level `ping`, `request`, `hasApiKey`,
and `clearCache`. Pass an IGN or a UUID to any player-shaped method; the client resolves names
to UUIDs for you. Methods return `null` rather than throwing when there is no API key, the
target is unknown, or the upstream call fails.

## Configuration

There is no `.env` file to wire up. Configuration is passed straight to the constructor,
either as a bare key string, a static object, or a live source function that the client
reads on every call (so a host can hot-apply key or TTL changes).

| Option            | Required | Default | Description                                                         |
| ----------------- | -------- | ------- | ------------------------------------------------------------------- |
| `apiKey`          | yes      | none    | Your Hypixel API key. Without it, endpoint methods return `null`    |
| `pingApiKey`      | no       | `""`    | Key for the external ping provider; only needed for `ping()`        |
| `cacheTtlSeconds` | no       | `300`   | Cache lifetime in seconds. Sits above Hypixel's per-player cooldown |

```ts
import { HypixelClient } from "@breezil/hypixel-api";

// 1. Bare key string
const a = new HypixelClient("YOUR-API-KEY");

// 2. Static config object
const b = new HypixelClient({
  apiKey: "YOUR-API-KEY",
  pingApiKey: "PING-PROVIDER-KEY",
  cacheTtlSeconds: 300,
});

// 3. Live config source, read per call, so key/TTL edits hot-apply
const c = new HypixelClient(() => ({
  apiKey: currentApiKey,
  pingApiKey: currentPingKey,
  cacheTtlSeconds: 300,
}));
```

### Injected identity layer

The second constructor argument injects the uuid/name resolver. Omit it for the built-in
Mojang resolver (bidirectional lookups, single-flight, negative caching, in-memory LRU).
Persistence is pluggable through the `IdentityStore` port: keep the default memory store,
point a `JsonFileIdentityStore` at a file, or implement the port over your own database.
See [Resolver &amp; Identity Stores](/api/resolver) for the full contract.

```ts
import {
  HypixelClient,
  createResolver,
  mojangProvider,
  JsonFileIdentityStore,
} from "@breezil/hypixel-api";

const resolver = createResolver({
  providers: [mojangProvider()],
  store: new JsonFileIdentityStore("./identity-cache.json"),
});

const hypixel = new HypixelClient("YOUR-API-KEY", resolver);
```

## Where next

- [API Overview](/api/) for the endpoint-to-method map
- [Client &amp; Config](/api/client) for the pipeline behavior (cache, rate limit, retries)
- [Computed Layer](/api/computed/) for every derived value and its formula

