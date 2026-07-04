# Housing endpoints

The `HousingEndpoints` group (available as `client.housing`) wraps the Hypixel Housing
endpoints: the network-wide active house list, a single house by id, and all houses owned
by a player. It is defined in `src/endpoints/housing-endpoints.ts` and extends
`ResolvingEndpointGroup`, so the player lookup accepts a UUID or IGN.

All methods return raw parser types from `@breezil/hypixel-parsers`; there is no housing
enrichment, so no result carries a `.computed` block. `HousingHouse` and its fields are
documented in the [housing raw types](/api/raw/static-housing).

All methods are `async` and return `null` instead of throwing when the request fails
(no API key, rate limited, upstream error) or the payload has an unexpected shape.

## `active()`

Fetches the currently active (publicly open) houses across the network.

```ts
active(): Promise<HousingHouse[] | null>
```

**Endpoint:** `GET /housing/active` (Hypixel API v2)

**Returns:** `HousingHouse[] | null`

This endpoint is unusual: Hypixel returns a bare JSON array as the response body rather
than the usual `{ success, ... }` envelope. The body is validated with `asRootArray` and
parsed with `parseHouses`.

**Null semantics:** `null` when the request fails or the response body is not an array.
An empty array means no houses are currently open.

## `get(houseId)`

Fetches a single house by its id.

```ts
get(houseId: string): Promise<HousingHouse | null>
```

**Parameters**

| Name      | Type     | Description      |
| --------- | -------- | ---------------- |
| `houseId` | `string` | The house's UUID |

**Endpoint:** `GET /housing/house?house=<houseId>`

**Returns:** `HousingHouse | null`

The whole response envelope is passed to `parseHouse` (the house's fields live at the top
level of the body). The id is passed through verbatim (URL-encoded); no resolver
involvement.

**Null semantics:** `null` only when the request itself fails (unknown ids surface as a
failed, non-success response).

## `forPlayer(idOrName)`

Fetches all houses owned by a player.

```ts
forPlayer(idOrName: string): Promise<HousingHouse[] | null>
```

**Parameters**

| Name       | Type     | Description                                  |
| ---------- | -------- | -------------------------------------------- |
| `idOrName` | `string` | The owner's UUID (dashed or undashed) or IGN |

**Endpoint:** `GET /housing/houses?player=<uuid>`

**Returns:** `HousingHouse[] | null`

`idOrName` is resolved first (see `resolveUuid` in `src/resolver.ts`): trimmed input that
is 32 hex characters after removing dashes is used directly as the UUID; anything else is
treated as an IGN and resolved via the injected resolver. If resolution fails, the method
returns `null` without hitting the Hypixel API. Like [`active()`](#active), the response
body is a bare array, validated with `asRootArray` and parsed with `parseHouses`.

**Null semantics:** `null` when resolution fails, the request fails, or the response body
is not an array. An empty array means the player owns no houses.

## Summary

| Method                | Endpoint                     | Resolver used | Returns                  |
| --------------------- | ---------------------------- | ------------- | ------------------------ |
| `active()`            | `/housing/active`            | No            | `HousingHouse[] \| null` |
| `get(houseId)`        | `/housing/house?house=...`   | No            | `HousingHouse \| null`   |
| `forPlayer(idOrName)` | `/housing/houses?player=...` | Yes           | `HousingHouse[] \| null` |

