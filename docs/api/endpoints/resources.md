# Resource endpoints

The `ResourceEndpoints` group (available as `client.resources`) wraps the Hypixel
`/resources/*` endpoints: static game metadata such as achievement, challenge, and quest
definitions. It is defined in `src/endpoints/resource-endpoints.ts` and extends the plain
`EndpointGroup` (no UUID resolver: resource endpoints take no player identifier).

Resource endpoints return static definition data, not player data. None of the results
carry a `.computed` block; every payload is a raw parser type from
`@breezil/hypixel-parsers`, documented in the
[resources raw types](/api/raw/resources).

Most methods return `Timestamped<T>` (defined in `src/endpoints/envelope.ts` and documented
on the [network endpoints page](/api/endpoints/network#timestamped-t)): the parsed payload
in `.value` plus `.lastUpdatedAt`, a `Date | null` parsed from the envelope's `lastUpdated`
field.

All methods are `async`, take no parameters, and return `null` instead of throwing when the
request fails (no API key, rate limited, upstream error) or the expected payload key is
missing from the envelope.

## `achievements()`

Fetches achievement definitions for every game.

```ts
achievements(): Promise<Timestamped<Record<string, AchievementsGame>> | null>
```

**Endpoint:** `GET /resources/achievements` (Hypixel API v2)

**Returns:** `Timestamped<Record<string, AchievementsGame>> | null`

The `achievements` object is extracted from the envelope and parsed with
`parseAchievements`. `.value` maps a game key (e.g. `"bedwars"`) to that game's
`AchievementsGame` definition set.

**Null semantics:** `null` when the request fails or the envelope's `achievements` key is
missing or not an object.

## `challenges()`

Fetches challenge definitions for every game.

```ts
challenges(): Promise<Timestamped<Record<string, readonly ResourceChallenge[]>> | null>
```

**Endpoint:** `GET /resources/challenges`

**Returns:** `Timestamped<Record<string, readonly ResourceChallenge[]>> | null`

The `challenges` object is extracted from the envelope and parsed with `parseChallenges`.
`.value` maps a game key to its list of `ResourceChallenge` definitions.

**Null semantics:** `null` when the request fails or the envelope's `challenges` key is
missing or not an object.

## `quests()`

Fetches quest definitions for every game.

```ts
quests(): Promise<Timestamped<Record<string, ResourceQuest[]>> | null>
```

**Endpoint:** `GET /resources/quests`

**Returns:** `Timestamped<Record<string, ResourceQuest[]>> | null`

The `quests` object is extracted from the envelope and parsed with `parseQuests`. `.value`
maps a game key to its list of `ResourceQuest` definitions.

**Null semantics:** `null` when the request fails or the envelope's `quests` key is missing
or not an object.

## `guildAchievements()`

Fetches guild achievement definitions.

```ts
guildAchievements(): Promise<GuildAchievements | null>
```

**Endpoint:** `GET /resources/guilds/achievements`

**Returns:** `GuildAchievements | null`

The whole envelope is passed to `parseGuildAchievements`. This is the one resource method
that is not wrapped in `Timestamped`; the result is the bare parser type.

**Null semantics:** `null` only when the request itself fails.

## `games()`

Fetches the game definitions (names, database keys, mode names) for every game type.

```ts
games(): Promise<Timestamped<Readonly<Record<string, GameDefinition>>> | null>
```

**Endpoint:** `GET /resources/games`

**Returns:** `Timestamped<Readonly<Record<string, GameDefinition>>> | null`

The `games` object is extracted from the envelope and parsed with `parseGames`. `.value`
maps a game type key (e.g. `"BEDWARS"`) to its `GameDefinition`.

**Null semantics:** `null` when the request fails or the envelope's `games` key is missing
or not an object.

## `vanityPets()`

Fetches vanity pet definitions (types and rarities).

```ts
vanityPets(): Promise<Timestamped<VanityResource> | null>
```

**Endpoint:** `GET /resources/vanity/pets`

**Returns:** `Timestamped<VanityResource> | null`

Unlike the keyed methods above, the whole envelope is passed to `parseVanityPets` (the
payload spans multiple top-level keys), and the result is wrapped in `Timestamped` using
the same envelope's `lastUpdated` field.

**Null semantics:** `null` only when the request itself fails.

## `vanityCompanions()`

Fetches vanity companion definitions (types and rarities).

```ts
vanityCompanions(): Promise<Timestamped<VanityResource> | null>
```

**Endpoint:** `GET /resources/vanity/companions`

**Returns:** `Timestamped<VanityResource> | null`

Identical shape and behavior to [`vanityPets()`](#vanitypets), parsed with
`parseVanityCompanions`.

**Null semantics:** `null` only when the request itself fails.

## Summary

| Method                | Endpoint                         | Returns                                                             |
| --------------------- | -------------------------------- | ------------------------------------------------------------------- |
| `achievements()`      | `/resources/achievements`        | `Timestamped<Record<string, AchievementsGame>> \| null`             |
| `challenges()`        | `/resources/challenges`          | `Timestamped<Record<string, readonly ResourceChallenge[]>> \| null` |
| `quests()`            | `/resources/quests`              | `Timestamped<Record<string, ResourceQuest[]>> \| null`              |
| `guildAchievements()` | `/resources/guilds/achievements` | `GuildAchievements \| null`                                         |
| `games()`             | `/resources/games`               | `Timestamped<Readonly<Record<string, GameDefinition>>> \| null`     |
| `vanityPets()`        | `/resources/vanity/pets`         | `Timestamped<VanityResource> \| null`                               |
| `vanityCompanions()`  | `/resources/vanity/companions`   | `Timestamped<VanityResource> \| null`                               |

