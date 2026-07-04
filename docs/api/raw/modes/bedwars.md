# BedWars

The BedWars module exposes a single parser, `parseBedWars`, which mirrors the raw `stats.Bedwars` block of the Hypixel player API field-for-field into readonly, fully-typed objects. Every value below is read straight from the raw JSON with no computation, no ratios, and no derived totals.

## parseBedWars

Parses a player's BedWars stats (`stats.Bedwars`) into a typed object. The `level` argument is passed through verbatim into the returned `level` field; it is not computed by this parser.

```ts
function parseBedWars(bw: Record<string, unknown>, level: number): BedWarsStats;
```

### Null / empty behavior

`parseBedWars` always returns a fully-populated `BedWarsStats` object; it never returns `null`. Missing fields are filled in by the safe readers used throughout the module:

- Missing or non-number values become `0`.
- Missing or non-string values become `""`.
- Boolean fields are `true` only when the raw value is exactly `true`, otherwise `false`.
- Missing nested objects are treated as empty objects, so every nested block is still present and populated with the defaults above.
- Comma-list and string-array fields become empty arrays (`[]`) when absent.
- `Date | null` fields are `null` when the raw value is absent or not a positive epoch-ms number.

The dynamic maps (`seasonal.christmas` and `halloween.pumpkinMilestone`) contain only the keys present in the raw data, so they may be empty objects when no data exists.

---

## Returned type tree

### BedWarsStats

The root object returned by `parseBedWars`.

```ts
interface BedWarsStats {
  readonly coins: number;
  readonly experience: number;
  readonly experienceNew: number;
  readonly level: number;
  readonly firstJoinSeason7: boolean;
  readonly seenBetaMenu: boolean;
  readonly understandsResourceBank: boolean;
  readonly understandsStreaks: boolean;
  readonly shopSort: string;
  readonly shopSortOwnedFirst: boolean;
  readonly quickbuyPrivacy: string;
  readonly selectedUltimate: string;
  readonly activePrestigeScheme: string;
  readonly activeStar: string;
  readonly dataVersion: number;
  readonly pianistEnabled: boolean;
  readonly votedSnowman: boolean;
  readonly votedSugarCookie2: boolean;
  readonly spookyOpenAchievements: number;
  readonly gamesPlayedLegacy: number;
  readonly lastHytaleAd: Date | null;
  readonly lastTourneyAd: Date | null;
  readonly glyphStorage: readonly string[];
  readonly sprayGlyphField: readonly string[];
  readonly sprayStorage: readonly string[];
  readonly packages: readonly string[];
  readonly chestHistory: readonly string[];
  readonly chestHistoryNew: readonly string[];
  readonly freeEventKeys: BedWarsFreeEventKeys;
  readonly activeCosmetics: BedWarsActiveCosmetics;
  readonly boxes: BedWarsBoxes;
  readonly favorites: BedWarsFavorites;
  readonly favoriteCosmetics: Readonly<Record<string, readonly string[]>>;
  readonly figurines: BedWarsFigurines;
  readonly boon: BedWarsBoon;
  readonly dreamfeast: BedWarsDreamfeast;
  readonly feastfood: BedWarsFeastfood;
  readonly halloween: BedWarsHalloween;
  readonly leaderboardSettings: BedWarsLeaderboardSettings;
  readonly seasonal: BedWarsSeasonal;
  readonly privateGameSettings: BedWarsPrivateGameSettings;
  readonly settings: BedWarsSettings;
  readonly slumber: BedWarsSlumber;
  readonly practice: BedWarsPractice;
  readonly challenges: BedWarsChallenges;
  readonly overall: BedWarsMode;
  readonly solo: BedWarsSoloMode;
  readonly doubles: BedWarsDoublesMode;
  readonly threes: BedWarsMode;
  readonly fours: BedWarsFoursMode;
  readonly fourVsFour: BedWarsFourVsFourMode;
  readonly castle: BedWarsMode;
}
```

