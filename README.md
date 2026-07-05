<div align="center">

<img src="docs/logo.png" alt="@breezil/hypixel-api logo" width="120" />

# @breezil/hypixel-api

**A typed Hypixel API client: fetching, caching, rate-limit handling, and an always-on computed stats layer on top of fully parsed responses.**

[![npm](https://img.shields.io/npm/v/@breezil/hypixel-api?style=flat-square&logo=npm)](https://www.npmjs.com/package/@breezil/hypixel-api)
[![Docs](https://img.shields.io/github/actions/workflow/status/Breezil/Breezil-Hypixel-Api/docs.yml?branch=main&style=flat-square&label=docs)](https://breezil.github.io/Breezil-Hypixel-Api/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/discord/1460052855389159527?style=flat-square&logo=discord&logoColor=white&label=discord)](https://discord.gg/7SxbNMYQNa)

[Documentation](https://breezil.github.io/Breezil-Hypixel-Api/)
&nbsp;&nbsp;|&nbsp;&nbsp;
[Report a bug](https://github.com/Breezil/Breezil-Hypixel-Api/issues/new?template=bug_report.yml)
&nbsp;&nbsp;|&nbsp;&nbsp;
[Request a feature](https://github.com/Breezil/Breezil-Hypixel-Api/issues/new?template=feature_request.yml)
&nbsp;&nbsp;|&nbsp;&nbsp;
[Join the Discord](https://discord.gg/7SxbNMYQNa)

</div>

---

## Table of Contents

1. [About](#about)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
5. [Quick Start](#quick-start)
6. [Configuration](#configuration)
7. [The Computed Layer](#the-computed-layer)
8. [Documentation](#documentation)
9. [API Reference](#api-reference)
10. [Project Structure](#project-structure)
11. [Releases and Deployment](#releases-and-deployment)
12. [Roadmap](#roadmap)
13. [Contributing](#contributing)
14. [Code of Conduct](#code-of-conduct)
15. [License](#license)
16. [Support &amp; Community](#support--community)
17. [Acknowledgements](#acknowledgements)

---

## About

`@breezil/hypixel-api` is a fully open-source TypeScript **library**: a typed client for the
[Hypixel API](https://api.hypixel.net). It owns the parts that are easy to get wrong: fetching,
a TTL cache with single-flight de-duplication, a header-driven rate-limit gate that queues
instead of dropping, per-player cooldown handling, and a concurrency cap so a burst cannot
hammer the API. Config and the name to UUID resolver are **injected**, so the client runs
standalone or embedded in a host (the Breezil proxy embeds it).

Every response is parsed by [`@breezil/hypixel-parsers`](https://github.com/Breezil/Breezil-Hypixel-Parsers)
(re-exported here) into strict-raw, readonly, fully-typed objects, and then **enriched**: each
result carries a separate `.computed` namespace with the derived values the API never returns,
including levels and prestiges from XP, every popular ratio (FKDR, KDR, WLR, BBLR), titles,
per-game rates, and "how much more X for the next whole Y" milestones. Raw stays raw; computed
lives under `.computed`. It is for anyone building Hypixel tools, bots, or overlays who would
rather call `hypixel.player.get("Notch")` than wire caching, cooldowns, and star formulas by hand.

> Part of [**Breezil**](https://github.com/Breezil), an open-source org building clean,
> well-documented projects, tools, and bots. No closed blobs, no sketchy builds. Every line
> is here to read.

> **Using a third-party API or platform?** `@breezil/hypixel-api` follows the terms of service of
> anything it integrates with. We do not ship anything designed to abuse a platform or get
> accounts banned.

## Features

- ⚡ Typed, subdomain-organised client: `player`, `guild`, `network`, `resources`, `skyblock`, and `housing` endpoint groups plus `ping`, `request`, and cache controls
- 🧮 Always-on `.computed` enrichment on every endpoint with derivable values: network/BedWars/SkyWars/Pit/guild/SkyBlock levels and prestiges, all the community ratios, titles, per-game rates, oscillation-aware weekly/monthly picks, endpoint aggregates, and next-milestone counters
- 🧩 Strict-raw parsed results from `@breezil/hypixel-parsers` (re-exported); raw fields stay untouched, computed values never overwrite them
- 🔒 Built-in TTL cache, single-flight de-duplication, a 16-slot concurrency cap, and a header-driven rate-limit gate that queues requests instead of dropping them
- 🛡️ Distinguishes the per-player cooldown 429 from real rate limits, with a stall-proof per-attempt deadline that retries genuine stalls but never the cooldown
- 🔌 Injected config (bare key, static object, or live source) and injected UUID resolver with pluggable persistence (in-memory LRU or JSON file, or bring your own store)
- 🕒 Envelope metadata surfaced instead of dropped: `Timestamped` wrappers carry `lastUpdatedAt` where Hypixel sends it, and boosters include the feed's `boosterState`
- 📦 Ships as a published library with full type declarations

## Tech Stack

| Layer       | Choice         |
| ----------- | -------------- |
| Language    | TypeScript     |
| Runtime     | Node.js `>=20` |
| Build       | tsc (`tsc -b`) |
| Package mgr | npm            |

## Getting Started

### Prerequisites

Make sure you have these installed before you start.

| Requirement | Version | Notes                                              |
| ----------- | ------- | -------------------------------------------------- |
| Node.js     | `>=20`  | [nodejs.org](https://nodejs.org)                   |
| npm         | `>=10`  | Ships with Node.js                                 |
| Hypixel key | any     | A Hypixel API key, required for most endpoints     |
| Aurora key  | any     | Only needed for `ping()`; see how to get one below |

#### Getting your keys

- **Hypixel API key**: sign in at the [Hypixel Developer Dashboard](https://developer.hypixel.net/)
  and create a development key. This is the `apiKey` you pass to the client. Development keys
  are temporary (they expire after a few days and need regenerating); if you do not want to
  keep regenerating, apply for a personal production key on the same dashboard by creating an
  app and describing your project. Approved keys do not expire and can get higher rate limits.
- **Aurora API key** (only for `ping()`): add the
  [Vega Discord bot](https://discord.com/oauth2/authorize?client_id=1244205279697174539), run its
  `/api view` command, and copy the plain **Aurora API Key** it shows (not the Cubelify URL).
  That is the `pingApiKey` config option.

### Installation

```bash
# Clone the repo
git clone https://github.com/Breezil/Breezil-Hypixel-Api.git
cd Breezil-Hypixel-Api

# Install dependencies and build
npm install
npm run build
```

Prefer it as a dependency in your own project?

```bash
npm install @breezil/hypixel-api
```

## Quick Start

```ts
import { HypixelClient } from "@breezil/hypixel-api";

const hypixel = new HypixelClient("YOUR-API-KEY");

const player = await hypixel.player.get("Technoblade");
if (player) {
  console.log(player.computed.level.level); // network level, e.g. 397.12
  console.log(player.computed.rank); // "MVP+"

  const bw = player.stats.bedwars;
  console.log(bw?.wins, bw?.finalKills); // raw, straight from the API
  console.log(bw?.computed.level); // fractional star from XP
  console.log(bw?.computed.prestige.name); // "Rainbow", "Eternal", ...
  console.log(bw?.computed.overall.finals.total.ratio); // FKDR
  console.log(bw?.computed.overall.finalsForNextFkdr); // finals to next whole FKDR
}
```

`HypixelClient` is an alias for `HypixelApiService`. The client is organised by subdomain:
`hypixel.player.*`, `hypixel.guild.*`, `hypixel.network.*`, `hypixel.resources.*`,
`hypixel.skyblock.*`, `hypixel.housing.*`, plus top-level `hypixel.ping`, `hypixel.request`,
`hypixel.hasApiKey`, and `hypixel.clearCache`. Pass an IGN or a UUID to any player-shaped
method; the client resolves names to UUIDs for you. Methods return `null` rather than throwing
when there is no API key, the target is unknown, or the upstream call fails.

## Configuration

There is no `.env` file to wire up. Configuration is passed straight to the constructor,
either as a bare key string, a static object, or a live source function that the client
reads on every call (so a host can hot-apply key or TTL changes).

| Option            | Required | Default | Description                                                                              |
| ----------------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| `apiKey`          | yes      | none    | Your Hypixel API key(s) as a string or array. Without it, endpoint methods return `null` |
| `pingApiKey`      | no       | `""`    | Key(s) for the external ping provider as a string or array; only needed for `ping()`     |
| `cacheTtlSeconds` | no       | `300`   | Cache lifetime in seconds. Sits above Hypixel's per-player cooldown                      |

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

// 4. Multi-key: round-robin with per-key rate-limit tracking
const d = new HypixelClient({
  apiKey: ["KEY1", "KEY2", "KEY3"],
  pingApiKey: ["PING-KEY1", "PING-KEY2"],
});
```

The second argument injects the identity layer. Omit it for the built-in Mojang resolver
(bidirectional uuid/name lookups with single-flight, negative caching, and an in-memory LRU).
Persistence is pluggable through the `IdentityStore` port: keep the default memory store, point
a `JsonFileIdentityStore` at a file of your choice, or implement the port over your own
database. A host like the Breezil proxy injects its own providers so lookups share one cache.

## The Computed Layer

Everything derivable ships precomputed under `.computed`, always on, on every enriched result:

- **Player**: network level progress, display rank, quests/challenges completed, account age
- **Every game mode** (28 stats blocks): levels and prestiges from XP, FKDR/KDR/WLR/BBLR and
  every other ratio per mode/class/kit/hero, titles, per-game rates, favorite kit/map, and
  `*ForNext*` milestones (finals to the next whole FKDR, XP to the next prestige, wins to the
  next title, and friends)
- **Guild**: fractional level, weekly GEXP, per-member history, exp to next level
- **SkyBlock**: every skill/slayer/dungeon/pet level from XP, averages, pet score, garden and
  crop milestone levels
- **Endpoints**: bazaar spread and margin, auction time-left and current price, ended-auction
  aggregates, museum totals, leaderboard and punishment stats, booster state, game counts

The unit convention is uniform: fields named `*Percent` or `*Share` are `0-100`; every other
ratio or rate is a bare quotient; `*ForNext*` fields are the raw count or XP still needed.

## Documentation

The full reference lives at **[the documentation site](https://breezil.github.io/Breezil-Hypixel-Api/)**:
every class, method, option, computed interface, field, and formula, organized by domain.
This README is the overview; the docs leave nothing out.

| Section   | What's inside                                                |
| --------- | ------------------------------------------------------------ |
| Guide     | Install, configure, first call, resolver and stores          |
| Client    | `HypixelApiService`/`HypixelClient`, config forms, utilities |
| Endpoints | Every method per subdomain, parameters, return types         |
| Computed  | Every `.computed` interface, field, formula, and unit        |

## API Reference

The client is a facade over six endpoint groups. All endpoint methods are `async` and return
`null` on missing key, unknown target, or upstream failure.

### Client

| Member                                 | Description                                                               |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `new HypixelClient(config, identity?)` | Construct with a key/object/source and optional identity layer            |
| `hasApiKey()`                          | Whether at least one key is configured                                    |
| `ping(uuid)`                           | Average ping (ms) via the configured ping provider                        |
| `request<T>(endpoint)`                 | Escape hatch: any Hypixel v2 path, success-checked raw body               |
| `keys()`                               | Per-key diagnostics: `remaining`, `limit`, `resetAt` for each Hypixel key |
| `clearCache()`                         | Drop the whole response cache                                             |

### `hypixel.player`

| Method                  | Returns                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| `get(idOrName)`         | `EnrichedPlayer \| null` (raw + `.computed`, every stats block enriched) |
| `raw(idOrName)`         | the unparsed player object                                               |
| `status(idOrName)`      | `PlayerStatus \| null`                                                   |
| `recentGames(idOrName)` | `EnrichedRecentGame[] \| null`                                           |

### `hypixel.guild`

`byId(id)`, `byName(name)`, `byPlayer(idOrName)`, each returning `EnrichedGuild | null`.

### `hypixel.network`

`boosters()` (a `BoosterFeed` with `boosterState` + enriched boosters), `counts()`,
`leaderboards()`, `watchdog()`, all enriched.

### `hypixel.resources`

`achievements()`, `challenges()`, `quests()`, `games()`, `vanityPets()`, `vanityCompanions()`
(each `Timestamped<...>` carrying `lastUpdatedAt`), and `guildAchievements()`.

### `hypixel.skyblock`

`profiles(idOrName)` and `profile(profileId)` (members enriched with every level computed),
`garden(profileId)`, `museum(profileId)`, `bazaar()`, `auctions(page?)`,
`auction(by, query)`, `endedAuctions()`, `fireSales()`, `news()`, `items()`, `skills()`,
`collections()`, `election()`, `bingo()`, `playerBingo(idOrName)`. Market endpoints that
send envelope timestamps come back as `Timestamped<...>`.

### `hypixel.housing`

`active()`, `get(houseId)`, `forPlayer(idOrName)`.

> Parsed raw types (`HypixelPlayer`, `Guild`, `SkyBlockProfile`, and the rest) are defined and
> documented in [`@breezil/hypixel-parsers`](https://breezil.github.io/Breezil-Hypixel-Parsers/)
> and re-exported from this package.

## Project Structure

```text
Breezil-Hypixel-Api/
├─ src/
│  ├─ index.ts                  # Public entry point: client + computed + parser re-exports
│  ├─ client.ts                 # HypixelApiService facade over the endpoint groups
│  ├─ config.ts                 # Config shapes + normalisation
│  ├─ resolver.ts               # Provider-based uuid/name resolver (Mojang built in)
│  ├─ ping.ts                   # External ping provider
│  ├─ http/                     # Request pipeline: cache, single-flight, rate-limit gate, semaphore
│  ├─ endpoints/                # One group per subdomain + envelope (Timestamped) helpers
│  ├─ store/                    # IdentityStore port + memory and JSON-file motors
│  └─ computed/                 # The .computed layer: per-block modules, shared math, enrichers
├─ docs/                        # VitePress documentation site
└─ package.json
```

## Releases and Deployment

Two things ship automatically from this repo, so there is no manual deploy step.

**Documentation.** The docs site rebuilds and deploys to GitHub Pages on every push to `main`,
via `.github/workflows/docs.yml`.

**npm package.** Publishing is automated by `.github/workflows/publish.yml`, which runs when a
GitHub Release is published. Releases follow [Semantic Versioning](https://semver.org). To cut
one: bump `version` in `package.json`, merge to `main` (via a PR, `main` is protected), then
publish a `vX.Y.Z` release on GitHub; the workflow builds and runs `npm publish` with provenance.

## Roadmap

- [ ] Add an automated test suite
- [ ] Batched multi-player lookups with shared rate-limit budgeting

Have an idea? [Open a feature request](https://github.com/Breezil/Breezil-Hypixel-Api/issues/new?template=feature_request.yml).

## Contributing

Contributions are welcome and genuinely appreciated, first timers included. 💙

1. Fork the repo and create your branch: `git checkout -b feat/my-feature`
2. Make your changes and add tests where it makes sense
3. Run `npm run build` to keep things green
4. Commit using [Conventional Commits](https://www.conventionalcommits.org): `feat: add pagination`
5. Open a Pull Request and describe what changed and why

New to the project? Look for issues labeled
[`good first issue`](https://github.com/Breezil/Breezil-Hypixel-Api/labels/good%20first%20issue).

## Code of Conduct

This project follows the Breezil [Code of Conduct](https://github.com/Breezil/.github/blob/main/CODE_OF_CONDUCT.md).
By taking part you agree to uphold it. Be kind, be welcoming.

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for the full text.

## Support &amp; Community

- 💬 **Discord:** [Join the Breezil community](https://discord.gg/7SxbNMYQNa)
- 🐛 **Issues:** [github.com/Breezil/Breezil-Hypixel-Api/issues](https://github.com/Breezil/Breezil-Hypixel-Api/issues)
- 💡 **Discussions:** [github.com/Breezil/Breezil-Hypixel-Api/discussions](https://github.com/Breezil/Breezil-Hypixel-Api/discussions)

## Acknowledgements

- The [Hypixel API](https://api.hypixel.net) and the Hypixel network
- The [hypixel-api-reborn](https://github.com/hypixel-api-reborn/hypixel-api-reborn)
- The [Aurora API](https://bordic.xyz) by Bordic, which powers the `ping()` lookups
- Everyone in the [Breezil Discord](https://discord.gg/7SxbNMYQNa)

---

<div align="center">
<sub>Built with 💙 by <a href="https://github.com/Breezil">Breezil</a>.</sub>
</div>
