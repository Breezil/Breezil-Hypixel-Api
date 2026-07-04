import { round2 } from "./ratio";

const GUILD_EXP_NEEDED = [
  100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000,
  2500000, 2500000, 2500000, 2500000, 2500000, 3000000,
];

const GUILD_LEVEL_MAX = 1000;

function guildExpNeededAt(index: number): number {
  return index >= GUILD_EXP_NEEDED.length
    ? GUILD_EXP_NEEDED[GUILD_EXP_NEEDED.length - 1]
    : GUILD_EXP_NEEDED[index];
}

export function guildLevel(exp: number): number {
  let level = 0;
  let remaining = exp;
  for (let i = 0; i <= GUILD_LEVEL_MAX; i += 1) {
    const need = guildExpNeededAt(i);
    if (remaining - need < 0) {
      return round2(level + remaining / need);
    }
    level += 1;
    remaining -= need;
  }
  return GUILD_LEVEL_MAX;
}

export function guildExpUntilNextLevel(exp: number): number {
  let remaining = exp;
  for (let i = 0; i <= GUILD_LEVEL_MAX; i += 1) {
    const need = guildExpNeededAt(i);
    if (remaining - need < 0) return need - remaining;
    remaining -= need;
  }
  return 0;
}