| Field                            | Notes                                                                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coins`                          | Reads `coins`, falling back to `tokens` when `coins` is `0`/absent.                                                                                      |
| `experience`                     | Raw `Experience`.                                                                                                                                        |
| `experienceNew`                  | Raw `Experience_new`.                                                                                                                                    |
| `level`                          | Passed through from the `level` argument.                                                                                                                |
| `gamesPlayedLegacy`              | Raw `games_played_bedwars_1`.                                                                                                                            |
| `lastHytaleAd` / `lastTourneyAd` | Epoch-ms timestamps as `Date`, or `null`.                                                                                                                |
| `favoriteCosmetics`              | Map keyed by cosmetic category (dynamic raw keys under `favorites`); each value is a string array. Contains only the categories present in the raw data. |
| `overall`                        | Stats with no mode prefix.                                                                                                                               |
| `threes`                         | `four_three_` mode.                                                                                                                                      |
| `castle`                         | `castle_` mode.                                                                                                                                          |

---

## Per-mode stat types

### BedWarsMode

The shared shape for every BedWars game mode.

```ts
interface BedWarsMode {
  readonly winstreak: number;
  readonly wins: number;
  readonly losses: number;
  readonly gamesPlayed: number;
  readonly beds: BedWarsBeds;
  readonly resources: BedWarsResources;
  readonly kills: BedWarsCombatBreakdown;
  readonly finals: BedWarsCombatBreakdown;
}
```

### BedWarsTourneyMode

Extends `BedWarsMode` with a second winstreak field used by tournament variants.

```ts
interface BedWarsTourneyMode extends BedWarsMode {
  readonly winstreak2: number;
}
```

### BedWarsBeds

```ts
interface BedWarsBeds {
  readonly broken: number;
  readonly lost: number;
}
```

### BedWarsResources

```ts
interface BedWarsResources {
  readonly total: number;
  readonly iron: number;
  readonly gold: number;
  readonly diamond: number;
  readonly emerald: number;
  readonly bed: number;
  readonly wrappedPresent: number;
  readonly itemsPurchased: number;
  readonly itemsPurchasedLegacy: number;
  readonly permanentItemsPurchased: number;
  readonly permanentItemsPurchasedLegacy: number;
}
```

### BedWarsKillsDeaths

```ts
interface BedWarsKillsDeaths {
  readonly kills: number;
  readonly deaths: number;
}
```

### BedWarsCombatBreakdown

A record of `BedWarsKillsDeaths` keyed by damage type. Used for both the `kills` and `finals` fields of `BedWarsMode`.

```ts
type BedWarsCombatBreakdown = Readonly<
  Record<keyof typeof DAMAGE_TYPES, BedWarsKillsDeaths>
>;
```

Keys: `total`, `custom`, `drowning`, `entityAttack`, `entityExplosion`, `fall`, `fire`, `fireTick`, `magic`, `projectile`, `suffocation`, `void`, `lava`, `contact`, `thorns`.

---

## Mode variants

Each variant type intersects `BedWarsMode` with a set of named sub-modes. Sub-modes whose raw key prefix begins with `tourney` are typed as `BedWarsTourneyMode`; all others are typed as `BedWarsMode`.

### BedWarsSoloMode

```ts
type BedWarsSoloMode = BedWarsMode & BedWarsVariantModes<typeof SOLO_VARIANTS>;
```

Variant keys (all `BedWarsMode`): `oneBlock`, `rush`, `ultimate`.

### BedWarsDoublesMode

```ts
type BedWarsDoublesMode = BedWarsMode &
  BedWarsVariantModes<typeof DOUBLES_VARIANTS>;
```

Variant keys: `tourneyOne` (`BedWarsTourneyMode`), `tourneyZero` (`BedWarsTourneyMode`), `armed`, `lucky`, `rush`, `swap`, `totallyNormal`, `ultimate`, `underworld`, `voidless` (all `BedWarsMode`).

### BedWarsFoursMode

```ts
type BedWarsFoursMode = BedWarsMode &
  BedWarsVariantModes<typeof FOURS_VARIANTS>;
