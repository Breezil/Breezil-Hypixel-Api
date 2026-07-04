# Guild endpoints

The `GuildEndpoints` group (available as `client.guild`) wraps the Hypixel `/guild`
endpoint with three lookup flavors: by guild id, by exact guild name, and by member.
It is defined in `src/endpoints/guild-endpoints.ts` and extends `ResolvingEndpointGroup`,
so the member lookup accepts a UUID or IGN.

All three methods hit the same Hypixel endpoint with a different query parameter, share the
same extraction and parsing pipeline, and return the same type.

## Shared behavior

Every method:

- calls `GET /guild?<param>=<value>` (Hypixel API v2), where `<param>` is `id`, `name`, or
  `player`
- extracts the `guild` object from the success envelope via `pickObject(res, "guild")`
- parses it with `parseGuild` from `@breezil/hypixel-parsers`, then enriches the result
  with `enrichGuild`

**Returns:** `EnrichedGuild | null`

`EnrichedGuild` is the parser's `Guild` type (see the
[Guild raw type](/api/raw/guild-status)) with a `.computed`
block of type `GuildComputed` attached (guild level and other derived values, documented on
the [guild computed page](/api/computed/guild)).

**Null semantics:** `null` is returned when:

- the request fails (no API key, rate limited, upstream error)
- the `guild` key is missing or not an object (no matching guild; Hypixel returns
  `guild: null` for unknown ids, names, and unguilded players)
- `parseGuild` itself returns `null` for the extracted object

## `byId(id)`

Looks a guild up by its Hypixel guild id (a Mongo-style object id).

```ts
byId(id: string): Promise<EnrichedGuild | null>
```

**Parameters**

| Name | Type     | Description                                       |
| ---- | -------- | ------------------------------------------------- |
| `id` | `string` | The guild's id, e.g. `"52e5719684ae51ed0c716c69"` |

**Endpoint:** `GET /guild?id=<id>`

The id is passed through verbatim (URL-encoded). No resolver involvement.

## `byName(name)`

Looks a guild up by its exact name.

```ts
byName(name: string): Promise<EnrichedGuild | null>
```

**Parameters**

| Name   | Type     | Description            |
| ------ | -------- | ---------------------- |
| `name` | `string` | The guild's exact name |

**Endpoint:** `GET /guild?name=<name>`

The name is passed through verbatim (URL-encoded). No resolver involvement.

## `byPlayer(idOrName)`

Looks up the guild a player belongs to.

```ts
byPlayer(idOrName: string): Promise<EnrichedGuild | null>
```

**Parameters**

| Name       | Type     | Description                                   |
| ---------- | -------- | --------------------------------------------- |
| `idOrName` | `string` | The member's UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /guild?player=<uuid>`

This is the only guild method that uses the UUID resolver: `idOrName` is trimmed, and if it
is 32 hex characters (dashes ignored) it is used directly as the UUID; otherwise it is
resolved to a UUID via the injected resolver. If resolution fails, the method returns
`null` without hitting the Hypixel API. If the player exists but is not in a guild, the
method also returns `null` (Hypixel responds with `guild: null`).

## Summary

| Method               | Endpoint query      | Resolver used | Returns                 |
| -------------------- | ------------------- | ------------- | ----------------------- |
| `byId(id)`           | `/guild?id=...`     | No            | `EnrichedGuild \| null` |
| `byName(name)`       | `/guild?name=...`   | No            | `EnrichedGuild \| null` |
| `byPlayer(idOrName)` | `/guild?player=...` | Yes           | `EnrichedGuild \| null` |

