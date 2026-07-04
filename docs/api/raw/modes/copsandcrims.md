# Cops and Crims

The Cops and Crims module exposes a single parser, `parseCopsAndCrims`, which mirrors the raw `stats.MCGO` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseCopsAndCrims

Parses a player's Cops and Crims stats (`stats.MCGO`) into a typed object.

```ts
function parseCopsAndCrims(
  stats: Record<string, unknown>,
): CopsAndCrimsStats | null;
```

### Null / empty behavior

`parseCopsAndCrims` returns `null` when `stats.MCGO` is missing, is not an object, or is an array. Otherwise it returns a fully-populated `CopsAndCrimsStats` object. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- The `packages` (string) and `claimedLevelRewards` (number) array fields become empty arrays (`[]`) when absent or non-array; non-matching element types are filtered out.
- The dynamic `datedSnapshots` maps contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### CopsAndCrimsStats

The root object returned by `parseCopsAndCrims`.

```ts
interface CopsAndCrimsStats {
  readonly coins: number;
  readonly score: number;
  readonly level: number;
  readonly kills: number;
  readonly killsNew: number;
  readonly criminalKills: number;
  readonly copKills: number;
  readonly assists: number;
  readonly headshotKills: number;
  readonly grenadeKills: number;
  readonly grenadeKillsAlt: number;
  readonly monthlyKillsA: number;
  readonly monthlyKillsB: number;
  readonly weeklyKillsA: number;
  readonly weeklyKillsB: number;
  readonly deaths: number;
  readonly wins: number;
  readonly roundWins: number;
  readonly gamePlays: number;
  readonly bombsPlanted: number;
  readonly bombsDefused: number;
  readonly shotsFired: number;
  readonly shoutTotal: number;
  readonly lastTourneyAd: number;
  readonly activeEmblem: string;
  readonly activeGlyph: string;
  readonly activeScheme: string;
  readonly selectedLobbyPrefix: string;
  readonly lobbyPrefixColor: string;
  readonly showLobbyPrefix: boolean;
  readonly showKillsInPrefix: boolean;
  readonly shopSort: string;
  readonly shopSortEnableOwnedFirst: boolean;
  readonly packages: readonly string[];
  readonly claimedLevelRewards: readonly number[];
  readonly settings: CopsAndCrimsSettings;
  readonly leaderboardSettings: CopsAndCrimsLeaderboardSettings;
  readonly privateGames: CopsAndCrimsPrivateGames;
  readonly legacyWeaponUpgrades: CopsAndCrimsLegacyWeaponUpgrades;
  readonly perks: CopsAndCrimsPerks;
  readonly upgrades: CopsAndCrimsUpgrades;
  readonly selected: CopsAndCrimsSelectedCosmetics;
  readonly mcgo: CopsAndCrimsMcgo;
  readonly datedSnapshots: CopsAndCrimsDatedSnapshots;
  readonly winsByMap: CopsAndCrimsWinsByMap;
  readonly guns: CopsAndCrimsGuns;
  readonly deathmatch: CopsAndCrimsGamemodeStats;
  readonly deathmatchParty: CopsAndCrimsGamemodeStats;
  readonly gungame: CopsAndCrimsGungameStats;
  readonly tourneyDefusalA: CopsAndCrimsTourneyStats;
  readonly tourneyDefusalB: CopsAndCrimsTourneyStats;
}
```

| Field                                 | Notes                                                            |
| ------------------------------------- | ---------------------------------------------------------------- |
| `kills` / `killsNew`                  | Raw `kills` and `killsNew`.                                      |
| `criminalKills` / `copKills`          | Raw `criminal_kills` / `cop_kills`.                              |
| `headshotKills`                       | Raw `headshot_kills`.                                            |
| `grenadeKills` / `grenadeKillsAlt`    | Raw `grenade_kills` / `grenadeKills`.                            |
| `monthlyKillsA` / `monthlyKillsB`     | Raw `monthly_kills_a` / `monthly_kills_b`.                       |
| `weeklyKillsA` / `weeklyKillsB`       | Raw `weekly_kills_a` / `weekly_kills_b`.                         |
| `wins`                                | Raw `game_wins`.                                                 |
| `roundWins`                           | Raw `round_wins`.                                                |
| `gamePlays`                           | Raw `game_plays`.                                                |
| `lastTourneyAd`                       | Raw `lastTourneyAd` numeric timestamp (not converted to `Date`). |
| `selectedLobbyPrefix`                 | Raw `selected_lobby_prefix`.                                     |
| `showLobbyPrefix`                     | Raw `show_lobby_prefix`.                                         |
| `showKillsInPrefix`                   | Raw `show_kills_in_prefix`.                                      |
| `shopSort`                            | Raw `shop_sort`.                                                 |
| `shopSortEnableOwnedFirst`            | Raw `shop_sort_enable_owned_first`.                              |
| `claimedLevelRewards`                 | Raw `claimed_level_rewards` (number entries only).               |
| `deathmatch`                          | `deathmatch` gamemode.                                           |
| `deathmatchParty`                     | `deathmatch_party` gamemode.                                     |
| `tourneyDefusalA` / `tourneyDefusalB` | `tourney_mcgo_defusal_0` / `tourney_mcgo_defusal_1`.             |