```

Variant keys: `tourneyOne` (`BedWarsTourneyMode`), `tourneyZero` (`BedWarsTourneyMode`), `armed`, `lucky`, `rush`, `swap`, `ultimate`, `underworld`, `voidless` (all `BedWarsMode`).

### BedWarsFourVsFourMode

```ts
type BedWarsFourVsFourMode = BedWarsMode &
  BedWarsVariantModes<typeof FOUR_VS_FOUR_VARIANTS>;
```

Variant keys: `tourney` (`BedWarsTourneyMode`).

---

## Cosmetics, favorites, and figurines

### BedWarsActiveCosmetics

```ts
interface BedWarsActiveCosmetics {
  readonly bedDestroy: string;
  readonly deathCry: string;
  readonly glyph: string;
  readonly islandTopper: string;
  readonly killEffect: string;
  readonly killMessages: string;
  readonly npcSkin: string;
  readonly projectileTrail: string;
  readonly sprays: string;
  readonly victoryDance: string;
  readonly woodType: string;
}
```

### BedWarsFavorites

```ts
interface BedWarsFavorites {
  readonly hotbarSlots: readonly string[];
  readonly shopSlots: readonly string[];
  readonly shopSlotsSecondary: readonly string[];
}
```

### BedWarsFigurines

```ts
interface BedWarsFigurines {
  readonly active: string;
  readonly featuredCommon: readonly string[];
  readonly featuredLegendary: readonly string[];
  readonly featuredRare: readonly string[];
}
```

---

## Boxes and event keys

### BedWarsBoxes

A record of counts keyed by box type.

```ts
type BedWarsBoxes = Readonly<Record<keyof typeof BEDWARS_BOXES, number>>;
```

Keys: `openedChests`, `openedCommons`, `openedEpics`, `openedLegendaries`, `openedRares`, `box`, `commons`, `epics`, `legendaries`, `rares`, `total`, `christmas`, `easter`, `golden`, `halloween`, `lunar`.

### BedWarsFreeEventKeys

A record of booleans keyed by free-event-key identifier.

```ts
type BedWarsFreeEventKeys = Readonly<
  Record<keyof typeof BEDWARS_FREE_EVENT_KEYS, boolean>
>;
```

Keys: `christmasBoxes2017`, `christmasBoxes2018`, `christmasBoxes2019`, `christmasBoxes2020`, `christmasBoxes2021`, `christmasBoxes2022`, `christmasBoxes2023`, `easterBoxes2018`, `easterBoxes2019`, `easterBoxes2020`, `easterBoxes2021`, `easterBoxes2022`, `easterBoxes2023`, `halloweenBoxes2017`, `halloweenBoxes2018`, `halloweenBoxes2019`, `halloweenBoxes2020`, `halloweenBoxes2021`, `halloweenBoxes2022`, `halloweenBoxes2023`, `lunarBoxes2018`, `lunarBoxes2019`, `lunarBoxes2020`.

---

## Settings

### BedWarsPrivateGameSettings

Read from the raw `privategames` object.

```ts
interface BedWarsPrivateGameSettings {
  readonly bedInstaBreak: boolean;
  readonly disableBlockProtection: boolean;
  readonly eventTime: string;
  readonly healthBuff: string;
  readonly lowGravity: boolean;
  readonly maxTeamUpgrades: boolean;
  readonly noDiamonds: boolean;
  readonly noEmeralds: boolean;
  readonly oneHitOneKill: boolean;
  readonly respawnTime: string;
  readonly speed: string;
}
```

### BedWarsSettings

Read from the raw `settings` object.

```ts
interface BedWarsSettings {
  readonly deposit: string;
  readonly slumberItemNotification: string;
  readonly slumberWalletFull: boolean;
  readonly trapRemoval: boolean;
}
```

### BedWarsLeaderboardSettings

Read from the raw `leaderboardSettings` object.

```ts
interface BedWarsLeaderboardSettings {
  readonly mode: string;
  readonly resetType: string;
}
```

---

## Practice

### BedWarsPractice

Read from the raw `practice` object.

```ts
interface BedWarsPractice {
  readonly selected: string;
  readonly bridging: BedWarsPracticeBridging;
  readonly fireballJumping: BedWarsPracticeMode;
  readonly mlg: BedWarsPracticeMode;
  readonly pearlClutching: BedWarsPracticeMode;
}
```

### BedWarsPracticeMode

```ts
interface BedWarsPracticeMode {
  readonly blocksPlaced: number;
  readonly successfulAttempts: number;
  readonly failedAttempts: number;
}
```

### BedWarsPracticeBridging

Extends `BedWarsPracticeMode` with per-distance bridging records.

```ts
interface BedWarsPracticeBridging extends BedWarsPracticeMode {
  readonly records: BedWarsPracticeBridgingRecords;
}
```

### BedWarsPracticeBridgingRecords

A record keyed by bridging distance.

```ts
type BedWarsPracticeBridgingRecords = Readonly<
  Record<keyof typeof PRACTICE_DISTANCES, BedWarsPracticeBridgingDistance>
