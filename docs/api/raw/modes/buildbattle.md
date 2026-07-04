# Build Battle

The Build Battle module exposes a single parser, `parseBuildBattle`, which mirrors the raw `stats.BuildBattle` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseBuildBattle

Parses a player's Build Battle stats (`stats.BuildBattle`) into a typed object.

```ts
function parseBuildBattle(
  stats: Record<string, unknown>,
): BuildBattleStats | null;
```

### Null / empty behavior

`parseBuildBattle` returns `null` when `stats.BuildBattle` is missing or is not a plain object (i.e. it is absent, `null`, or an array). Otherwise it returns a fully-populated `BuildBattleStats` object; every field below is always present. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- String-array fields become empty arrays (`[]`) when absent, and keep only the string entries of the raw array.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.

The dynamic record fields (`votesByTheme`, `votesReceived`, `backdropWins`) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### BuildBattleStats

The root object returned by `parseBuildBattle`.

```ts
interface BuildBattleStats {
  readonly coins: number;
  readonly score: number;
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly winsSoloNormal: number;
  readonly winsSoloPro: number;
  readonly winsTeamsNormal: number;
  readonly winsGuessTheBuild: number;
  readonly winsSpeedBuilders: number;
  readonly winsHalloween: number;
  readonly winsBuildBattle: number;
  readonly seasonalWins: number;
  readonly seasonalWinsSoloNormal: number;
  readonly seasonalWinsSpeedBuilders: number;
  readonly seasonalWinsTeamsNormal: number;
  readonly correctGuesses: number;
  readonly firstGuesses: number;
  readonly totalVotes: number;
  readonly superVotes: number;
  readonly soloMostPoints: number;
  readonly teamsMostPoints: number;
  readonly monthlyCoins: BuildBattlePeriodCoins;
  readonly weeklyCoins: BuildBattlePeriodCoins;
  readonly music: boolean;
  readonly loadout: readonly string[];
  readonly packages: readonly string[];
  readonly perfectInsaneBuilds: readonly string[];
  readonly activeMovementTrail: string;
  readonly activeIsland: string;
  readonly selectedHat: string;
  readonly suit: string;
  readonly victoryDance: string;
  readonly selectedBackdrop: string;
  readonly selectedPrefixIcon: string;
  readonly selectedIconColor: string;
  readonly lastPurchasedSong: string;
  readonly shopSort: string;
  readonly shopSortOwnedFirst: boolean;
  readonly leaderboardSettings: BuildBattleLeaderboardSettings;
  readonly lastWin: BuildBattleLastWin;
  readonly favorites: BuildBattleFavorites;
  readonly votesByTheme: Readonly<Record<string, number>>;
  readonly votesReceived: Readonly<Record<string, number>>;
  readonly backdropWins: Readonly<Record<string, number>>;
}
```

| Field                | Notes                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `winsBuildBattle`    | Raw `wins_buildbattle`.                                                                                       |
| `loadout`            | Raw `buildbattle_loadout`.                                                                                    |
| `selectedHat`        | Raw `new_selected_hat`.                                                                                       |
| `suit`               | Raw `new_suit`.                                                                                               |
| `victoryDance`       | Raw `new_victory_dance`.                                                                                      |
| `shopSortOwnedFirst` | Raw `shop_sort_enable_owned_first`.                                                                           |
| `votesByTheme`       | Every raw key beginning with `votes_` whose value is a number; the `votes_` prefix is stripped from each key. |
| `votesReceived`      | Numeric entries of the raw `votes_received` object.                                                           |
| `backdropWins`       | Numeric entries of the raw `backdrop_wins` object.                                                            |

---

### BuildBattlePeriodCoins

Used for both `monthlyCoins` (raw `monthly_coins_a` / `monthly_coins_b`) and `weeklyCoins` (raw `weekly_coins_a` / `weekly_coins_b`).

```ts
interface BuildBattlePeriodCoins {
  readonly coinsA: number;
  readonly coinsB: number;
}
```

### BuildBattleLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface BuildBattleLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

### BuildBattleLastWin

Read from the raw `last_won` object. Each field is an epoch-ms timestamp as a `Date`, or `null` when absent.

```ts
interface BuildBattleLastWin {
  readonly guessTheBuild: Date | null;
  readonly soloNormal: Date | null;
  readonly soloPro: Date | null;
  readonly speedBuilders: Date | null;
  readonly teamsNormal: Date | null;
}
```

| Field           | Raw key           |
| --------------- | ----------------- |
| `guessTheBuild` | `GUESS_THE_BUILD` |
| `soloNormal`    | `SOLO_NORMAL`     |
| `soloPro`       | `SOLO_PRO`        |
| `speedBuilders` | `SPEED_BUILDERS`  |
| `teamsNormal`   | `TEAMS_NORMAL`    |

### BuildBattleFavorites

Read from the raw `favorites` object.

```ts
interface BuildBattleFavorites {
  readonly backdrops: readonly string[];
  readonly island: readonly string[];
}
```
