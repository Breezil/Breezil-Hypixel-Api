# Guild Computed

Source: `src/computed/guild.ts`. Attached as `.computed` on every
[`EnrichedGuild`](./) returned by `guild()`.

```ts
export function computeGuild(raw: Guild): GuildComputed;
```

## `GuildComputed`

```ts
interface GuildComputed {
  readonly level: number;
  readonly ranks: readonly GuildRank[];
  readonly tagColor: GuildColor;
  readonly preferredGames: readonly GameInfo[];
  readonly totalWeeklyGEXP: number;
  readonly expHistory: readonly GuildExpHistoryEntry[];
  readonly members: readonly GuildMemberComputed[];
  readonly memberCount: number;
  readonly coinsSpent: number;
  readonly expUntilNextLevel: number;
  readonly topGameType: string | null;
  readonly guildExpByGameTypeShare: Record<string, number>;
  readonly ageInDays: number;
  readonly activeMembersThisWeek: number;
  readonly activeMemberSharePercent: number;
  readonly topWeeklyContributorUuid: string | null;
  readonly averageWeeklyGEXPPerMember: number;
  readonly memberCountByRank: Record<string, number>;
  readonly averageQuestParticipation: number;
}
```

### `level`

Fractional guild level from `guildLevel(raw.exp)` (rounded to 2 decimal places). The
curve steps through fixed per-level costs and settles at 3,000,000 exp per level; see
[Shared helpers](./shared#guild-leveling).

### `ranks`

`raw.ranks` copied and sorted ascending by `priority` (lowest priority first). The raw
array is not mutated.

### `tagColor`

The guild's tag color resolved from the raw color name via a fixed table of the sixteen
Minecraft colors. Unknown or missing names fall back to Gray
(`{ string: "Gray", hex: "#AAAAAA", code: "§7" }`).

```ts
interface GuildColor {
  readonly string: string; // display name, e.g. "Dark Aqua"
  readonly hex: string; // e.g. "#00AAAA"
  readonly code: string; // Minecraft formatting code, e.g. "§3"
}
```

Recognized names: `BLACK`, `DARK_BLUE`, `DARK_GREEN`, `DARK_AQUA`, `DARK_RED`,
`DARK_PURPLE`, `GOLD`, `GRAY`, `DARK_GRAY`, `BLUE`, `GREEN`, `AQUA`, `RED`,
`LIGHT_PURPLE`, `YELLOW`, `WHITE`.

### `preferredGames`

Each code in `raw.preferredGames` resolved to a `GameInfo` (`{ id, code, name }`) via
`gameByCode`. Unknown codes yield `{ id: 0, code, name: code }`. The game table is
documented in [Shared helpers](./shared#game-registry).

### `totalWeeklyGEXP`

The sum of every member's `weeklyExperience` (see `members` below). This is raw,
uncapped GEXP.

### `expHistory`

The guild-wide daily exp history, aggregated across all members and then passed through
Hypixel's daily scaling cap. For each day present in any member's `expHistory`, the raw
per-member values are summed, then capped:

- raw exp up to 200,000: counted in full;
- above 200,000 up to 700,000: `200000 + round((exp - 200000) / 10)`;
- above 700,000: `250000 + round(exp * 0.03)`.

Entries carry a running total in input order (the order days come out of the raw data,
not re-sorted):

```ts
interface GuildExpHistoryEntry {
  readonly day: string; // "YYYY-MM-DD" as reported by the API
  readonly date: Date | null; // parsed as `${day}T05:00:00.000Z`, null if unparseable
  readonly exp: number; // scaled exp for that day
  readonly totalExp: number; // running sum of `exp` over the entries so far
}
```

The `05:00 UTC` timestamp matches Hypixel's daily GEXP reset.

### `members`

One entry per guild member:

```ts
interface GuildMemberComputed {
  readonly uuid: string;
  readonly weeklyExperience: number; // sum of the member's expHistory values
  readonly expHistory: readonly GuildExpHistoryEntry[]; // per-day entries, no cap applied
}
```

Per-member histories are **not** scaled (the daily cap applies to the guild-wide
aggregate only); each entry's `exp` is the raw daily value and `totalExp` is the running
sum across that member's days.

### `memberCount`

`raw.members.length`.

### `coinsSpent`

`raw.coinsEver - raw.coins`: lifetime coins earned minus the current balance.

### `expUntilNextLevel`

Exp remaining to the next whole guild level, from `guildExpUntilNextLevel(raw.exp)`.
This is a `*ForNext*`-style count in the unit convention.

### `topGameType`

The key of `raw.guildExpByGameType` with the highest exp, or `null` when the record is
empty (via `argMax`).

### `guildExpByGameTypeShare`

For every game type in `raw.guildExpByGameType`, that game's share of total guild exp on
the 0 to 100 scale: `percent(value, total)`. All zeros sum to a total of `0`, in which
case every share is `0`.

### `ageInDays`

`(now - createdAt) / 86_400_000` rounded to 2 decimal places, or `0` when `createdAt`
is `null`.

### `activeMembersThisWeek`

The number of members whose `weeklyExperience` is greater than `0`.

### `activeMemberSharePercent`

`percent(activeMembersThisWeek, memberCount)`, 0 to 100.

### `topWeeklyContributorUuid`

The UUID of the member with the highest `weeklyExperience`, or `null`. Uses `argMax`
with a floor of `0`, so a member must have weekly exp strictly greater than `0` to be
selected; if nobody earned exp this week (or the guild has no members) the result is
`null`.

### `averageWeeklyGEXPPerMember`

`ratio(totalWeeklyGEXP, memberCount)`, a bare quotient. When the guild somehow has zero
members the `ratio()` convention returns the numerator.

### `memberCountByRank`

A record mapping each rank name to how many members hold it, built by counting
`member.rank` over `raw.members`.

### `averageQuestParticipation`

The sum of every member's `questParticipation` divided by `memberCount`
(`ratio()` convention), a bare quotient.

## Exports

| Export                 | Kind      | Description                                  |
| ---------------------- | --------- | -------------------------------------------- |
| `GuildColor`           | interface | Resolved tag color (`string`, `hex`, `code`) |
| `GuildExpHistoryEntry` | interface | One day of exp history with running total    |
| `GuildMemberComputed`  | interface | Per-member weekly exp and history            |
| `GuildComputed`        | interface | The `.computed` shape on an enriched guild   |
| `computeGuild`         | function  | `(raw: Guild) => GuildComputed`              |