>;
```

Keys: `blocks30`, `blocks50`, `blocks100`.

### BedWarsPracticeBridgingDistance

A record keyed by bridging elevation.

```ts
type BedWarsPracticeBridgingDistance = Readonly<
  Record<keyof typeof PRACTICE_ELEVATIONS, BedWarsPracticeBridgingElevation>
>;
```

Keys: `none`, `slight`, `staircase`.

### BedWarsPracticeBridgingElevation

```ts
interface BedWarsPracticeBridgingElevation {
  readonly diagonal: number;
  readonly straight: number;
}
```

---

## Challenges

### BedWarsChallenges

An intersection of summary counts with a per-challenge record.

```ts
type BedWarsChallenges = {
  readonly uniqueChallengesCompleted: number;
  readonly selectedChallengeType: string;
  readonly totalChallengesCompleted: number;
} & Readonly<Record<keyof typeof CHALLENGE_NAMES, BedWarsChallenge>>;
```

Per-challenge keys: `archerOnly`, `assassin`, `cantTouchThis`, `cappedResources`, `collector`, `defuser`, `delayedHitting`, `hotbar`, `invisibleShop`, `knockbackStickOnly`, `masterAssassin`, `miningFatigue`, `noHealing`, `noHitting`, `noShift`, `noSprint`, `noSwords`, `noTeamUpgrades`, `noUtilities`, `patriot`, `protectThePresident`, `resetArmor`, `selfish`, `slowGenerator`, `sponge`, `stamina`, `stopLight`, `toxicRain`, `weightedItems`, `woodworker`.

### BedWarsChallenge

```ts
interface BedWarsChallenge {
  readonly bestTime: number;
  readonly timesCompleted: number;
}
```

---

## Slumber

### BedWarsSlumber

Read from the raw `slumber` object.

```ts
interface BedWarsSlumber {
  readonly bagType: string;
  readonly boonMultiplier: number;
  readonly currentCosmeticSorting: string;
  readonly doublers: number;
  readonly tickets: number;
  readonly ticketsGivenToDoorman: number;
  readonly ticketsRequirementMet: boolean;
  readonly totalTicketsEarned: number;
  readonly walletFullWarning: boolean;
  readonly currentPhase: number;
  readonly phaseThreeCompletedQuests: number;
  readonly fredgie: BedWarsSlumberFredgie;
  readonly minion: BedWarsSlumberMinion;
  readonly sandman: BedWarsSlumberSandman;
  readonly rooms: BedWarsSlumberRooms;
  readonly quest: BedWarsSlumberQuest;
}
```

### BedWarsSlumberFredgie

```ts
interface BedWarsSlumberFredgie {
  readonly dialogueIndex: number;
  readonly shouldUpdateIndex: boolean;
}
```

### BedWarsSlumberMinion

```ts
type BedWarsSlumberMinion = Readonly<
  Record<keyof typeof SLUMBER_MINION, number>
