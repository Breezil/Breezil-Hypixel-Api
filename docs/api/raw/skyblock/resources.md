# SkyBlock Resources

The resources module (`skyblock-resources.ts`) parses the static SkyBlock resource endpoints (`/resources/skyblock/*`). Each function mirrors the raw Hypixel API JSON field-for-field into readonly, fully-typed objects with no computed or derived values. Missing numbers become `0`, missing strings become `""`, boolean fields are `true` only when the raw value is exactly `true`, and epoch-ms timestamps become `Date` or `null`. Every parser returns `null` when its input is not a non-array object.

## parseSkyBlockSkills

Parses the SkyBlock skill registry (`/resources/skyblock/skills`) into a typed object.

```ts
function parseSkyBlockSkills(
  raw: Record<string, unknown>,
): SkyBlockSkillsResource | null;
```

### Null / empty behavior

- Returns `null` when `raw` is not a non-array object.
- `skills` is keyed by raw skill key; only object values are kept.
- Each skill's `levels` is built from the raw `levels` array (non-object entries skipped); each level's `unlocks` is `[]` when missing or not an array.
- `lastUpdated` is `null` when its epoch-ms timestamp is absent or unparseable.

## parseSkyBlockCollections

Parses the SkyBlock collection registry (`/resources/skyblock/collections`) into a typed object.

```ts
function parseSkyBlockCollections(
  raw: Record<string, unknown>,
): SkyBlockCollectionsResource | null;
```

### Null / empty behavior

- Returns `null` when `raw` is not a non-array object.
- `collections` is keyed by raw category key; `items` within each category is keyed by raw item key. Only object values are kept at both levels.
- Each definition's `tiers` is built from the raw `tiers` array (non-object entries skipped); each tier's `unlocks` is `[]` when missing or not an array.
- `lastUpdated` is `null` when absent or unparseable.

## parseSkyBlockElection

Parses the SkyBlock election (`/resources/skyblock/election`) into a typed object.

```ts
function parseSkyBlockElection(
  raw: Record<string, unknown>,
): SkyBlockElectionResource | null;
```

### Null / empty behavior

- Returns `null` when `raw` is not a non-array object.
- `mayor` is `null` when the raw `mayor.name` is empty.
- `lastElection` is read from the raw `mayor.election` object and is always present.
- `currentElection` is `null` when the raw `current` field is not an object.
- A candidate's `perks` (and the mayor's `perks`) are `[]` when the raw `perks` is missing or not an array.
- `minister` is `null` when the raw `mayor.minister` is not an object; a minister's `perk` is `null` when the raw `minister.perk` is not an object.
- `lastUpdated` is `null` when absent or unparseable.

## parseSkyBlockBingo

Parses the SkyBlock bingo event resource (`/resources/skyblock/bingo`) into a typed object.

```ts
function parseSkyBlockBingo(
  raw: Record<string, unknown>,
): SkyBlockBingoResource | null;
```

### Null / empty behavior

- Returns `null` when `raw` is not a non-array object.
- `goals` is built from the raw `goals` array (non-object entries skipped); each goal's `fullLore` and `tiers` are `[]` when missing or not arrays.
- A goal's `requiredAmount` is the raw `requiredAmount` when it is a number, otherwise `null`.
- `lastUpdated`, `start`, and `end` are `null` when their epoch-ms timestamps are absent or unparseable.

---

## Returned type tree

### SkyBlockSkillsResource

The object returned by `parseSkyBlockSkills`.

```ts
interface SkyBlockSkillsResource {
  readonly lastUpdated: Date | null;
  readonly version: string;
  readonly skills: Record<string, SkyBlockSkill>;
}
```

| Field         | Notes                             |
| ------------- | --------------------------------- |
| `lastUpdated` | Resource last-updated timestamp.  |
| `version`     | Resource version (raw `version`). |
| `skills`      | Skills keyed by raw skill key.    |

### SkyBlockSkill

```ts
interface SkyBlockSkill {
  readonly name: string;
  readonly description: string;
  readonly maxLevel: number;
  readonly levels: SkyBlockSkillLevel[];
}
```

| Field         | Raw key       |
| ------------- | ------------- |
| `name`        | `name`        |
| `description` | `description` |
| `maxLevel`    | `maxLevel`    |
| `levels`      | `levels`      |

### SkyBlockSkillLevel

```ts
interface SkyBlockSkillLevel {
  readonly level: number;
  readonly totalExpRequired: number;
  readonly unlocks: string[];
}
```

| Field              | Raw key            |
| ------------------ | ------------------ |
| `level`            | `level`            |
| `totalExpRequired` | `totalExpRequired` |
| `unlocks`          | `unlocks`          |

### SkyBlockCollectionsResource

The object returned by `parseSkyBlockCollections`.

```ts
interface SkyBlockCollectionsResource {
  readonly lastUpdated: Date | null;
  readonly version: string;
  readonly collections: Record<string, SkyBlockCollectionCategory>;
}
```

| Field         | Notes                                 |
| ------------- | ------------------------------------- |
| `lastUpdated` | Resource last-updated timestamp.      |
| `version`     | Resource version (raw `version`).     |
| `collections` | Categories keyed by raw category key. |

### SkyBlockCollectionCategory

```ts
interface SkyBlockCollectionCategory {
  readonly name: string;
  readonly items: Record<string, SkyBlockCollectionDefinition>;
}
```

