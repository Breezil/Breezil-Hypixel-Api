# SpeedUHC

The SpeedUHC module exposes a single parser, `parseSpeedUHC`, which mirrors the raw `stats.SpeedUHC` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals. SpeedUHC is a retired mode, but it is still typed here because old players retain the data.

## parseSpeedUHC

Parses a player's SpeedUHC stats (`stats.SpeedUHC`) into a typed object.

```ts
function parseSpeedUHC(block: Record<string, unknown>): SpeedUHCStats | null;
```

### Null / empty behavior

`parseSpeedUHC` returns `null` when the raw block is absent or has no keys. Otherwise it returns a fully-populated `SpeedUHCStats` object, with missing values filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- The `packages` string-array field becomes an empty array (`[]`) when absent.

The dynamic maps (`found`, `drops`, `votes`, `rollingKills`, `kitStats`, `masteryStats`, `perkLevels`, `modeStats`) are populated by sweeping every remaining numeric key in the raw block and bucketing it by key shape. Keys that are read into explicit fields above are excluded. Each map contains only the keys present in the raw data, so any may be empty.

---

## Returned type tree

### SpeedUHCStats

The root object returned by `parseSpeedUHC`.

```ts
interface SpeedUHCStats {
  readonly coins: number;
  readonly score: number;
  readonly salt: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly wins: number;
  readonly losses: number;
  readonly games: number;
  readonly quits: number;
  readonly killstreak: number;
  readonly highestKillstreak: number;
  readonly winStreak: number;
  readonly winstreak: number;
  readonly highestWinstreak: number;
  readonly survivedPlayers: number;
  readonly arrowsHit: number;
  readonly arrowsShot: number;
  readonly blocksBroken: number;
  readonly blocksPlaced: number;
  readonly itemsEnchanted: number;
  readonly extraWheels: number;
  readonly tears: number;
  readonly tearsGathered: number;
  readonly tearWellUses: number;
  readonly eggThrown: number;
  readonly enderpearlsThrown: number;
  readonly firstJoinLobby: boolean;
  readonly firstJoinLobbyInt: number;
  readonly movedOver: boolean;
  readonly combatTracker: boolean;
  readonly votedInsaneGrace: boolean;
  readonly shopSort: string;
  readonly shopSortEnableOwnedFirst: boolean;
  readonly masteryBerserk: number;
  readonly masteryFortune: number;
  readonly masteryGuardian: number;
  readonly masteryHuntsman: number;
  readonly masteryInvigorate: number;
  readonly masteryMasterBaker: number;
  readonly masterySniper: number;
  readonly masteryVampirism: number;
  readonly activeKitInsane: string;
  readonly activeKitNormal: string;
  readonly activeMasterPerk: string;
  readonly activeCage: string;
  readonly activeKillEffect: string;
  readonly activeProjectileTrail: string;
  readonly activeVictoryDance: string;
  readonly packages: readonly string[];
  readonly found: Readonly<Record<string, number>>;
  readonly drops: Readonly<Record<string, number>>;
  readonly votes: Readonly<Record<string, number>>;
  readonly rollingKills: Readonly<Record<string, number>>;
  readonly kitStats: Readonly<Record<string, number>>;
  readonly masteryStats: Readonly<Record<string, number>>;
  readonly perkLevels: Readonly<Record<string, number>>;
  readonly modeStats: Readonly<Record<string, number>>;
}
```

| Field               | Notes                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| `winStreak`         | Raw `win_streak`.                                                     |
| `winstreak`         | Raw `winstreak` (separate raw key from `win_streak`).                 |
| `activeKitInsane`   | Raw `activeKit_INSANE`.                                               |
| `activeKitNormal`   | Raw `activeKit_NORMAL`.                                               |
| `firstJoinLobbyInt` | Raw `firstJoinLobbyInt`, kept alongside the boolean `firstJoinLobby`. |

---

## Dynamic numeric maps

The eight `Record<string, number>` fields are filled by scanning every numeric raw key that is not one of the explicit fields above, then routing it by key shape. The first matching rule wins, in this order:

| Field          | Rule (raw key)                              |
| -------------- | ------------------------------------------- |
| `found`        | starts with `found_`                        |
| `drops`        | ends with `_drop`                           |
| `votes`        | starts with `votes_`                        |
| `kitStats`     | contains `_kit_basic_`                      |
| `masteryStats` | contains `_mastery_`                        |
| `rollingKills` | contains `_monthly_` or `_weekly_`          |
| `perkLevels`   | starts with `insane_` or `normal_`          |
| `modeStats`    | any remaining numeric key not matched above |

Keys in these maps are preserved verbatim from the raw block (not camel-cased).
