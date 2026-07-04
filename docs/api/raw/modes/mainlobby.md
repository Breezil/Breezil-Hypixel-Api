# MainLobby

The MainLobby module exposes a single parser, `parseMainLobby`, which mirrors the raw `stats.MainLobby` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseMainLobby

Parses a player's MainLobby stats (`stats.MainLobby`) into a typed object.

```ts
function parseMainLobby(block: Record<string, unknown>): MainLobbyStats | null;
```

### Null / empty behavior

`parseMainLobby` returns `null` when the raw block is empty (no keys). Otherwise it returns a fully-populated `MainLobbyStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- `packages` becomes an empty array (`[]`) when absent or not an array; non-string entries are dropped.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- The dynamic maps below contain only the keys present in the raw data, filtered by value type: boolean maps keep only boolean values, number maps keep only number values. They may be empty objects when no matching data exists.

---

## Returned type tree

### MainLobbyStats

The root object returned by `parseMainLobby`.

```ts
interface MainLobbyStats {
  readonly coins: number;
  readonly packages: readonly string[];
  readonly activeFishHookTrail: string;
  readonly fishingRewardTracked: string;
  readonly discoveredZones: Readonly<Record<string, boolean>>;
  readonly historicalRecords: Readonly<Record<string, boolean>>;
  readonly questNPCTutorials: Readonly<Record<string, boolean>>;
  readonly relics: Readonly<Record<string, boolean>>;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly leaderboardSettings: MainLobbyLeaderboardSettings;
  readonly becomeRabbit: MainLobbyBecomeAnimal;
  readonly becomeSheep: MainLobbyBecomeAnimal;
  readonly fishing: MainLobbyFishing;
}
```

| Field                  | Notes                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `coins`                | Reads `coins`, falling back to `tokens` when `coins` is `0`/absent.                                |
| `fishingRewardTracked` | Raw `fishing_reward_tracked`.                                                                      |
| `discoveredZones`      | Boolean map from the raw `discoveredZones` object (dynamic keys).                                  |
| `historicalRecords`    | Boolean map from the raw `historicalRecords` object (dynamic keys).                                |
| `questNPCTutorials`    | Boolean map from the raw `questNPCTutorials` object (dynamic keys).                                |
| `relics`               | Boolean map from the raw `relics` object (dynamic keys).                                           |
| `flags`                | Boolean map collected from every top-level boolean field directly on the raw block (dynamic keys). |

---

## Leaderboard settings

### MainLobbyLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface MainLobbyLeaderboardSettings {
  readonly fishingType: string;
}
```

---

## Become animal

### MainLobbyBecomeAnimal

Shared shape for both `becomeRabbit` and `becomeSheep`, each read from its respective raw object.

```ts
interface MainLobbyBecomeAnimal {
  readonly eaten: Readonly<Record<string, number>>;
  readonly settings: Readonly<Record<string, boolean>>;
}
```

| Field      | Notes                                                      |
| ---------- | ---------------------------------------------------------- |
| `eaten`    | Number map from the raw `eaten` object (dynamic keys).     |
| `settings` | Boolean map from the raw `settings` object (dynamic keys). |

---

## Fishing

### MainLobbyFishing

Read from the raw `fishing` object.

```ts
interface MainLobbyFishing {
  readonly activeFishHookTrail: string;
  readonly activeFishingRod: string;
  readonly enchants: Readonly<Record<string, MainLobbyFishingEnchant>>;
  readonly fireproofing: Readonly<Record<string, number>>;
  readonly ice: Readonly<Record<string, boolean>>;
  readonly orbs: MainLobbyFishingOrbs;
  readonly settings: Readonly<Record<string, boolean>>;
  readonly specialFish: Readonly<Record<string, boolean>>;
  readonly stats: Readonly<Record<string, MainLobbyFishingPeriodStats>>;
}
```

| Field          | Notes                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| `enchants`     | Keyed by enchant name (dynamic keys); each value is a `MainLobbyFishingEnchant`.    |
| `fireproofing` | Number map from the raw `fireproofing` object (dynamic keys).                       |
| `ice`          | Boolean map from the raw `ice` object (dynamic keys).                               |
| `specialFish`  | Boolean map from the raw `special_fish` object (dynamic keys).                      |
| `stats`        | Keyed by period name (dynamic keys); each value is a `MainLobbyFishingPeriodStats`. |

### MainLobbyFishingEnchant

```ts
interface MainLobbyFishingEnchant {
  readonly level: number;
  readonly toggle: boolean;
}
```

### MainLobbyFishingOrbs

Read from the raw `orbs` object. `counts` is the number map of `orbs` itself; `weight` is the number map of the nested `orbs.weight` object.

```ts
interface MainLobbyFishingOrbs {
  readonly counts: Readonly<Record<string, number>>;
  readonly weight: Readonly<Record<string, number>>;
}
```

### MainLobbyFishingPeriodStats

A recursively-parsed period stats node. Each raw child object is sorted into one of three buckets: a child named `individual` is split into per-category number maps under `individual`; any child whose values are all numbers becomes an entry of `counts`; any other child object is recursed into as a nested period under `periods`.

```ts
interface MainLobbyFishingPeriodStats {
  readonly counts: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly individual: Readonly<
    Record<string, Readonly<Record<string, number>>>
  >;
  readonly periods: Readonly<Record<string, MainLobbyFishingPeriodStats>>;
}
```

| Field        | Notes                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `counts`     | Keyed by raw child name (dynamic keys); each value is a number map of that child object.                            |
| `individual` | Keyed by category name under the raw `individual` object (dynamic keys); each value is a number map.                |
| `periods`    | Keyed by raw child name (dynamic keys) for non-leaf children; each value is a nested `MainLobbyFishingPeriodStats`. |
