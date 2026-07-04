# Player Computed

Source: `src/computed/player.ts`. Attached as `.computed` on every
[`EnrichedPlayer`](./) returned by `player()`.

```ts
export function computePlayer(raw: HypixelPlayer): PlayerComputed;
```

## `PlayerComputed`

```ts
interface PlayerComputed {
  readonly rank: string | null;
  readonly formattedNickname: string;
  readonly level: LevelProgress;
  readonly accountAgeDays: number;
  readonly daysSinceLastLogin: number;
  readonly networkExpPerDay: number;
  readonly karmaPerNetworkLevel: number;
  readonly karmaPerExp: number;
  readonly questsCompleted: number;
  readonly challengesCompleted: number;
  readonly socialMediaLinked: number;
  readonly parkourCoursesCompleted: number;
  readonly xpToReachLevel: (target: number) => number;
}
```

### `rank`

The player's display rank as a plain string, or `null` for an unranked (default) player.
Resolved in strict priority order; the first rule that matches wins:

1. **`prefix`**: if the player has a custom prefix, it is used after stripping Minecraft
   formatting codes (`§` followed by `0-9`, `a-f`, `k-o`, or `r`), stripping `[` and `]`,
   and trimming whitespace. A prefix of `"§c[OWNER]"` becomes `"OWNER"`.
2. **`staffRank`**: if set and not `"NORMAL"`. `"YOUTUBER"` maps to `"YouTube"`; any
   other staff rank has runs of underscores replaced with a single space (so
   `"GAME_MASTER"` becomes `"GAME MASTER"`).
3. **`monthlyPackageRank`**: if set and not `"NONE"`, the result is `"MVP++"`.
4. **`newPackageRank`**: `"MVP_PLUS"` maps to `"MVP+"`, `"MVP"` to `"MVP"`,
   `"VIP_PLUS"` to `"VIP+"`, `"VIP"` to `"VIP"`.
5. Otherwise `null`.

### `formattedNickname`

The nickname prefixed with the resolved rank in brackets: `"[MVP+] Nickname"`. When
`rank` is `null` this is just the raw nickname with no brackets.

### `level`

Network level progress, computed from `raw.networkExp` by `networkLevel()` (see
[Shared helpers](./shared#network-leveling)). The `level` inside is fractional (rounded
to 2 decimal places), so a player partway through level 120 reads as, for example,
`120.43`.

```ts
interface LevelProgress {
  readonly level: number; // fractional network level
  readonly totalXp: number; // raw networkExp
  readonly currentXp: number; // xp into the current level
  readonly xpToNext: number; // size of the current level's xp step
  readonly remainingXp: number; // xpToNext - currentXp
  readonly percent: number; // 0-100 progress through the current level
  readonly percentRemaining: number; // 100 - percent
}
```

### `accountAgeDays`

Days elapsed since `firstLoginAt`, as `(now - firstLoginAt) / 86_400_000` rounded to 2
decimal places. `0` when `firstLoginAt` is `null`.

### `daysSinceLastLogin`

Days elapsed since `lastLoginAt`, same formula and rounding. `0` when `lastLoginAt` is
`null`. Note that Hypixel hides login timestamps for players with the API setting
disabled, in which case the parser yields `null` and this reads `0`.

### `networkExpPerDay`

`networkExp / accountAgeDays`, a bare rate. Follows the `ratio()` convention: when
`accountAgeDays` is `0`, the result is `networkExp` itself.

### `karmaPerNetworkLevel`

`karma / level.level`, a bare quotient (fractional level in the denominator).

### `karmaPerExp`

`karma / networkExp`, a bare quotient. Karma is typically earned faster than exp, so
values above `1` are common.

### `questsCompleted`

Total quest completions across all quests: the sum of `quest.completions.length` over
every entry of `raw.quests`. Counts every completion, not distinct quests.

### `challengesCompleted`

The sum of all values in `raw.challenges["all_time"]` (treated as `{}` when absent).

### `socialMediaLinked`

How many of the seven recognized social links are non-empty on `raw.socialMedia`:
`discord`, `youtube`, `twitch`, `hypixel`, `twitter`, `instagram`, `tiktok`. Range 0 to 7.

### `parkourCoursesCompleted`

`raw.parkour.length`: the number of lobby parkour courses the player has a completion
record for.

### `xpToReachLevel(target)`

A function, not a precomputed value. Returns `levelStartXp(target) - networkExp` rounded
to 2 decimal places: the network exp still needed to reach the start of whole level
`target`. Negative when the player is already past that level. `levelStartXp` is the
closed-form inverse of the network leveling curve, documented in
[Shared helpers](./shared#network-leveling).

```ts
const player = await client.player("Technoblade");
player?.computed.xpToReachLevel(500); // xp remaining until network level 500
```

## Exports

| Export           | Kind      | Description                                 |
| ---------------- | --------- | ------------------------------------------- |
| `PlayerComputed` | interface | The `.computed` shape on an enriched player |
| `computePlayer`  | function  | `(raw: HypixelPlayer) => PlayerComputed`    |

