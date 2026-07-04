# Quakecraft

The Quakecraft module exposes a single parser, `parseQuakecraft`, which mirrors the raw `stats.Quake` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseQuakecraft

Parses a player's Quakecraft stats (`stats.Quake`) into a typed object.

```ts
function parseQuakecraft(
  stats: Record<string, unknown>,
): QuakecraftStats | null;
```

### Null / empty behavior

`parseQuakecraft` returns `null` when `stats.Quake` is missing, is not an object, or is an array. Otherwise it returns a fully-populated `QuakecraftStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- The `packages` string-array field becomes an empty array (`[]`) when absent or non-array; non-string elements are filtered out.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.
- `mapVotes` contains only the keys present in the raw data, so it may be an empty object when no data exists.

---

## Returned type tree

### QuakecraftStats

The root object returned by `parseQuakecraft`.

```ts
interface QuakecraftStats {
  readonly coins: number;
  readonly highestKillstreak: number;
  readonly killsDeathmatch: number;
  readonly killsDeathmatchTeams: number;
  readonly killsTimeAttack: number;
  readonly killsTourneyUnknown: number;
  readonly winsDeathmatch: number;
  readonly winsDeathmatchTeam: number;
  readonly winsTeam: number;
  readonly winsTimeAttack: number;
  readonly teamWins: number;
  readonly compassRefund: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
  readonly lastTourneyAd: Date | null;
  readonly packages: readonly string[];
  readonly solo: QuakecraftModeStats;
  readonly teams: QuakecraftModeStats;
  readonly soloTourney: QuakecraftModeStats;
  readonly tourneyQuakeSolo2: QuakecraftModeStats;
  readonly mapVotes: QuakecraftMapVotes;
  readonly cosmetics: QuakecraftCosmetics;
  readonly settings: QuakecraftSettings;
}
```

| Field                             | Notes                                      |
| --------------------------------- | ------------------------------------------ |
| `highestKillstreak`               | Raw `highest_killstreak`.                  |
| `killsDeathmatch`                 | Raw `kills_dm`.                            |
| `killsDeathmatchTeams`            | Raw `kills_dm_teams`.                      |
| `killsTimeAttack`                 | Raw `kills_timeattack`.                    |
| `killsTourneyUnknown`             | Raw `kills_tourney_unknown`.               |
| `winsDeathmatch`                  | Raw `wins_dm`.                             |
| `winsDeathmatchTeam`              | Raw `wins_dm_team`.                        |
| `winsTeam`                        | Raw `wins_team`.                           |
| `winsTimeAttack`                  | Raw `wins_timeattack`.                     |
| `teamWins`                        | Raw `team_wins`.                           |
| `compassRefund`                   | Raw `compass_refund`.                      |
| `monthlyKillsA` / `monthlyKillsB` | Raw `monthly_kills_a` / `monthly_kills_b`. |
| `weeklyKillsA` / `weeklyKillsB`   | Raw `weekly_kills_a` / `weekly_kills_b`.   |
| `lastTourneyAd`                   | Epoch-ms timestamp as `Date`, or `null`.   |
| `solo`                            | Mode stats with no key suffix.             |
| `teams`                           | `_teams` suffix.                           |
| `soloTourney`                     | `_solo_tourney` suffix.                    |
| `tourneyQuakeSolo2`               | `_tourney_quake_solo2_1` suffix.           |

---

## Mode stats

### QuakecraftModeStats

The shared shape for `solo`, `teams`, `soloTourney`, and `tourneyQuakeSolo2`. Each field reads a `<base><suffix>` raw key for that mode's suffix.

```ts
interface QuakecraftModeStats {
  readonly wins: number;
  readonly kills: number;
  readonly deaths: number;
  readonly killstreaks: number;
  readonly distanceTravelled: number;
  readonly shotsFired: number;
  readonly headshots: number;
  readonly killsSinceUpdateFeb2017: number;
}
```

| Field                     | Raw key base                  |
| ------------------------- | ----------------------------- |
| `distanceTravelled`       | `distance_travelled`          |
| `shotsFired`              | `shots_fired`                 |
| `killsSinceUpdateFeb2017` | `kills_since_update_feb_2017` |

---

## Map votes

### QuakecraftMapVotes

An open record of per-map vote counts. Every raw key matching `votes_<map>` with a numeric value is collected, keyed by the map name (the `votes_` prefix stripped). Contains only the keys present in the raw data.

```ts
type QuakecraftMapVotes = Readonly<Record<string, number>>;
```

---

## Cosmetics

### QuakecraftCosmetics

Selected cosmetic identifiers.

```ts
interface QuakecraftCosmetics {
  readonly killSound: string;
  readonly barrel: string;
  readonly case: string;
  readonly muzzle: string;
  readonly sight: string;
  readonly trigger: string;
  readonly beam: string;
  readonly armor: string;
  readonly hat: string;
  readonly boots: string;
  readonly leggings: string;
  readonly compass: string;
  readonly killPrefixColor: string;
}
```

| Field             | Raw key              |
| ----------------- | -------------------- |
| `killSound`       | `killsound`          |
| `compass`         | `null`               |
| `killPrefixColor` | `selectedKillPrefix` |

---

## Settings

### QuakecraftSettings

Player gameplay and UI settings.

```ts
interface QuakecraftSettings {
  readonly instantRespawn: boolean;
  readonly showPrefix: boolean;
  readonly showDashCooldown: boolean;
  readonly enableSound: boolean;
  readonly compassSelected: boolean;
  readonly alternativeGunCooldownIndicator: boolean;
  readonly dashCooldown: string;
  readonly dashPower: string;
  readonly messageCoin: boolean;
  readonly messageCoinMessages: boolean;
  readonly messageKillstreaks: boolean;
  readonly messageMultiKills: boolean;
  readonly messageOthersKillsDeaths: boolean;
  readonly messagePowerupCollections: boolean;
  readonly messageYourDeaths: boolean;
  readonly messageYourKills: boolean;
}
```

| Field                             | Raw key                              |
| --------------------------------- | ------------------------------------ |
| `showPrefix`                      | `showKillPrefix`                     |
| `enableSound`                     | `enable_sound`                       |
| `compassSelected`                 | `compass_selected`                   |
| `alternativeGunCooldownIndicator` | `alternative_gun_cooldown_indicator` |
| `dashCooldown`                    | `dash_cooldown`                      |
| `dashPower`                       | `dash_power`                         |
| `messageCoinMessages`             | `messageCoin Messages`               |
| `messageMultiKills`               | `messageMulti-kills`                 |
| `messageOthersKillsDeaths`        | `messageOthers' Kills/deaths`        |
| `messagePowerupCollections`       | `messagePowerup Collections`         |
| `messageYourDeaths`               | `messageYour Deaths`                 |
| `messageYourKills`                | `messageYour Kills`                  |
