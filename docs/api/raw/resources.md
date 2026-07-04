# Resources

The resources module exposes parsers for Hypixel's static `/resources/*` registries, mirroring each raw registry field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation and no derived totals. Across all parsers the safe readers apply: missing or non-number values become `0`, missing or non-string values become `""`, boolean fields are `true` only when the raw value is exactly `true`, missing nested objects are treated as empty objects, and `Date | null` fields are `null` unless the raw value is a positive epoch-ms number.

## parseAchievements

Parses the achievement registry (`/resources/achievements`) into a typed object keyed by game name.

```ts
function parseAchievements(
  achievements: Record<string, unknown>,
): Record<string, AchievementsGame>;
```

### Null / empty behavior

Never returns `null`. Iterates every top-level game key in the raw object; each game value is coerced to an object (non-objects become `{}`) and parsed. The `one_time` and `tiered` raw maps populate the `oneTime` and `tiered` records, which are empty objects when absent. The returned top-level record is empty when the raw object has no keys.

## parseChallenges

Parses the challenge registry (`/resources/challenges`) into a typed object keyed by game name.

```ts
function parseChallenges(
  challenges: Record<string, unknown>,
): Record<string, readonly ResourceChallenge[]>;
```

### Null / empty behavior

Never returns `null`. The raw input is coerced to an object (non-objects become `{}`). Each game value is coerced to an array (non-arrays become `[]`) and mapped to `ResourceChallenge` entries; per-challenge `rewards` likewise become `[]` when absent.

## parseQuests

Parses the quest registry (`/resources/quests`) into a typed object keyed by game name.

```ts
function parseQuests(
  quests: Record<string, unknown>,
): Record<string, ResourceQuest[]>;
```

### Null / empty behavior

Never returns `null`. Iterates every top-level game key; each game value is coerced to an array (non-arrays become `[]`) and mapped to `ResourceQuest` entries. Per-quest `rewards`, `objectives`, and `requirements` become `[]` when absent.

## parseGuildAchievements

Parses the guild achievement registry (`/resources/guilds/achievements`) into a typed object.

```ts
function parseGuildAchievements(
  raw: Record<string, unknown>,
): GuildAchievements | null;
```

### Null / empty behavior

Returns `null` when the raw input is not a plain object (i.e. it is `null`, an array, or a non-object). Otherwise returns a fully-populated `GuildAchievements`. The `one_time` and `tiered` raw maps populate the `oneTime` and `tiered` records, which are empty objects when absent. `lastUpdated` is a `Date` or `null`.

## parseGames

Parses the game registry (`/resources/games`) into a typed object keyed by game key.

```ts
function parseGames(
  games: Record<string, unknown>,
): Readonly<Record<string, GameDefinition>>;
```

### Null / empty behavior

Never returns `null`. Iterates every top-level key; each game value is coerced to an object (non-objects become `{}`). Per-game `modeNames` is read into a record of string values, empty when absent.

## parseVanityPets

Parses the vanity pet registry (`/resources/vanity/pets`) into a typed object.

```ts
function parseVanityPets(data: Record<string, unknown>): VanityResource;
```

### Null / empty behavior

Never returns `null`. The raw `types` and `rarities` are each read only when they are arrays (otherwise `[]`); non-object array entries are filtered out before mapping.

## parseVanityCompanions

Parses the vanity companion registry (`/resources/vanity/companions`) into a typed object. Identical shape and behavior to `parseVanityPets`.

```ts
function parseVanityCompanions(data: Record<string, unknown>): VanityResource;
```

---

## Returned type tree

### AchievementsGame

The per-game value returned by `parseAchievements`.

```ts
interface AchievementsGame {
  readonly totalPoints: number;
  readonly totalLegacyPoints: number;
  readonly oneTime: Record<string, AchievementOneTime>;
  readonly tiered: Record<string, AchievementTiered>;
}
```

| Field               | Notes                                                |
| ------------------- | ---------------------------------------------------- |
| `totalPoints`       | Raw `total_points`.                                  |
| `totalLegacyPoints` | Raw `total_legacy_points`.                           |
| `oneTime`           | Raw `one_time` map, keyed by achievement identifier. |
| `tiered`            | Raw `tiered` map, keyed by achievement identifier.   |

### AchievementOneTime

