export interface PitProgress {
  readonly level: number;
  readonly prestige: number;
}

const PIT_PRESTIGES: readonly {
  readonly multiplier: number;
  readonly sumXp: number;
}[] = [
  { multiplier: 1, sumXp: 65950 },
  { multiplier: 1.1, sumXp: 138510 },
  { multiplier: 1.2, sumXp: 217680 },
  { multiplier: 1.3, sumXp: 303430 },
  { multiplier: 1.4, sumXp: 395760 },
  { multiplier: 1.5, sumXp: 494700 },
  { multiplier: 1.75, sumXp: 610140 },
  { multiplier: 2, sumXp: 742040 },
  { multiplier: 2.5, sumXp: 906930 },
  { multiplier: 3, sumXp: 1104780 },
  { multiplier: 4, sumXp: 1368580 },
  { multiplier: 5, sumXp: 1698330 },
  { multiplier: 6, sumXp: 2094030 },
  { multiplier: 7, sumXp: 2555680 },
  { multiplier: 8, sumXp: 3083280 },
  { multiplier: 9, sumXp: 3676830 },
  { multiplier: 10, sumXp: 4336330 },
  { multiplier: 12, sumXp: 5127730 },
  { multiplier: 14, sumXp: 6051030 },
  { multiplier: 16, sumXp: 7106230 },
  { multiplier: 18, sumXp: 8293330 },
  { multiplier: 20, sumXp: 9612330 },
  { multiplier: 24, sumXp: 11195130 },
  { multiplier: 28, sumXp: 13041730 },
  { multiplier: 32, sumXp: 15152130 },
  { multiplier: 36, sumXp: 17526330 },
  { multiplier: 40, sumXp: 20164330 },
  { multiplier: 45, sumXp: 23132080 },
  { multiplier: 50, sumXp: 26429580 },
  { multiplier: 75, sumXp: 31375830 },
  { multiplier: 100, sumXp: 37970830 },
  { multiplier: 101, sumXp: 44631780 },
  { multiplier: 101, sumXp: 51292730 },
  { multiplier: 101, sumXp: 57953680 },
  { multiplier: 101, sumXp: 64614630 },
  { multiplier: 101, sumXp: 71275580 },
  { multiplier: 200, sumXp: 84465580 },
  { multiplier: 300, sumXp: 104250580 },
  { multiplier: 400, sumXp: 130630580 },
  { multiplier: 500, sumXp: 163605580 },
  { multiplier: 750, sumXp: 213068080 },
  { multiplier: 1000, sumXp: 279018080 },
  { multiplier: 1250, sumXp: 361455580 },
  { multiplier: 1500, sumXp: 460380580 },
  { multiplier: 1750, sumXp: 575793080 },
  { multiplier: 2000, sumXp: 707693080 },
  { multiplier: 3000, sumXp: 905543080 },
  { multiplier: 5000, sumXp: 1235293080 },
  { multiplier: 10000, sumXp: 1894793080 },
  { multiplier: 50000, sumXp: 5192293080 },
  { multiplier: 100000, sumXp: 11787293080 },
];

const PIT_LEVELS: readonly number[] = [
  15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500,
];

const PIT_LEVEL_MAX = 120;

function calcPitLevel(prestige: number, xp: number): number {
  const multiplier = PIT_PRESTIGES[prestige]?.multiplier || 0;
  let remaining = xp;
  let level = 0;
  while (remaining > 0 && level < PIT_LEVEL_MAX) {
    const levelXp = (PIT_LEVELS[Math.floor(level / 10)] ?? 0) * multiplier;
    if (remaining >= levelXp * 10) {
      remaining -= levelXp * 10;
      level += 10;
    } else {
      level += Math.floor(remaining / levelXp);
      remaining = 0;
    }
  }
  return level;
}

function currentPrestige(prestiges: readonly unknown[]): number {
  const last = prestiges[prestiges.length - 1] as
    | { index?: number }
    | undefined;
  return last?.index || 0;
}

function prestigeAdjustedXp(xp: number, prestige: number): number {
  return prestige > 0 ? xp - (PIT_PRESTIGES[prestige - 1]?.sumXp || 0) : xp;
}

function xpToReachLevel(prestige: number, level: number): number {
  const multiplier = PIT_PRESTIGES[prestige]?.multiplier || 0;
  let xp = 0;
  for (let i = 0; i < level; i++) {
    xp += (PIT_LEVELS[Math.floor(i / 10)] ?? 0) * multiplier;
  }
  return xp;
}

export function pitProgress(
  xp: number,
  prestiges: readonly unknown[],
): PitProgress {
  const prestige = currentPrestige(prestiges);
  return {
    level: calcPitLevel(prestige, prestigeAdjustedXp(xp, prestige)),
    prestige,
  };
}

export function pitXpForNextLevel(
  xp: number,
  prestiges: readonly unknown[],
): number {
  const prestige = currentPrestige(prestiges);
  const adjustedXp = prestigeAdjustedXp(xp, prestige);
  const level = calcPitLevel(prestige, adjustedXp);
  if (level >= PIT_LEVEL_MAX) return 0;
  return Math.max(
    0,
    Math.ceil(xpToReachLevel(prestige, level + 1) - adjustedXp),
  );
}

export function pitXpForNextPrestige(
  xp: number,
  prestiges: readonly unknown[],
): number {
  const target = PIT_PRESTIGES[currentPrestige(prestiges)]?.sumXp;
  return target === undefined ? 0 : Math.max(0, target - xp);
}

