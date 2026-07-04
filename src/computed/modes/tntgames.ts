import type {
  TNTGamesStats,
  TNTGamesWizardBase,
  TNTGamesWizardsStats,
} from "@breezil/hypixel-parsers";

import { neededForNextWholeRatio, percent, ratio } from "../shared/ratio";

const WIZARD_CLASSES = [
  "ancient",
  "arcane",
  "blood",
  "fire",
  "hydro",
  "ice",
  "kinetic",
  "storm",
  "toxic",
  "wither",
] as const;

export interface TNTGamesWizardClassComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly mitigationPerDeath: number;
}

export interface TNTGamesWizardsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly kad: number;
  readonly assistRatio: number;
  readonly pointsPerWin: number;
  readonly killsPerWin: number;
  readonly classes: Readonly<Record<string, TNTGamesWizardClassComputed>>;
}

export interface TNTGamesTNTRunComputed {
  readonly wlr: number;
  readonly potionsPerWin: number;
}

export interface TNTGamesPVPRunComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly killsPerWin: number;
}

export interface TNTGamesBowSpleefComputed {
  readonly wlr: number;
  readonly tagsPerWin: number;
}

export interface TNTGamesTNTTagComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly wlr: number;
  readonly killsPerWin: number;
}

export interface TNTGamesModeWinShare {
  readonly tntRun: number;
  readonly pvpRun: number;
  readonly bowSpleef: number;
  readonly tntTag: number;
  readonly wizards: number;
}

export interface TNTGamesComputed {
  readonly tntRun: TNTGamesTNTRunComputed;
  readonly pvpRun: TNTGamesPVPRunComputed;
  readonly bowSpleef: TNTGamesBowSpleefComputed;
  readonly tntTag: TNTGamesTNTTagComputed;
  readonly wizards: TNTGamesWizardsComputed;
  readonly modeWinShare: TNTGamesModeWinShare;
}

function computeWizardClass(
  stats: TNTGamesWizardBase,
): TNTGamesWizardClassComputed {
  return {
    kdr: ratio(stats.kills, stats.deaths),
    killsForNextKdr: neededForNextWholeRatio(stats.kills, stats.deaths),
    mitigationPerDeath: ratio(stats.healing + stats.damageTaken, stats.deaths),
  };
}

function computeWizardClasses(
  wizards: TNTGamesWizardsStats,
): Readonly<Record<string, TNTGamesWizardClassComputed>> {
  const result: Record<string, TNTGamesWizardClassComputed> = {};
  for (const name of WIZARD_CLASSES) {
    result[name] = computeWizardClass(wizards[name]);
  }
  return result;
}

function computeWizards(
  wizards: TNTGamesWizardsStats,
): TNTGamesWizardsComputed {
  return {
    kdr: ratio(wizards.kills, wizards.deaths),
    killsForNextKdr: neededForNextWholeRatio(wizards.kills, wizards.deaths),
    wlr: ratio(wizards.wins, wizards.deaths),
    kad: ratio(wizards.kills + wizards.assists, wizards.deaths),
    assistRatio: ratio(wizards.assists, wizards.kills),
    pointsPerWin: ratio(wizards.points, wizards.wins),
    killsPerWin: ratio(wizards.kills, wizards.wins),
    classes: computeWizardClasses(wizards),
  };
}

export function computeTNTGames(raw: TNTGamesStats): TNTGamesComputed {
  const { tntRun, pvpRun, bowSpleef, tntTag, wizards } = raw;
  return {
    tntRun: {
      wlr: ratio(tntRun.wins, tntRun.deaths),
      potionsPerWin: ratio(
        tntRun.slownessPotions + tntRun.speedPotions,
        tntRun.wins,
      ),
    },
    pvpRun: {
      kdr: ratio(pvpRun.kills, pvpRun.deaths),
      killsForNextKdr: neededForNextWholeRatio(pvpRun.kills, pvpRun.deaths),
      wlr: ratio(pvpRun.wins, pvpRun.deaths),
      killsPerWin: ratio(pvpRun.kills, pvpRun.wins),
    },
    bowSpleef: {
      wlr: ratio(bowSpleef.wins, bowSpleef.deaths),
      tagsPerWin: ratio(bowSpleef.tags, bowSpleef.wins),
    },
    tntTag: {
      kdr: ratio(tntTag.kills, tntTag.deaths),
      killsForNextKdr: neededForNextWholeRatio(tntTag.kills, tntTag.deaths),
      wlr: ratio(tntTag.wins, tntTag.deaths),
      killsPerWin: ratio(tntTag.kills, tntTag.wins),
    },
    wizards: computeWizards(wizards),
    modeWinShare: {
      tntRun: percent(tntRun.wins, raw.wins),
      pvpRun: percent(pvpRun.wins, raw.wins),
      bowSpleef: percent(bowSpleef.wins, raw.wins),
      tntTag: percent(tntTag.wins, raw.wins),
      wizards: percent(wizards.wins, raw.wins),
    },
  };
}