| Field   | Notes                                    |
| ------- | ---------------------------------------- |
| `name`  | Category name (raw `name`).              |
| `items` | Collection definitions keyed by raw key. |

### SkyBlockCollectionDefinition

```ts
interface SkyBlockCollectionDefinition {
  readonly name: string;
  readonly maxTiers: number;
  readonly tiers: SkyBlockCollectionTier[];
}
```

| Field      | Raw key    |
| ---------- | ---------- |
| `name`     | `name`     |
| `maxTiers` | `maxTiers` |
| `tiers`    | `tiers`    |

### SkyBlockCollectionTier

```ts
interface SkyBlockCollectionTier {
  readonly tier: number;
  readonly amountRequired: number;
  readonly unlocks: string[];
}
```

| Field            | Raw key          |
| ---------------- | ---------------- |
| `tier`           | `tier`           |
| `amountRequired` | `amountRequired` |
| `unlocks`        | `unlocks`        |

### SkyBlockElectionResource

The object returned by `parseSkyBlockElection`.

```ts
interface SkyBlockElectionResource {
  readonly lastUpdated: Date | null;
  readonly mayor: SkyBlockElectionMayor | null;
  readonly lastElection: SkyBlockElection;
  readonly currentElection: SkyBlockElection | null;
}
```

| Field             | Notes                                                        |
| ----------------- | ------------------------------------------------------------ |
| `lastUpdated`     | Resource last-updated timestamp.                             |
| `mayor`           | Current mayor, or `null` when the raw `mayor.name` is empty. |
| `lastElection`    | Last election (raw `mayor.election`).                        |
| `currentElection` | Ongoing election (raw `current`), or `null`.                 |

### SkyBlockElectionMayor

```ts
interface SkyBlockElectionMayor {
  readonly name: string;
  readonly keyBenefit: string;
  readonly perks: SkyBlockElectionPerk[];
  readonly minister: SkyBlockElectionMinister | null;
}
```

| Field        | Notes                            |
| ------------ | -------------------------------- |
| `name`       | Mayor name (raw `mayor.name`).   |
| `keyBenefit` | Key benefit (raw `mayor.key`).   |
| `perks`      | Mayor perks (raw `mayor.perks`). |
| `minister`   | Active minister, or `null`.      |

### SkyBlockElectionMinister

```ts
interface SkyBlockElectionMinister {
  readonly name: string;
  readonly keyBenefit: string;
  readonly perk: SkyBlockElectionPerk | null;
}
```

| Field        | Notes                                           |
| ------------ | ----------------------------------------------- |
| `name`       | Minister name (raw `minister.name`).            |
| `keyBenefit` | Key benefit (raw `minister.key`).               |
| `perk`       | Minister perk (raw `minister.perk`), or `null`. |

### SkyBlockElection

Used for both `lastElection` and `currentElection`.

```ts
interface SkyBlockElection {
  readonly year: number;
  readonly candidates: SkyBlockElectionCandidate[];
}
```

| Field        | Raw key      |
| ------------ | ------------ |
| `year`       | `year`       |
| `candidates` | `candidates` |

### SkyBlockElectionCandidate

```ts
interface SkyBlockElectionCandidate {
  readonly name: string;
  readonly keyBenefit: string;
  readonly perks: SkyBlockElectionPerk[];
  readonly votesReceived: number;
}
```

| Field           | Raw key |
| --------------- | ------- |
| `name`          | `name`  |
| `keyBenefit`    | `key`   |
| `perks`         | `perks` |
| `votesReceived` | `votes` |

### SkyBlockElectionPerk

Used by mayors, candidates, and ministers.

```ts
interface SkyBlockElectionPerk {
  readonly name: string;
  readonly description: string;
  readonly minister: boolean;
}
```

| Field         | Raw key       |
| ------------- | ------------- |
| `name`        | `name`        |
| `description` | `description` |
| `minister`    | `minister`    |

### SkyBlockBingoResource

The object returned by `parseSkyBlockBingo`.

```ts
interface SkyBlockBingoResource {
  readonly lastUpdated: Date | null;
  readonly id: number;
  readonly name: string;
  readonly start: Date | null;
  readonly end: Date | null;
  readonly modifier: string;
  readonly goals: SkyBlockBingoGoal[];
}
```

| Field           | Notes                            |
| --------------- | -------------------------------- |
| `lastUpdated`   | Resource last-updated timestamp. |
| `id`            | Event id (raw `id`).             |
| `name`          | Event name (raw `name`).         |
| `start` / `end` | Event start / end timestamps.    |
| `modifier`      | Event modifier (raw `modifier`). |
| `goals`         | Goal definitions (raw `goals`).  |

### SkyBlockBingoGoal

```ts
interface SkyBlockBingoGoal {
  readonly id: string;
  readonly name: string;
  readonly lore: string;
  readonly fullLore: string[];
  readonly progress: number;
  readonly tiers: number[];
  readonly requiredAmount: number | null;
}
```

| Field            | Notes                                                |
| ---------------- | ---------------------------------------------------- |
| `id`             | Goal id (raw `id`).                                  |
| `name`           | Goal name (raw `name`).                              |
| `lore`           | Single-line lore (raw `lore`).                       |
| `fullLore`       | Multi-line lore (raw `fullLore`).                    |
| `progress`       | Raw `progress`.                                      |
| `tiers`          | Tier thresholds (raw `tiers`).                       |
| `requiredAmount` | Raw `requiredAmount` when numeric, otherwise `null`. |
