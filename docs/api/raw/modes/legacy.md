# Legacy

The Legacy module exposes a single parser, `parseLegacy`, which mirrors the raw `stats.Legacy` token-economy block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseLegacy

Parses a player's Legacy token-economy stats (`stats.Legacy`) into a typed object.

```ts
function parseLegacy(block: Record<string, unknown>): LegacyStats | null;
```

### Null / empty behavior

`parseLegacy` returns `null` when the raw block is empty (no keys). Otherwise it returns a fully-populated `LegacyStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- `packages` becomes an empty array (`[]`) when absent or not an array; non-string entries are dropped.
- Missing nested objects are treated as empty objects, so `leaderboardSettings` is still present and populated with the defaults above.
- `other` collects every raw key that is not one of the known, explicitly-mapped keys; it is an empty object when no unknown keys exist.

---

## Returned type tree

### LegacyStats

The root object returned by `parseLegacy`.

```ts
interface LegacyStats {
  readonly coins: number;
  readonly tokens: number;
  readonly totalTokens: number;
  readonly tokensDaily: number;
  readonly tokensLastReceivedStamp: number;
  readonly nextTokensSeconds: number;
  readonly preferredChannel: string;
  readonly speed: string;
  readonly arenaTokens: number;
  readonly gingerbreadTokens: number;
  readonly paintballTokens: number;
  readonly quakecraftTokens: number;
  readonly vampirezTokens: number;
  readonly wallsTokens: number;
  readonly leaderboardArena: number;
  readonly leaderboardPaintball: number;
  readonly leaderboardQuakecraft: number;
  readonly leaderboardTkr: number;
  readonly leaderboardVampirez: number;
  readonly leaderboardWalls: number;
  readonly leaderboardSettings: LegacyLeaderboardSettings;
  readonly packages: readonly string[];
  readonly other: Record<string, unknown>;
}
```

| Field                     | Notes                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| `totalTokens`             | Raw `total_tokens`.                                                        |
| `tokensDaily`             | Raw `tokens_daily`.                                                        |
| `tokensLastReceivedStamp` | Raw `tokens_last_received_stamp`.                                          |
| `nextTokensSeconds`       | Raw `next_tokens_seconds`.                                                 |
| `arenaTokens`             | Raw `arena_tokens`.                                                        |
| `gingerbreadTokens`       | Raw `gingerbread_tokens`.                                                  |
| `paintballTokens`         | Raw `paintball_tokens`.                                                    |
| `quakecraftTokens`        | Raw `quakecraft_tokens`.                                                   |
| `vampirezTokens`          | Raw `vampirez_tokens`.                                                     |
| `wallsTokens`             | Raw `walls_tokens`.                                                        |
| `leaderboardArena`        | Raw `leaderboard_arena`.                                                   |
| `leaderboardPaintball`    | Raw `leaderboard_paintball`.                                               |
| `leaderboardQuakecraft`   | Raw `leaderboard_quakecraft`.                                              |
| `leaderboardTkr`          | Raw `leaderboard_tkr`.                                                     |
| `leaderboardVampirez`     | Raw `leaderboard_vampirez`.                                                |
| `leaderboardWalls`        | Raw `leaderboard_walls`.                                                   |
| `other`                   | Every raw key not listed above (and not `leaderboardSettings`/`packages`). |

---

## Settings

### LegacyLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface LegacyLeaderboardSettings {
  readonly arenaMode: string;
  readonly paintballMode: string;
  readonly quakecraftMode: string;
  readonly tkrMode: string;
  readonly vampirezMode: string;
  readonly resetType: string;
}
```