---

## Gun stat types

### CopsAndCrimsGunStats

The shared shape for most guns (`smg`, `rifle`, `carbine`, `magnum`, `shotgun`, `scopedRifle`, `autoShotgun`, `bullpup`, `handgun`).

```ts
interface CopsAndCrimsGunStats {
  readonly damageIncrease: number;
  readonly recoilReduction: number;
  readonly reloadSpeedReduction: number;
  readonly costReduction: number;
  readonly kills: number;
  readonly headshots: number;
}
```

### CopsAndCrimsPistolStats

Like `CopsAndCrimsGunStats` but without `costReduction`.

```ts
interface CopsAndCrimsPistolStats {
  readonly damageIncrease: number;
  readonly recoilReduction: number;
  readonly reloadSpeedReduction: number;
  readonly kills: number;
  readonly headshots: number;
}
```

### CopsAndCrimsSniperStats

Like `CopsAndCrimsGunStats` but without `recoilReduction`.

```ts
interface CopsAndCrimsSniperStats {
  readonly damageIncrease: number;
  readonly reloadSpeedReduction: number;
  readonly costReduction: number;
  readonly kills: number;
  readonly headshots: number;
}
```

### CopsAndCrimsKnifeStats

```ts
interface CopsAndCrimsKnifeStats {
  readonly damageIncrease: number;
  readonly attackDelay: number;
  readonly kills: number;
}
```

### CopsAndCrimsGuns

```ts
interface CopsAndCrimsGuns {
  readonly smg: CopsAndCrimsGunStats;
  readonly rifle: CopsAndCrimsGunStats;
  readonly carbine: CopsAndCrimsGunStats;
  readonly magnum: CopsAndCrimsGunStats;
  readonly shotgun: CopsAndCrimsGunStats;
  readonly sniper: CopsAndCrimsSniperStats;
  readonly scopedRifle: CopsAndCrimsGunStats;
  readonly autoShotgun: CopsAndCrimsGunStats;
  readonly bullpup: CopsAndCrimsGunStats;
  readonly handgun: CopsAndCrimsGunStats;
  readonly pistol: CopsAndCrimsPistolStats;
  readonly knife: CopsAndCrimsKnifeStats;
}
```

---

## Gamemode stat types

### CopsAndCrimsGamemodeStats

The shared shape for `deathmatch` and `deathmatchParty`, and the base of `CopsAndCrimsGungameStats`.

```ts
interface CopsAndCrimsGamemodeStats {
  readonly kills: number;
  readonly criminalKills: number;
  readonly copKills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly assists: number;
  readonly gamePlays: number;
}
```

### CopsAndCrimsGungameStats

Extends `CopsAndCrimsGamemodeStats` with gungame-only collectibles.

```ts
interface CopsAndCrimsGungameStats extends CopsAndCrimsGamemodeStats {
  readonly armorPacksCollected: number;
  readonly carePackagesCollected: number;
  readonly speedBoostsCollected: number;
  readonly fastestWin: number;
}
```

### CopsAndCrimsTourneyStats

The shape for `tourneyDefusalA` (suffix `0`) and `tourneyDefusalB` (suffix `1`), each reading `<name>_tourney_mcgo_defusal_<suffix>` raw keys.

```ts
interface CopsAndCrimsTourneyStats {
  readonly kills: number;
  readonly criminalKills: number;
  readonly copKills: number;
  readonly deaths: number;
  readonly wins: number;
  readonly assists: number;
  readonly gamePlays: number;
  readonly roundWins: number;
  readonly bombsPlanted: number;
  readonly bombsDefused: number;
  readonly grenadeKills: number;
  readonly headshotKills: number;
  readonly shotsFired: number;
}
```

---

## Maps

### CopsAndCrimsWinsByMap

Per-map win counts, each read from a `game_wins_<map>` raw key.

```ts
interface CopsAndCrimsWinsByMap {
  readonly temple: number;
  readonly carrier: number;
  readonly atomic: number;
  readonly alleyway: number;
  readonly sandstorm: number;
  readonly reserve: number;
  readonly overgrown: number;
  readonly bazaar: number;
  readonly junction: number;
  readonly derailed: number;
  readonly castle: number;
  readonly ruins: number;
  readonly riviera: number;
  readonly harbor: number;
  readonly atomicV1: number;
  readonly atomicV2: number;
  readonly melonFactory: number;
  readonly melonFactoryV2: number;
  readonly melonfactory: number;
  readonly cobblestone: number;
  readonly test: number;
}
```

