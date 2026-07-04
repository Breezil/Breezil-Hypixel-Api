# Guild, Status & Recent Games

These three parsers from `@breezil/hypixel-parsers` cover guilds (`/guild`), player status (`/status`), and recent games (`/recentgames`). Each is strict-raw: it mirrors the raw Hypixel API fields field-for-field into readonly, fully-typed objects, with no computed, derived, or aggregated values.

## parseGuild

Parses a guild (`/guild`) into a typed object.

```ts
function parseGuild(guild: Record<string, unknown>): Guild | null;
```

### Null / empty behavior

`parseGuild` returns `null` when the supplied guild object has no keys; otherwise it returns a fully-populated `Guild`. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.
- List fields (`members`, `ranks`, `preferredGames`, `banner.patterns`) become empty arrays (`[]`) when the raw value is missing or not an array.
- The map fields (`achievements`, `guildExpByGameType`, member `expHistory`) include only entries whose raw values are numbers.

## parseStatus

Parses a player's status (`/status`) into a typed object.

```ts
function parseStatus(session: Record<string, unknown>): PlayerStatus;
```

### Null / empty behavior

`parseStatus` always returns a `PlayerStatus`; it never returns `null`. The `gameType`, `mode`, and `map` fields are `null` when the raw string value is empty (`""`), otherwise the raw string. `online` is `true` only when the raw value is exactly `true`.

## parseRecentGames

Parses a player's recent games (`/recentgames`) into a typed object.

```ts
function parseRecentGames(games: unknown[]): RecentGame[];
```

### Null / empty behavior

`parseRecentGames` returns an array of `RecentGame`. Entries that are not plain objects (non-objects, `null`, or arrays) are skipped, so the result is an empty array when no valid entries are present. Per game, `mode` and `map` are `null` when the raw string is empty (`""`); `startedAt` and `endedAt` are `null` when the raw timestamp is absent or not a positive epoch-ms number.

---

## Returned type tree

### Guild

The root object returned by `parseGuild`.

```ts
interface Guild {
  readonly id: string;
  readonly name: string;
  readonly nameLower: string;
  readonly description: string;
  readonly tag: string;
  readonly tagColor: string;
  readonly exp: number;
  readonly createdAt: Date | null;
  readonly coins: number;
  readonly coinsEver: number;
  readonly members: readonly GuildMember[];
  readonly ranks: readonly GuildRank[];
  readonly preferredGames: readonly string[];
  readonly publiclyListed: boolean;
  readonly joinable: boolean;
  readonly hideGmTag: boolean;
  readonly chatMuteUntil: Date | null;
  readonly banner: GuildBanner;
  readonly legacyRanking: number;
  readonly achievements: Record<string, number>;
  readonly guildExpByGameType: Record<string, number>;
}
```

| Field                | Notes                                                   |
| -------------------- | ------------------------------------------------------- |
| `id`                 | Raw `_id`.                                              |
| `nameLower`          | Raw `name_lower`.                                       |
| `createdAt`          | Raw `created`, epoch-ms timestamp as `Date`, or `null`. |
| `chatMuteUntil`      | Raw `chatMute`, chat mute expiry as `Date`, or `null`.  |
| `achievements`       | Map of achievement key to numeric value.                |
| `guildExpByGameType` | Map of game-type key to raw guild experience.           |

### GuildMember

```ts
interface GuildMember {
  readonly uuid: string;
  readonly name: string;
  readonly rank: string;
  readonly joinedAt: Date | null;
  readonly questParticipation: number;
  readonly expHistory: Record<string, number>;
  readonly mutedTill: Date | null;
}
```

| Field        | Notes                                              |
| ------------ | -------------------------------------------------- |
| `joinedAt`   | Raw `joined`, join timestamp as `Date`, or `null`. |
| `expHistory` | Map of date key to numeric experience value.       |
| `mutedTill`  | Raw `mutedTill`, mute expiry as `Date`, or `null`. |

### GuildRank

```ts
interface GuildRank {
  readonly name: string;
  readonly tag: string;
  readonly default: boolean;
  readonly priority: number;
  readonly createdAt: Date | null;
}
```

| Field       | Notes                                              |
| ----------- | -------------------------------------------------- |
| `createdAt` | Raw `created`, rank creation timestamp, or `null`. |

### GuildBanner

```ts
interface GuildBanner {
  readonly base: string;
  readonly patterns: readonly GuildBannerPattern[];
}
```

| Field      | Notes                                          |
| ---------- | ---------------------------------------------- |
| `base`     | Raw `Base`, banner base color.                 |
| `patterns` | Raw `Patterns`, list of banner pattern layers. |

### GuildBannerPattern

```ts
interface GuildBannerPattern {
  readonly pattern: string;
  readonly color: string;
}
```

| Field     | Notes                              |
| --------- | ---------------------------------- |
| `pattern` | Raw `Pattern`, pattern identifier. |
| `color`   | Raw `Color`, pattern color.        |

### PlayerStatus

The object returned by `parseStatus`.

```ts
interface PlayerStatus {
  readonly online: boolean;
  readonly gameType: string | null;
  readonly mode: string | null;
  readonly map: string | null;
}
```

### RecentGame

The element type of the array returned by `parseRecentGames`.

```ts
interface RecentGame {
  readonly gameType: string;
  readonly mode: string | null;
  readonly map: string | null;
  readonly startedAt: Date | null;
  readonly endedAt: Date | null;
}
```

| Field       | Notes                                                  |
| ----------- | ------------------------------------------------------ |
| `startedAt` | Raw `date`, game start timestamp as `Date`, or `null`. |
| `endedAt`   | Raw `ended`, game end timestamp as `Date`, or `null`.  |
