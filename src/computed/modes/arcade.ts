import type { ArcadeStats, ArcadeZombiesMap } from "@breezil/hypixel-parsers";

import { monthlyValue, weeklyValue } from "../shared/oscillation";
import { minPositive } from "../shared/aggregate";
import {
  neededForNextWholeRatio,
  percent,
  perGame,
  ratio,
} from "../shared/ratio";

export interface ArcadeZombiesMapTimesComputed {
  readonly fastestTime10: number;
  readonly fastestTime20: number;
  readonly fastestTime30: number;
}

export interface ArcadeZombiesComputed {
  readonly bulletAccuracy: number;
  readonly headshotRate: number;
  readonly reviveReliability: number;
  readonly killsPerRound: number;
  readonly badBlood: ArcadeZombiesMapTimesComputed;
  readonly deadEnd: ArcadeZombiesMapTimesComputed;
  readonly prison: ArcadeZombiesMapTimesComputed;
}

export interface ArcadeMiniWallsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly arrowAccuracy: number;
  readonly finalKillRate: number;
}

export interface ArcadeGalaxyWarsComputed {
  readonly kdr: number;
  readonly killsForNextKdr: number;
  readonly empireKillShare: number;
  readonly shotsPerKill: number;
  readonly monthlyKills: number;
  readonly weeklyKills: number;
}

export interface ArcadeDropperComputed {
  readonly flawlessRate: number;
  readonly failsPerGame: number;
}

export interface ArcadeHideAndSeekComputed {
  readonly totalWins: number;
  readonly hiderWinShare: number;
}

export interface ArcadeBountyHuntersComputed {
  readonly kdr: number;
  readonly bowKillShare: number;
}

export interface ArcadeThrowOutComputed {
  readonly kdr: number;
}

export interface ArcadeFarmHuntComputed {
  readonly hunterWinShare: number;
}

export interface ArcadeSoccerComputed {
  readonly goalsPerKick: number;
}

export interface ArcadePixelPartyComputed {
  readonly winRate: number;
}

export interface ArcadeDisastersComputed {
  readonly winRate: number;
}

export interface ArcadeBlockingDeadComputed {
  readonly headshotsPerKill: number;
}

export interface ArcadeComputed {
  readonly monthlyTokens: number;
  readonly weeklyTokens: number;
  readonly zombies: ArcadeZombiesComputed;
  readonly miniWalls: ArcadeMiniWallsComputed;
  readonly galaxyWars: ArcadeGalaxyWarsComputed;
  readonly dropper: ArcadeDropperComputed;
  readonly hideAndSeek: ArcadeHideAndSeekComputed;
  readonly bountyHunters: ArcadeBountyHuntersComputed;
  readonly throwOut: ArcadeThrowOutComputed;
  readonly farmHunt: ArcadeFarmHuntComputed;
  readonly soccer: ArcadeSoccerComputed;
  readonly pixelParty: ArcadePixelPartyComputed;
  readonly disasters: ArcadeDisastersComputed;
  readonly blockingDead: ArcadeBlockingDeadComputed;
}

function mapTimes(map: ArcadeZombiesMap): ArcadeZombiesMapTimesComputed {
  return {
    fastestTime10: minPositive([
      map.normal.fastestTime10,
      map.hard.fastestTime10,
      map.rip.fastestTime10,
    ]),
    fastestTime20: minPositive([
      map.normal.fastestTime20,
      map.hard.fastestTime20,
      map.rip.fastestTime20,
    ]),
    fastestTime30: minPositive([
      map.normal.fastestTime30,
      map.hard.fastestTime30,
      map.rip.fastestTime30,
    ]),
  };
}