>;
```

Keys: `enderDust`, `enderDustCollected`, `games`, `tickets`, `ticketsCollected`.

### BedWarsSlumberSandman

```ts
type BedWarsSlumberSandman = Readonly<
  Record<keyof typeof SLUMBER_SANDMAN, number>
>;
```

Keys: `expMultiplier`, `ticketMultiplier`.

### BedWarsSlumberRooms

```ts
type BedWarsSlumberRooms = Readonly<
  Record<keyof typeof SLUMBER_ROOMS, boolean>
>;
```

Keys: `ownersOffice`, `room1`, `room2`, `room3`, `room4`, `room5`, `room6`, `room7`, `room8`, `room9`, `room10`, `room11`, `room12`, `roomArcade`, `roomBlitz`, `roomConcert`, `roomExecutives`, `roomGarage`, `roomHammer`, `roomHousing`, `roomInspector`, `roomIntricate`, `roomLimbo`, `roomMoon`, `roomOasis`, `roomPyramid`, `roomQuiz`, `roomRooftop`, `roomSkyblock`.

### BedWarsSlumberQuest

```ts
interface BedWarsSlumberQuest {
  readonly completed: BedWarsSlumberNpcFlags;
  readonly started: BedWarsSlumberNpcFlags;
  readonly lastCompleted: BedWarsSlumberNpcCounts;
  readonly lastStarted: BedWarsSlumberNpcCounts;
  readonly lastTraded: number;
  readonly npcTalk: BedWarsSlumberQuestNpcTalk;
  readonly objective: BedWarsSlumberQuestObjectives;
  readonly item: BedWarsSlumberQuestItems;
  readonly gamblerGeorge: BedWarsSlumberGamblerGeorge;
}
```

### BedWarsSlumberGamblerGeorge

```ts
interface BedWarsSlumberGamblerGeorge {
  readonly betAmount: number;
  readonly gambleGamesWon: number;
  readonly lostBet: boolean;
  readonly lostBetTime: number;
  readonly shouldReward: boolean;
  readonly wonLastGame: boolean;
}
```

### BedWarsSlumberNpcFlags

A record of booleans keyed by quest NPC. Used for both `completed` and `started`.

```ts
type BedWarsSlumberNpcFlags = Readonly<
  Record<keyof typeof SLUMBER_QUEST_NPCS, boolean>
>;
```

### BedWarsSlumberNpcCounts

A record of counts keyed by quest NPC. Used for both `lastCompleted` and `lastStarted`. Shares the same key set as `BedWarsSlumberNpcFlags`.

```ts
type BedWarsSlumberNpcCounts = Readonly<
  Record<keyof typeof SLUMBER_QUEST_NPCS, number>
>;
```

Quest NPC keys (shared by `BedWarsSlumberNpcFlags` and `BedWarsSlumberNpcCounts`): `dreamfeastAppetizers`, `arcadePlayer`, `billStarr`, `blacksmith`, `blacksmithApprentice`, `bucky`, `combatArtistSally`, `donEspresso`, `electricianRussel`, `executives`, `gamblerGeorge`, `generalDaku`, `gizzyMoonpowder`, `hammer`, `hammerPartTwo`, `hermes`, `inspector`, `jeremyJagger`, `jetsMcturbo`, `jimmyBimmy`, `johnIndigosHammer`, `johnPireso`, `kingFlut`, `ladySaichi`, `laundry`, `laundryGal`, `lesterBrody`, `masterMeyer`, `meetTheSandman`, `oasis`, `peter`, `quizShowHost`, `receptionStart`, `skyblockPlayer`, `spaceman`, `theRatman`, `wally`, `phaseFourAscensionQ1`, `phaseFourAscensionQ2`, `phaseFourAscensionQ3`, `phaseFourAscensionQ4`, `phaseFourAscensionQ5`, `phaseFourAscensionWalletQ`, `phaseThreeAsc`, `phaseTwoAsc`, `staffWalletUpgrade`.

### BedWarsSlumberQuestNpcTalk

A record of booleans keyed by NPC talk identifier.

```ts
type BedWarsSlumberQuestNpcTalk = Readonly<
  Record<keyof typeof SLUMBER_QUEST_NPC_TALK, boolean>
