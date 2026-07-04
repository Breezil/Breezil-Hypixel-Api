import type {
  Guild,
  HypixelPlayer,
  HypixelPlayerStats,
  SkyBlockMember,
  SkyBlockProfile,
  SkyBlockStats,
  BedWarsStats,
  SkyWarsStats,
  DuelsStats,
  ArcadeStats,
  BuildBattleStats,
  MurderMysteryStats,
  TNTGamesStats,
  PitStats,
  MegaWallsStats,
  BlitzStats,
  UHCStats,
  SmashHeroesStats,
  CopsAndCrimsStats,
  PaintballStats,
  QuakecraftStats,
  VampireZStats,
  WallsStats,
  WarlordsStats,
  TurboKartRacersStats,
  ArenaBrawlStats,
  WoolGamesStats,
  SpeedUHCStats,
  SkyClashStats,
  TrueCombatStats,
  LegacyStats,
  MainLobbyStats,
  HousingStats,
} from "@breezil/hypixel-parsers";

import { computeSkyBlockMember, type SkyBlockMemberComputed } from "./skyblock";
import { computeTrueCombat, type TrueCombatComputed } from "./modes/truecombat";
import { computeArenaBrawl, type ArenaBrawlComputed } from "./modes/arenabrawl";
import { computeQuakecraft, type QuakecraftComputed } from "./modes/quakecraft";
import { computeMainLobby, type MainLobbyComputed } from "./modes/mainlobby";
import { computeMegaWalls, type MegaWallsComputed } from "./modes/megawalls";
import { computePaintball, type PaintballComputed } from "./modes/paintball";
import { computeWoolGames, type WoolGamesComputed } from "./modes/woolgames";
import { computeVampireZ, type VampireZComputed } from "./modes/vampirez";
import { computeWarlords, type WarlordsComputed } from "./modes/warlords";
import { computeTNTGames, type TNTGamesComputed } from "./modes/tntgames";
import { computeSpeedUHC, type SpeedUHCComputed } from "./modes/speeduhc";
import { computeSkyClash, type SkyClashComputed } from "./modes/skyclash";
import { computeBedWars, type BedWarsComputed } from "./modes/bedwars";
import { computeSkyWars, type SkyWarsComputed } from "./modes/skywars";
import { computeHousing, type HousingComputed } from "./modes/housing";
import { computeLegacy, type LegacyComputed } from "./modes/legacy";
import { computeArcade, type ArcadeComputed } from "./modes/arcade";
import { computeDuels, type DuelsComputed } from "./modes/duels";
import { computeBlitz, type BlitzComputed } from "./modes/blitz";
import { computeWalls, type WallsComputed } from "./modes/walls";
import { computePlayer, type PlayerComputed } from "./player";
import { computePit, type PitComputed } from "./modes/pit";
import { computeGuild, type GuildComputed } from "./guild";
import { computeUHC, type UHCComputed } from "./modes/uhc";
import {
  computeTurboKartRacers,
  type TurboKartRacersComputed,
} from "./modes/turbokartracers";
import {
  computeMurderMystery,
  type MurderMysteryComputed,
} from "./modes/murdermystery";
import {
  computeBuildBattle,
  type BuildBattleComputed,
} from "./modes/buildbattle";
import {
  computeSmashHeroes,
  type SmashHeroesComputed,
} from "./modes/smashheroes";
import {
  computeCopsAndCrims,
  type CopsAndCrimsComputed,
} from "./modes/copsandcrims";

export type WithComputed<T, C> = T & { readonly computed: C };

export function attach<T extends object, C>(
  raw: T,
  compute: (value: T) => C,
): WithComputed<T, C>;
export function attach<T extends object, C>(
  raw: T | null,
  compute: (value: T) => C,
): WithComputed<T, C> | null;
export function attach<T extends object, C>(
  raw: T | null,
  compute: (value: T) => C,
): WithComputed<T, C> | null {
  return raw === null ? null : { ...raw, computed: compute(raw) };
}

export function attachAll<T extends object, C>(
  items: readonly T[],
  compute: (value: T) => C,
): WithComputed<T, C>[] {
  return items.map((item) => attach(item, compute));
}

export function attachRecord<T extends object, C>(
  record: Readonly<Record<string, T>>,
  compute: (value: T) => C,
): Record<string, WithComputed<T, C>> {
  const out: Record<string, WithComputed<T, C>> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = attach(value, compute);
  }
  return out;
}