export function computeArcade(raw: ArcadeStats): ArcadeComputed {
  const {
    zombies,
    miniWalls,
    galaxyWars,
    dropper,
    hideAndSeek,
    bountyHunters,
    throwOut,
    farmHunt,
    soccer,
    pixelParty,
    disasters,
    blockingDead,
  } = raw;
  const now = new Date();
  const hideAndSeekWins =
    hideAndSeek.hiderWins +
    hideAndSeek.seekerWins +
    hideAndSeek.propHuntHiderWins +
    hideAndSeek.propHuntSeekerWins +
    hideAndSeek.partyPooperHiderWins +
    hideAndSeek.partyPooperSeekerWins;
  return {
    monthlyTokens: monthlyValue(raw.monthlyTokensA, raw.monthlyTokensB, now),
    weeklyTokens: weeklyValue(raw.weeklyTokensA, raw.weeklyTokensB, now),
    zombies: {
      bulletAccuracy: ratio(zombies.bulletsHit, zombies.bulletsShot),
      headshotRate: ratio(zombies.headshots, zombies.bulletsHit),
      reviveReliability: ratio(
        zombies.playersRevived,
        zombies.timesKnockedDown,
      ),
      killsPerRound: ratio(zombies.zombieKills, zombies.totalRoundsSurvived),
      badBlood: mapTimes(zombies.badBlood),
      deadEnd: mapTimes(zombies.deadEnd),
      prison: mapTimes(zombies.prison),
    },
    miniWalls: {
      kdr: ratio(miniWalls.kills + miniWalls.finalKills, miniWalls.deaths),
      killsForNextKdr: neededForNextWholeRatio(
        miniWalls.kills + miniWalls.finalKills,
        miniWalls.deaths,
      ),
      arrowAccuracy: ratio(miniWalls.arrowsHit, miniWalls.arrowsShot),
      finalKillRate: ratio(
        miniWalls.finalKills,
        miniWalls.kills + miniWalls.finalKills,
      ),
    },
    galaxyWars: {
      kdr: ratio(galaxyWars.kills, galaxyWars.deaths),
      killsForNextKdr: neededForNextWholeRatio(
        galaxyWars.kills,
        galaxyWars.deaths,
      ),
      empireKillShare: percent(
        galaxyWars.empireKills,
        galaxyWars.empireKills + galaxyWars.rebelKills,
      ),
      shotsPerKill: ratio(galaxyWars.shotsFired, galaxyWars.kills),
      monthlyKills: monthlyValue(
        galaxyWars.monthlyKillsA,
        galaxyWars.monthlyKillsB,
        now,
      ),
      weeklyKills: weeklyValue(
        galaxyWars.weeklyKillsA,
        galaxyWars.weeklyKillsB,
        now,
      ),
    },
    dropper: {
      flawlessRate: ratio(dropper.flawlessGames, dropper.gamesFinished),
      failsPerGame: perGame(dropper.fails, dropper.gamesPlayed),
    },
    hideAndSeek: {
      totalWins: hideAndSeekWins,
      hiderWinShare: percent(
        hideAndSeek.hiderWins +
          hideAndSeek.propHuntHiderWins +
          hideAndSeek.partyPooperHiderWins,
        hideAndSeekWins,
      ),
    },
    bountyHunters: {
      kdr: ratio(bountyHunters.kills, bountyHunters.deaths),
      bowKillShare: percent(bountyHunters.bowKills, bountyHunters.kills),
    },
    throwOut: {
      kdr: ratio(throwOut.kills, throwOut.deaths),
    },
    farmHunt: {
      hunterWinShare: percent(farmHunt.hunterWins, farmHunt.wins),
    },
    soccer: {
      goalsPerKick: ratio(soccer.goals, soccer.kicks),
    },
    pixelParty: {
      winRate: ratio(pixelParty.wins, pixelParty.gamesPlayed),
    },
    disasters: {
      winRate: ratio(disasters.wins, disasters.gamesPlayed),
    },
    blockingDead: {
      headshotsPerKill: ratio(blockingDead.headshots, blockingDead.kills),
    },
  };
}