>;
```

Keys: `aidenAllpillowNpc`, `arcadePlayerNpc`, `billStarrNpc`, `bimmyNpc`, `blackSmithNpc`, `blackSmithRobertoNpc`, `ceoNpc`, `chefBuckyNpc`, `chefGarryJamseyNpc`, `combatArtistSallyNpc`, `donEspressoNpc`, `doorManNpc`, `electricianRusselNpc`, `fredericFerntonNpc`, `gamblerGeorgeNpc`, `generalDakuNpc`, `gizzyMoonpowderNpc`, `hammerNpc`, `hammerPartTwoNpc`, `hermesNpc`, `hostessKatrinaNpc`, `hotelReceptionistNpc`, `inspectorMyaSterlingNpc`, `jeremyJaggerNpc`, `jetsMcTurboNpc`, `jimmyNpc`, `johnIndigosNpc`, `johnIndigosPhaseThreeNpc`, `johnIndigosPhaseTwoNpc`, `kingFlutNpc`, `ladySaichiNpc`, `laundryGalNpc`, `laundryGuyNpc`, `lesterBrodyNpc`, `masterMeyerNpc`, `oasisSpiritNpc`, `peterNpc`, `quizShowHostNpc`, `ratmanNpc`, `sandmanNpc`, `skyBlockPlayerNpc`, `slumberVillagerNpc`, `spaceManNpc`, `ticketMachineNpc`, `tranceNpc`, `wallyNpc`.

### BedWarsSlumberQuestObjectives

A record of booleans keyed by quest objective identifier.

```ts
type BedWarsSlumberQuestObjectives = Readonly<
  Record<keyof typeof SLUMBER_QUEST_OBJECTIVES, boolean>
