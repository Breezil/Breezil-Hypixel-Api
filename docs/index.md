---
layout: home

hero:
  name: "@breezil/hypixel-api"
  text: "A typed Hypixel API client"
  tagline: Fetching, caching, rate-limit handling, and an always-on computed stats layer, so you can call hypixel.player.get("Notch") instead of wiring it all up by hand.
  image:
    src: /logo.png
    alt: hypixel-api
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: Computed Layer
      link: /api/computed/
    - theme: alt
      text: View on GitHub
      link: https://github.com/Breezil/Breezil-Hypixel-Api

features:
  - icon: ⚡
    title: Typed endpoints
    details: Subdomain-organised groups for player, guild, network, resources, SkyBlock, and housing. Pass an IGN or a UUID to any player-shaped method; names resolve automatically.
  - icon: 🧮
    title: Always-on computed stats
    details: Every result carries a separate .computed namespace with levels, prestiges, FKDR/KDR/WLR, titles, per-game rates, and "how much more for the next milestone" counters. Raw stays raw.
  - icon: 🧩
    title: Strict-raw parsed results
    details: Every endpoint returns a readonly, fully-typed object from @breezil/hypixel-parsers, re-exported here. Computed values never overwrite raw fields.
  - icon: 🔒
    title: TTL cache and single-flight
    details: A built-in TTL cache, single-flight de-duplication, a 16-slot concurrency cap, and a header-driven rate-limit gate that queues instead of dropping.
  - icon: 🛡️
    title: Cooldown aware
    details: Distinguishes the per-player cooldown 429 from real rate limits, with a stall-proof per-attempt deadline that retries genuine stalls but never the cooldown.
  - icon: 🔌
    title: Standalone or embedded
    details: Injected config (key, object, or live source) and injected identity layer with pluggable persistence, so the client runs alone or inside a host like the Breezil proxy.
---