| Field            | Raw key                      |
| ---------------- | ---------------------------- |
| `atomicV1`       | `game_wins_atomic v1`        |
| `atomicV2`       | `game_wins_atomic v2`        |
| `melonFactory`   | `game_wins_melon factory`    |
| `melonFactoryV2` | `game_wins_melon factory v2` |
| `melonfactory`   | `game_wins_melonfactory`     |

---

## Cosmetics and upgrades

### CopsAndCrimsSelectedCosmetics

Each field reads a `selected<Item>Dev` raw key.

```ts
interface CopsAndCrimsSelectedCosmetics {
  readonly autoShotgun: string;
  readonly bullpup: string;
  readonly carbine: string;
  readonly creeperChestplate: string;
  readonly creeperHelmet: string;
  readonly handgun: string;
  readonly knife: string;
  readonly magnum: string;
  readonly ocelotChestplate: string;
  readonly ocelotHelmet: string;
  readonly pistol: string;
  readonly rifle: string;
  readonly scopedRifle: string;
  readonly shotgun: string;
  readonly smg: string;
}
```

### CopsAndCrimsUpgrades

```ts
interface CopsAndCrimsUpgrades {
  readonly bodyArmorCost: number;
  readonly bountyHunter: number;
  readonly pocketChange: number;
  readonly strengthTraining: number;
}
```

### CopsAndCrimsLegacyWeaponUpgrades

```ts
interface CopsAndCrimsLegacyWeaponUpgrades {
  readonly ak47DamageIncrease: number;
  readonly ak47RecoilReduction: number;
  readonly ak47ReloadSpeedReduction: number;
  readonly ak47CostReduction: number;
  readonly uspDamageIncrease: number;
}
```

| Field                      | Raw key                        |
| -------------------------- | ------------------------------ |
| `ak47DamageIncrease`       | `ak_47_damage_increase`        |
| `ak47RecoilReduction`      | `ak_47_recoil_reduction`       |
| `ak47ReloadSpeedReduction` | `ak_47_reload_speed_reduction` |
| `ak47CostReduction`        | `ak_47_cost_reduction`         |
| `uspDamageIncrease`        | `usp_damage_increase`          |

---

## Settings

### CopsAndCrimsSettings

Each field reads a `setting_<name>` raw key.

```ts
interface CopsAndCrimsSettings {
  readonly animatedSmoke: boolean;
  readonly defuseTipHologram: boolean;
  readonly hints: boolean;
  readonly moneyMessages: boolean;
  readonly screenTint: boolean;
  readonly spawnArea: boolean;
  readonly soundsBodyshot: boolean;
  readonly soundsHeadshot: boolean;
  readonly soundsDefuseProgress: boolean;
}
```

### CopsAndCrimsLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface CopsAndCrimsLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

### CopsAndCrimsPrivateGames

Read from the raw `privategames` object. Each field reads an `mcgo_private_<name>` raw key.

```ts
interface CopsAndCrimsPrivateGames {
  readonly mcgoPrivateChallengeMode: boolean;
  readonly mcgoPrivateAfk: boolean;
  readonly mcgoPrivateGunUpgrades: boolean;
  readonly mcgoPrivateInfiniteAmmo: boolean;
  readonly mcgoPrivateInstakill: boolean;
  readonly mcgoPrivateMoneybags: boolean;
}
```

---

## Perks and points

### CopsAndCrimsPerks

```ts
interface CopsAndCrimsPerks {
  readonly baseCoin: CopsAndCrimsPerkBaseCoin;
}
```

### CopsAndCrimsPerkBaseCoin

Read from the raw `perk.base_coin` object.

```ts
interface CopsAndCrimsPerkBaseCoin {
  readonly kills: number;
  readonly assists: number;
  readonly allSources: number;
  readonly defusalRoundWins: number;
  readonly bombDefuses: number;
  readonly deathmatchChallenges: number;
  readonly bombPlants: number;
}
```

| Field                  | Raw key                 |
| ---------------------- | ----------------------- |
| `allSources`           | `all_sources`           |
| `defusalRoundWins`     | `defusal_round_wins`    |
| `bombDefuses`          | `bomb_defuses`          |
| `deathmatchChallenges` | `deathmatch_challenges` |
| `bombPlants`           | `bomb_plants`           |

### CopsAndCrimsMcgo

Read from the raw `mcgo` object.

```ts
interface CopsAndCrimsMcgo {
  readonly points: number;
}
```

---

## Dated snapshots

### CopsAndCrimsDatedSnapshots

Each record collects dated raw keys (matching `^<prefix>_(\d+_)?\d+_2014$`) keyed by the date suffix (the `<prefix>_` removed). Records contain only the keys present in the raw data.

```ts
interface CopsAndCrimsDatedSnapshots {
  readonly kills: Readonly<Record<string, number>>;
  readonly killsNew: Readonly<Record<string, number>>;
  readonly gamesWins: Readonly<Record<string, number>>;
}
```

| Field       | Raw key prefix |
| ----------- | -------------- |
| `kills`     | `kills`        |
| `killsNew`  | `killsNew`     |
| `gamesWins` | `games_wins`   |
