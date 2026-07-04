import type { MurderMysteryStats } from "@breezil/hypixel-parsers";

import { argMax } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface MurderMysteryComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly winRate: number;
  readonly killsPerGame: number;
  readonly knifeKillShare: number;
  readonly bowKillShare: number;
  readonly thrownKnifeKillShare: number;
  readonly trapKillShare: number;
  readonly murdererKillShare: number;
  readonly avgTimeSurvivedPerGame: number;
  readonly detectiveWinShare: number;
  readonly murdererWinShare: number;
  readonly survivorWinShare: number;
  readonly legendaryChestRate: number;
  readonly coinsPerGame: number;
  readonly heroRate: number;
  readonly mostPlayedMap: string | null;
  readonly mostPlayedGamemode: string | null;
}

function gamesByKey(
  source: Readonly<Record<string, { readonly games: number }>>,
): readonly (readonly [string, number])[] {
  return Object.entries(source).map(([name, stats]) => [name, stats.games]);
}

export function computeMurderMystery(
  raw: MurderMysteryStats,
): MurderMysteryComputed {
  return {
    kdr: ratio(raw.kills, raw.deaths),
    killsForNextKdr: neededForNextWholeRatio(raw.kills, raw.deaths),
    winRate: ratio(raw.wins, raw.games),
    killsPerGame: perGame(raw.kills, raw.games),
    knifeKillShare: percent(raw.knifeKills, raw.kills),
    bowKillShare: percent(raw.bowKills, raw.kills),
    thrownKnifeKillShare: percent(raw.thrownKnifeKills, raw.kills),
    trapKillShare: percent(raw.trapKills, raw.kills),
    murdererKillShare: percent(raw.killsAsMurderer, raw.kills),
    avgTimeSurvivedPerGame: perGame(raw.totalTimeSurvivedSeconds, raw.games),
    detectiveWinShare: percent(raw.detectiveWins, raw.wins),
    murdererWinShare: percent(raw.murdererWins, raw.wins),
    survivorWinShare: percent(raw.survivorWins, raw.wins),
    legendaryChestRate: ratio(raw.openedLegendaries, raw.openedChests),
    coinsPerGame: perGame(raw.coinsPickedUp, raw.games),
    heroRate: perGame(raw.wasHero, raw.games),
    mostPlayedMap: argMax(gamesByKey(raw.maps), 0),
    mostPlayedGamemode: argMax(gamesByKey(raw.gamemodes), 0),
  };
}