>;
```

Keys: `arcadeIron`, `arcadeIronRepeat`, `arcadeQuarters`, `arcadeQuartersRepeat`, `bakeAFeastfood`, `billStarrBlitz`, `blacksmithAmulet`, `blacksmithApprenticeCoins`, `blacksmithApprenticeCoinsRepeat`, `blacksmithApprenticeForgeCoal`, `blacksmithApprenticeForgeCoalRepeat`, `blacksmithApprenticeIron`, `blacksmithApprenticeIronRepeat`, `blacksmithGold`, `blacksmithGoldenTicket`, `blacksmithIronBars`, `blacksmithMold`, `blacksmithWater`, `buckyEnderDust`, `buckyEnderDustRepeat`, `buckyFragments`, `buckyFragmentsRepeat`, `buckySkyTeaLeaves`, `buckySkyTeaLeavesRepeat`, `buckySouls`, `buckySpiceRepeat`, `checkersCoal`, `checkersSheets`, `chessTickets`, `chessTokensOfFerocity`, `chessWoolCables`, `combatArtistSally`, `combatArtistSallyRepeat`, `combatArtistSallySouls`, `donEspressoDiamond`, `donEspressoGold`, `electricianRussel`, `electricianRusselRepeat`, `executivesMeetingNumbers`, `gamblerGeorgeWin`, `generalDakuTea`, `generalDakuTeaRepeat`, `gizzyMoonpowder`, `gizzyMoonpowderRepeat`, `hammerCoins`, `hammerIron`, `hammerPartTwoSilverBlade`, `hermesMysteryBoxes`, `inspectorAirFreshener`, `inspectorClueWeapon`, `inspectorGloves`, `inspectorPhoto`, `inspectorWorkBoots`, `jaggerDiamond`, `jaggerEmerald`, `jaggerGold`, `jaggerIron`, `jaggerSpice`, `jaggerWool`, `jetsCables`, `jetsEmeralds`, `jetsGold`, `jetsHusks`, `jetsIron`, `jetsIronBars`, `jetsNetherStars`, `johnIndigosHammer`, `johnPiresoMap`, `kingFlutAmulet`, `kingFlutDiamond`, `kingFlutPillow`, `ladySaichiMattress`, `ladySaichiSheets`, `laundryGalBottles`, `laundryGalBottlesRepeat`, `laundryGalPillows`, `laundryManagerSheets`, `laundryManagerSheetsRepeat`, `lesterBrody`, `lesterBrodyRepeat`, `masterMeyer`, `masterMeyerRepeat`, `meetTheSandman`, `oasisHusks`, `oasisHusksRepeat`, `oasisSouls`, `peterEscape`, `phaseFourAscensionO1`, `phaseFourAscensionO2`, `phaseFourAscensionO3`, `phaseFourAscensionO4`, `phaseFourAscensionO5`, `phaseFourAscensionWalletO`, `phaseThreeRecp`, `phaseTwoRecp`, `ratmanBedsheets`, `ratmanForgeCoal`, `ratmanIronBars`, `ratmanPillow`, `ratmanSparkPlug`, `receptionistIntroduction`, `skyblockPlayerDust`, `skyblockPlayerLeaves`, `spacemanNetherStars`, `spacemanShopSpice`, `unlockAnUpgrade`, `wallyBedSheets`, `wallyEnderDust`, `wallyNetherStars`.

### BedWarsSlumberQuestItems

A record of counts keyed by slumber quest item identifier.

```ts
type BedWarsSlumberQuestItems = Readonly<
  Record<keyof typeof SLUMBER_QUEST_ITEMS, number>
>;
```

Keys: `airFreshener`, `amulet`, `bedSheets`, `blitzStar`, `blockOfMegaWallsObsidian`, `boots`, `cable`, `chaliceOfSand`, `cleanedUpMurderKnife`, `comfyPillow`, `diamondEssence`, `diamondFragment`, `discardedKartWheel`, `dwarvenMithril`, `emeraldEssence`, `emeraldShard`, `enchantedHammer`, `enderDust`, `fadedBlitzStar`, `forgeCoal`, `gloves`, `glowingSandPaper`, `goldBar`, `goldEssence`, `goldenTicket`, `imperialLeather`, `indigosMap`, `ironEssence`, `ironNugget`, `limboDust`, `megaWallsObsidian`, `missingAmulet`, `moonStoneNugget`, `murderWeapon`, `netherStar`, `nightmareNoodles`, `oasisWater`, `perfume`, `playerSoul`, `potionBottle`, `proofOfSuccess`, `ratmanMask`, `shopSpice`, `silverBladeReplay`, `silverCoins`, `snoringNachos`, `soul`, `soulSalsa`, `spareKartWheel`, `sparkPlug`, `ticketTart`, `timewornMysteryBox`, `tokenOfFerocity`, `trustyRope`, `unusedBombMaterials`, `victimPhoto`, `voidHusk`, `weaponMold`.

---

## Dreamfeast, boon, and feastfood

### BedWarsBoon

A record of booleans keyed by boon identifier.

```ts
type BedWarsBoon = Readonly<Record<keyof typeof BEDWARS_BOON, boolean>>;
```

Keys: `appetizer`, `firstCourse`, `oasis`, `slumber`.

### BedWarsDreamfeast

A record of booleans keyed by dreamfeast unlock identifier.

```ts
type BedWarsDreamfeast = Readonly<
  Record<keyof typeof BEDWARS_DREAMFEAST, boolean>