```ts
interface AchievementOneTime {
  readonly name: string;
  readonly description: string;
  readonly secret: boolean;
  readonly legacy: boolean;
  readonly points: number;
  readonly gamePercentUnlocked: number;
  readonly globalPercentUnlocked: number;
}
```

| Field                   | Notes                                           |
| ----------------------- | ----------------------------------------------- |
| `gamePercentUnlocked`   | Percent of players in the game who unlocked it. |
| `globalPercentUnlocked` | Percent of all players who unlocked it.         |

### AchievementTiered

```ts
interface AchievementTiered {
  readonly name: string;
  readonly description: string;
  readonly legacy: boolean;
  readonly tiers: readonly AchievementTier[];
}
```

### AchievementTier

```ts
interface AchievementTier {
  readonly tier: number;
  readonly points: number;
  readonly amount: number;
}
```

---

### ResourceChallenge

The per-entry value in each game's challenge list returned by `parseChallenges`.

```ts
interface ResourceChallenge {
  readonly id: string;
  readonly name: string;
  readonly rewards: readonly ResourceChallengeReward[];
}
```

### ResourceChallengeReward

```ts
interface ResourceChallengeReward {
  readonly type: string;
  readonly amount: number;
}
```

---

### ResourceQuest

The per-entry value in each game's quest list returned by `parseQuests`.

```ts
interface ResourceQuest {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rewards: readonly ResourceQuestReward[];
  readonly objectives: readonly ResourceQuestObjective[];
  readonly requirements: readonly ResourceQuestRequirement[];
}
```

### ResourceQuestReward

```ts
interface ResourceQuestReward {
  readonly type: string;
  readonly amount: number;
}
```

### ResourceQuestObjective

```ts
interface ResourceQuestObjective {
  readonly id: string;
  readonly type: string;
  readonly integer: number;
}
```

### ResourceQuestRequirement

```ts
interface ResourceQuestRequirement {
  readonly type: string;
}
```

---

### GuildAchievements

The root object returned by `parseGuildAchievements` (or `null`).

```ts
interface GuildAchievements {
  readonly success: boolean;
  readonly lastUpdated: Date | null;
  readonly oneTime: Record<string, GuildOneTimeAchievement>;
  readonly tiered: Record<string, GuildTieredAchievement>;
}
```

| Field         | Notes                                                |
| ------------- | ---------------------------------------------------- |
| `lastUpdated` | Epoch-ms timestamp as `Date`, or `null`.             |
| `oneTime`     | Raw `one_time` map, keyed by achievement identifier. |
| `tiered`      | Raw `tiered` map, keyed by achievement identifier.   |

### GuildOneTimeAchievement

```ts
interface GuildOneTimeAchievement {
  readonly name: string;
  readonly description: string;
  readonly points: number;
}
```

### GuildTieredAchievement

```ts
interface GuildTieredAchievement {
  readonly name: string;
  readonly description: string;
  readonly tiers: readonly GuildAchievementTier[];
}
```

### GuildAchievementTier

```ts
interface GuildAchievementTier {
  readonly tier: number;
  readonly amount: number;
}
```

---

### GameDefinition

The per-game value returned by `parseGames`.

```ts
interface GameDefinition {
  readonly id: number;
  readonly name: string;
  readonly databaseName: string;
  readonly legacy: boolean;
  readonly retired: boolean;
  readonly modeNames: Readonly<Record<string, string>>;
}
```

| Field          | Notes                                            |
| -------------- | ------------------------------------------------ |
| `id`           | Numeric game id.                                 |
| `name`         | Display name of the game.                        |
| `databaseName` | Internal database name.                          |
| `legacy`       | Whether the game is legacy.                      |
| `retired`      | Whether the game is retired (raw `retired`).     |
| `modeNames`    | Raw `modeNames` map of mode key to display name. |

---

### VanityResource

The object returned by both `parseVanityPets` and `parseVanityCompanions`.

```ts
interface VanityResource {
  readonly types: readonly VanityItem[];
  readonly rarities: readonly VanityRarity[];
}
```

### VanityItem

```ts
interface VanityItem {
  readonly key: string;
  readonly name: string;
  readonly rarity: string;
  readonly package: string;
}
```

### VanityRarity

```ts
interface VanityRarity {
  readonly name: string;
  readonly color: string;
}
```