export interface EnrichedPlayerStats {
  readonly bedwars: WithComputed<BedWarsStats, BedWarsComputed> | null;
  readonly skywars: WithComputed<SkyWarsStats, SkyWarsComputed> | null;
  readonly duels: WithComputed<DuelsStats, DuelsComputed> | null;
  readonly arcade: WithComputed<ArcadeStats, ArcadeComputed> | null;
  readonly buildBattle: WithComputed<
    BuildBattleStats,
    BuildBattleComputed
  > | null;
  readonly murderMystery: WithComputed<
    MurderMysteryStats,
    MurderMysteryComputed
  > | null;
  readonly tntGames: WithComputed<TNTGamesStats, TNTGamesComputed> | null;
  readonly pit: WithComputed<PitStats, PitComputed> | null;
  readonly megaWalls: WithComputed<MegaWallsStats, MegaWallsComputed> | null;
  readonly blitz: WithComputed<BlitzStats, BlitzComputed> | null;
  readonly uhc: WithComputed<UHCStats, UHCComputed> | null;
  readonly smashHeroes: WithComputed<
    SmashHeroesStats,
    SmashHeroesComputed
  > | null;
  readonly copsAndCrims: WithComputed<
    CopsAndCrimsStats,
    CopsAndCrimsComputed
  > | null;
  readonly paintball: WithComputed<PaintballStats, PaintballComputed> | null;
  readonly quakecraft: WithComputed<QuakecraftStats, QuakecraftComputed> | null;
  readonly vampireZ: WithComputed<VampireZStats, VampireZComputed> | null;
  readonly walls: WithComputed<WallsStats, WallsComputed> | null;
  readonly warlords: WithComputed<WarlordsStats, WarlordsComputed> | null;
  readonly turboKartRacers: WithComputed<
    TurboKartRacersStats,
    TurboKartRacersComputed
  > | null;
  readonly arenaBrawl: WithComputed<ArenaBrawlStats, ArenaBrawlComputed> | null;
  readonly woolGames: WithComputed<WoolGamesStats, WoolGamesComputed> | null;
  readonly speedUHC: WithComputed<SpeedUHCStats, SpeedUHCComputed> | null;
  readonly skyClash: WithComputed<SkyClashStats, SkyClashComputed> | null;
  readonly trueCombat: WithComputed<TrueCombatStats, TrueCombatComputed> | null;
  readonly legacy: WithComputed<LegacyStats, LegacyComputed> | null;
  readonly mainLobby: WithComputed<MainLobbyStats, MainLobbyComputed> | null;
  readonly housing: WithComputed<HousingStats, HousingComputed> | null;
  readonly skyblock: SkyBlockStats | null;
}

export type EnrichedPlayer = Omit<HypixelPlayer, "stats"> & {
  readonly computed: PlayerComputed;
  readonly stats: EnrichedPlayerStats;
};

function enrichStats(stats: HypixelPlayerStats): EnrichedPlayerStats {
  return {
    bedwars: attach(stats.bedwars, computeBedWars),
    skywars: attach(stats.skywars, computeSkyWars),
    duels: attach(stats.duels, computeDuels),
    arcade: attach(stats.arcade, computeArcade),
    buildBattle: attach(stats.buildBattle, computeBuildBattle),
    murderMystery: attach(stats.murderMystery, computeMurderMystery),
    tntGames: attach(stats.tntGames, computeTNTGames),
    pit: attach(stats.pit, computePit),
    megaWalls: attach(stats.megaWalls, computeMegaWalls),
    blitz: attach(stats.blitz, computeBlitz),
    uhc: attach(stats.uhc, computeUHC),
    smashHeroes: attach(stats.smashHeroes, computeSmashHeroes),
    copsAndCrims: attach(stats.copsAndCrims, computeCopsAndCrims),
    paintball: attach(stats.paintball, computePaintball),
    quakecraft: attach(stats.quakecraft, computeQuakecraft),
    vampireZ: attach(stats.vampireZ, computeVampireZ),
    walls: attach(stats.walls, computeWalls),
    warlords: attach(stats.warlords, computeWarlords),
    turboKartRacers: attach(stats.turboKartRacers, computeTurboKartRacers),
    arenaBrawl: attach(stats.arenaBrawl, computeArenaBrawl),
    woolGames: attach(stats.woolGames, computeWoolGames),
    speedUHC: attach(stats.speedUHC, computeSpeedUHC),
    skyClash: attach(stats.skyClash, computeSkyClash),
    trueCombat: attach(stats.trueCombat, computeTrueCombat),
    legacy: attach(stats.legacy, computeLegacy),
    mainLobby: attach(stats.mainLobby, computeMainLobby),
    housing: attach(stats.housing, computeHousing),
    skyblock: stats.skyblock,
  };
}

export function enrichPlayer(player: HypixelPlayer): EnrichedPlayer {
  return {
    ...player,
    computed: computePlayer(player),
    stats: enrichStats(player.stats),
  };
}

export type EnrichedGuild = WithComputed<Guild, GuildComputed>;

export function enrichGuild(guild: Guild): EnrichedGuild {
  return attach(guild, computeGuild);
}

export type EnrichedSkyBlockMember = WithComputed<
  SkyBlockMember,
  SkyBlockMemberComputed
>;

export type EnrichedSkyBlockProfile = Omit<
  SkyBlockProfile,
  "member" | "members"
> & {
  readonly member: EnrichedSkyBlockMember | null;
  readonly members: Record<string, EnrichedSkyBlockMember>;
};

export function enrichSkyBlockProfile(
  profile: SkyBlockProfile,
): EnrichedSkyBlockProfile {
  return {
    ...profile,
    member: attach(profile.member, computeSkyBlockMember),
    members: attachRecord(profile.members, computeSkyBlockMember),
  };
}