>;
```

Keys: `appetizerBoon`, `challengeWoolWarrior`, `dreamOfAnimals`, `dreamOfPrestigeStars`, `firstCourseBoon`, `firstDreamOfWoodSkins`, `firstNightmareOfChallenges`, `killmessagesGlorious`, `npcskinCluckStack`, `woodSkinAcaciaLog`, `woodSkinBirchLog`, `woodSkinDarkOakLog`, `woodSkinJungleLog`, `woodSkinOakLog`, `woodSkinSpruceLog`.

### BedWarsFeastfood

```ts
interface BedWarsFeastfood {
  readonly cooked: Readonly<
    Record<keyof typeof BEDWARS_FEASTFOOD_COOKED, boolean>
  >;
}
```

`cooked` keys: `nightmareNoodles`, `snoringNachos`, `soulSalsa`, `ticketTart`.

---

## Halloween

### BedWarsHalloween

Read from the raw `halloween` object.

```ts
interface BedWarsHalloween {
  readonly talkedToPatches: boolean;
  readonly pumpkinMilestone: BedWarsHalloweenPumpkinMilestone;
}
```

### BedWarsHalloweenPumpkinMilestone

`counts` collects every numeric field found directly on the raw `pumpkin_milestone` object; `rewards` is keyed by year (dynamic raw keys). Both records contain only the keys present in the raw data.

```ts
interface BedWarsHalloweenPumpkinMilestone {
  readonly counts: Readonly<Record<string, number>>;
  readonly rewards: Readonly<Record<string, BedWarsHalloweenPumpkinRewardTier>>;
}
```

### BedWarsHalloweenPumpkinRewardTier

A record of booleans keyed by reward tier.

```ts
type BedWarsHalloweenPumpkinRewardTier = Readonly<
  Record<keyof typeof HALLOWEEN_PUMPKIN_REWARD_TIERS, boolean>
>;
```

Keys: `i`, `ii`, `iii`, `iv`, `v`.

---

## Seasonal (Christmas)

### BedWarsSeasonal

`christmas` is keyed by year (dynamic raw keys) and contains only the years present in the raw data.

```ts
interface BedWarsSeasonal {
  readonly christmas: Readonly<Record<string, BedWarsSeasonalChristmasYear>>;
}
```

### BedWarsSeasonalChristmasYear

```ts
interface BedWarsSeasonalChristmasYear {
  readonly talkedToNpc: boolean;
  readonly candyCaneChallenger: BedWarsSeasonalChristmasListQuest;
  readonly festiveFrenzy: BedWarsSeasonalChristmasProgressQuest;
  readonly giftExchange: BedWarsSeasonalChristmasProgressQuest;
  readonly happyHolidays: BedWarsSeasonalChristmasProgressQuest;
  readonly holidayShopping: BedWarsSeasonalChristmasProgressQuest;
  readonly megagift: BedWarsSeasonalChristmasMegagift;
  readonly seasonOfGiving: BedWarsSeasonalChristmasProgressQuest;
  readonly sneakySanta: BedWarsSeasonalChristmasProgressQuest;
  readonly twoWeekPhase: BedWarsSeasonalChristmasProgressQuest;
  readonly winterVacation: BedWarsSeasonalChristmasListQuest;
}
```

### BedWarsSeasonalChristmasProgressQuest

```ts
interface BedWarsSeasonalChristmasProgressQuest {
  readonly claimed: number;
  readonly progression: number;
}
```

### BedWarsSeasonalChristmasListQuest

```ts
interface BedWarsSeasonalChristmasListQuest {
  readonly claimed: number;
  readonly progression: readonly string[];
}
```

### BedWarsSeasonalChristmasMegagift

```ts
interface BedWarsSeasonalChristmasMegagift {
  readonly received: number;
  readonly sent: number;
}
```
