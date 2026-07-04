import type {
  SmashHeroesHeroStats,
  SmashHeroesModeStats,
  SmashHeroesStats,
} from "@breezil/hypixel-parsers";

import { argMax } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
  round2,
} from "../shared/ratio";

export interface SmashHeroesModeComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly gameShare: number;
}

export interface SmashHeroesHeroComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
}

export interface SmashHeroesModesComputed {
  readonly normal: SmashHeroesModeComputed;
  readonly twoVsTwo: SmashHeroesModeComputed;
  readonly teams: SmashHeroesModeComputed;
}

export interface SmashHeroesComputed {
  readonly kdr: number;
  readonly wlr: number;
  readonly winRate: number;
  readonly killsForNextKdr: number;
  readonly winsForNextWlr: number;
  readonly killsPerGame: number;
  readonly smashRatio: number;
  readonly damagePerGame: number;
  readonly damagePerKill: number;
  readonly quitRate: number;
  readonly assistsPerGame: number;
  readonly averageHeroLevel: number;
  readonly totalPrestige: number;
  readonly favoriteHero: string;
  readonly modes: SmashHeroesModesComputed;
  readonly heroes: Readonly<Record<string, SmashHeroesHeroComputed>>;
}

function computeMode(
  mode: SmashHeroesModeStats,
  totalGames: number,
): SmashHeroesModeComputed {
  return {
    kdr: ratio(mode.kills, mode.deaths),
    wlr: ratio(mode.wins, mode.losses),
    killsForNextKdr: neededForNextWholeRatio(mode.kills, mode.deaths),
    winsForNextWlr: neededForNextWholeRatio(mode.wins, mode.losses),
    gameShare: percent(mode.games, totalGames),
  };
}

function computeHeroes(
  heroes: Readonly<Record<string, SmashHeroesHeroStats>>,
): Readonly<Record<string, SmashHeroesHeroComputed>> {
  const result: Record<string, SmashHeroesHeroComputed> = {};
  for (const [name, hero] of Object.entries(heroes)) {
    result[name] = {
      kdr: ratio(hero.overall.kills, hero.overall.deaths),
      wlr: ratio(hero.overall.wins, hero.overall.losses),
      killsForNextKdr: neededForNextWholeRatio(
        hero.overall.kills,
        hero.overall.deaths,
      ),
      winsForNextWlr: neededForNextWholeRatio(
        hero.overall.wins,
        hero.overall.losses,
      ),
    };
  }
  return result;
}

export function computeSmashHeroes(raw: SmashHeroesStats): SmashHeroesComputed {
  const heroes = Object.values(raw.heroes);
  const heroLevelTotal = heroes.reduce((sum, hero) => sum + hero.lastLevel, 0);
  return {
    kdr: ratio(raw.kills, raw.deaths),
    wlr: ratio(raw.wins, raw.losses),
    winRate: ratio(raw.wins, raw.games),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    winsForNextWlr: neededForNextWholeRatio(raw.wins, raw.losses),
    killsPerGame: perGame(raw.kills, raw.games),
    smashRatio: ratio(raw.smashed, raw.smasher),
    damagePerGame: perGame(raw.damageDealt, raw.games),
    damagePerKill: ratio(raw.damageDealt, raw.kills),
    quitRate: perGame(raw.quits, raw.games),
    assistsPerGame: perGame(raw.assists, raw.games),
    averageHeroLevel:
      heroes.length === 0 ? 0 : round2(heroLevelTotal / heroes.length),
    totalPrestige: heroes.reduce((sum, hero) => sum + hero.prestige, 0),
    favoriteHero:
      argMax(
        Object.entries(raw.heroes).map(
          ([name, hero]) => [name, hero.overall.games] as const,
        ),
        0,
      ) ?? "",
    modes: {
      normal: computeMode(raw.normal, raw.games),
      twoVsTwo: computeMode(raw.twoVsTwo, raw.games),
      teams: computeMode(raw.teams, raw.games),
    },
    heroes: computeHeroes(raw.heroes),
  };
}

