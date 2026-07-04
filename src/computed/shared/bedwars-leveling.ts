export const BEDWARS_PRESTIGE_CYCLE_XP = 487_000;

const EARLY_LEVEL_TOTAL_XP = [0, 500, 1500, 3500, 7000] as const;
const XP_PER_LEVEL = 5000;

export function bedwarsStar(experience: number): number {
  const level = Math.floor(experience / BEDWARS_PRESTIGE_CYCLE_XP) * 100;
  const xp = experience % BEDWARS_PRESTIGE_CYCLE_XP;
  for (let i = 1; i < EARLY_LEVEL_TOTAL_XP.length; i++) {
    if (xp < EARLY_LEVEL_TOTAL_XP[i]) {
      const stepXp = EARLY_LEVEL_TOTAL_XP[i] - EARLY_LEVEL_TOTAL_XP[i - 1];
      return level + i - 1 + (xp - EARLY_LEVEL_TOTAL_XP[i - 1]) / stepXp;
    }
  }
  const lastThreshold = EARLY_LEVEL_TOTAL_XP[EARLY_LEVEL_TOTAL_XP.length - 1];
  return (
    level +
    EARLY_LEVEL_TOTAL_XP.length -
    1 +
    (xp - lastThreshold) / XP_PER_LEVEL
  );
}

export function bedwarsXpToNextLevel(experience: number): number {
  const xp = experience % BEDWARS_PRESTIGE_CYCLE_XP;
  for (let i = 1; i < EARLY_LEVEL_TOTAL_XP.length; i++) {
    if (xp < EARLY_LEVEL_TOTAL_XP[i]) return EARLY_LEVEL_TOTAL_XP[i] - xp;
  }
  const lastThreshold = EARLY_LEVEL_TOTAL_XP[EARLY_LEVEL_TOTAL_XP.length - 1];
  return XP_PER_LEVEL - ((xp - lastThreshold) % XP_PER_LEVEL);
}

export interface BedwarsPrestige {
  readonly bracket: number;
  readonly name: string;
  readonly colorCode: string;
}

export const BEDWARS_PRESTIGES: readonly {
  readonly level: number;
  readonly name: string;
  readonly colorCode: string;
}[] = [
  { level: 1, name: "Stone", colorCode: "§7[1✫]" },
  { level: 100, name: "Iron", colorCode: "§f[100✫]" },
  { level: 200, name: "Gold", colorCode: "§6[200✫]" },
  { level: 300, name: "Diamond", colorCode: "§b[300✫]" },
  { level: 400, name: "Emerald", colorCode: "§2[400✫]" },
  { level: 500, name: "Sapphire", colorCode: "§3[500✫]" },
  { level: 600, name: "Ruby", colorCode: "§4[600✫]" },
  { level: 700, name: "Crystal", colorCode: "§d[700✫]" },
  { level: 800, name: "Opal", colorCode: "§9[800✫]" },
  { level: 900, name: "Amethyst", colorCode: "§5[900✫]" },
  { level: 1000, name: "Rainbow", colorCode: "§c[§61§e0§a0§b0§d✫§5]" },
  { level: 1100, name: "Iron Prime", colorCode: "§7[§f1100§7✪]" },
  { level: 1200, name: "Gold Prime", colorCode: "§7[§e1200§6✪§7]" },
  { level: 1300, name: "Diamond Prime", colorCode: "§7[§b1300§3✪§7]" },
  { level: 1400, name: "Emerald Prime", colorCode: "§7[§a1400§2✪§7]" },
  { level: 1500, name: "Sapphire Prime", colorCode: "§7[§31500§9✪§7]" },
  { level: 1600, name: "Ruby Prime", colorCode: "§7[§c1600§4✪§7]" },
  { level: 1700, name: "Crystal Prime", colorCode: "§7[§d1700§5✪§7]" },
  { level: 1800, name: "Opal Prime", colorCode: "§7[§91800§1✪§7]" },
  { level: 1900, name: "Amethyst Prime", colorCode: "§7[§51900§8✪§7]" },
  { level: 2000, name: "Mirror", colorCode: "§8[§72§f00§70✪§8]" },
  { level: 2100, name: "Light", colorCode: "§7[2§e10§60⚝]" },
  { level: 2200, name: "Dawn", colorCode: "§6[2§f20§b0§3⚝]" },
  { level: 2300, name: "Dusk", colorCode: "§5[2§d30§60§e⚝]" },
  { level: 2400, name: "Air", colorCode: "§b[2§f40§70⚝§8]" },
  { level: 2500, name: "Wind", colorCode: "§7[2§a50§20⚝]" },
  { level: 2600, name: "Nebula", colorCode: "§4[2§c60§d0⚝§5]" },
  { level: 2700, name: "Thunder", colorCode: "§e[2§f70§80⚝]" },
  { level: 2800, name: "Earth", colorCode: "§a[2§280§60⚝§e]" },
  { level: 2900, name: "Water", colorCode: "§b[2§390§90⚝§1]" },
  { level: 3000, name: "Fire", colorCode: "§e[3§600§c0⚝§4]" },
  { level: 3100, name: "Sunrise", colorCode: "§9[3§310§60✥§e]" },
  { level: 3200, name: "Eclipse", colorCode: "§c[§43§720§40§c✥]" },
  { level: 3300, name: "Gamma", colorCode: "§9[33§d0§c0✥§4]" },
  { level: 3400, name: "Majestic", colorCode: "§2[§a3§d40§50✥§2]" },
  { level: 3500, name: "Andesine", colorCode: "§c[3§450§20§a✥]" },
  { level: 3600, name: "Marine", colorCode: "§a[36§b0§90✥§1]" },
  { level: 3700, name: "Element", colorCode: "§4[3§c70§b0§3✥]" },
  { level: 3800, name: "Galaxy", colorCode: "§1[3§98§500§d✥§1]" },
  { level: 3900, name: "Atomic", colorCode: "§c[3§a90§30§9✥]" },
  { level: 4000, name: "Sunset", colorCode: "§5[4§c00§60✥§e]" },
  { level: 4100, name: "Time", colorCode: "§e[4§61§c0§d0✥§5]" },
  { level: 4200, name: "Winter", colorCode: "§1[§94§32§b0§f0§7✥]" },
  { level: 4300, name: "Obsidian", colorCode: "§0[§54§830§50✥§0]" },
  { level: 4400, name: "Spring", colorCode: "§2[4§a4§e0§60§5✥§d]" },
  { level: 4500, name: "Ice", colorCode: "§f[4§b50§30✥]" },
  { level: 4600, name: "Summer", colorCode: "§3[§b4§e60§60§d✥§5]" },
  { level: 4700, name: "Spinel", colorCode: "§f[§44§c70§90§1✥§9]" },
  { level: 4800, name: "Autumn", colorCode: "§5[4§c8§600§b✥§3]" },
  { level: 4900, name: "Mystic", colorCode: "§2[§a4§f900§a✥§2]" },
  { level: 5000, name: "Eternal", colorCode: "§4[5§50§900§1✥§0]" },
  { level: 5100, name: "Burnout", colorCode: "§4[§c51§60§e0§f✥§4]" },
  { level: 5200, name: "Cooldown", colorCode: "§1[§95§32§b0§f0§e✥§1]" },
  { level: 5300, name: "Obliteration", colorCode: "§5[§d5§e3§f0§e0§d✥§5]" },
  { level: 5400, name: "Ender", colorCode: "§3[§a5§24§80§20§a✥§3]" },
  { level: 5500, name: "Brust", colorCode: "§2[§a5§e5§f0§b0§d✥§5]" },
  { level: 5600, name: "Comical", colorCode: "§4[§c5§e6§f0§e0§c✥§4]" },
  { level: 5700, name: "Lusterlost", colorCode: "§4[§65§27§30§90§5✥§8]" },
  { level: 5800, name: "Maelstrom", colorCode: "§5[§c5§68§f0§b0§3✥§9]" },
  { level: 5900, name: "Time Undone", colorCode: "§7[§05§89§70§f0✥§7]" },
  { level: 6000, name: "Umbrella", colorCode: "§c[§f6000§c✥§f]" },
  { level: 6100, name: "Luminous", colorCode: "§6[§e6§f100§b✥§3]" },
  { level: 6200, name: "Tortilla", colorCode: "§e[§f6§e2§600§f✥§e]" },
  { level: 6300, name: "Corn", colorCode: "§a[§e6300§a✥§2]" },
  { level: 6400, name: "Bittersweet", colorCode: "§b[6§c400§a✥]" },
  { level: 6500, name: "Sweetsour", colorCode: "§3[6§a50§f0§a✥§3]" },
  { level: 6600, name: "Pop", colorCode: "§9[§d6600§b✥§9]" },
  { level: 6700, name: "Bubblegum", colorCode: "§5[§d6700§f✥§5]" },
  { level: 6800, name: "Contrast", colorCode: "§0[§668§e00§f✥]" },
  { level: 6900, name: "Blended", colorCode: "§a[690§20✥§8]" },
  { level: 7000, name: "Allay", colorCode: "§3[§b7000§f✥§3]" },
  { level: 7100, name: "Blaze", colorCode: "§4[§c7§61§e0§c0§6✥§e]" },
  { level: 7200, name: "Creeper", colorCode: "§2[§a7§f2§20§a0§f✥§8]" },
  { level: 7300, name: "Drowned", colorCode: "§2[§373§b00§a✥§2]" },
  { level: 7400, name: "Enderman", colorCode: "§8[7400§d✥§8]" },
  { level: 7500, name: "Frog", colorCode: "§6[7§250§f0✥]" },
  { level: 7600, name: "Ghast", colorCode: "§f[76§700§c✥§8]" },
  { level: 7700, name: "Hoglin", colorCode: "§d[§c7700§6✥§d]" },
  { level: 7800, name: "Iron Golem", colorCode: "§8[§77§f800§e✥§8]" },
  { level: 7900, name: "Jerry", colorCode: "§6[§f7§29§60§20§f✥§6]" },
  { level: 8000, name: "Kringle", colorCode: "§2[§a800§c0§4✥§2]" },
  { level: 8100, name: "Liquid", colorCode: "§8[§78§f1§b0§30§9✥§1]" },
  { level: 8200, name: "Mint", colorCode: "§f[8200§a✥§f]" },
  { level: 8300, name: "Neglected", colorCode: "§8[8§430§c0✥§8]" },
  { level: 8400, name: "Onion", colorCode: "§f[§d840§a0✥§f]" },
  { level: 8500, name: "Poser", colorCode: "§3[§68500§e✥§3]" },
  { level: 8600, name: "Quartz", colorCode: "§d[§f8600§e✥§d]" },
  { level: 8700, name: "Rich", colorCode: "§8[§68700✥§8]" },
  { level: 8800, name: "Sanguine", colorCode: "§4[88§c00§f✥]" },
  { level: 8900, name: "Titanic", colorCode: "§9[§b890§30✥§9]" },
  { level: 9000, name: "Unorthodox", colorCode: "§d[9000§5✥§8]" },
  { level: 9100, name: "Volcanic", colorCode: "§0[§c9§610§c0✥§4]" },
  { level: 9200, name: "Weeping Cherry", colorCode: "§2[§d9200§a✥§2]" },
  { level: 9300, name: "X-Ray", colorCode: "§f[§89300§f✥]" },
  { level: 9400, name: "Yearn", colorCode: "§e[§69§44§800✥]" },
  { level: 9500, name: "Zebra", colorCode: "§0[9§850§70✥§f]" },
  { level: 9600, name: "Caution", colorCode: "§e[96§000§e✥§0]" },
  { level: 9700, name: "Indescribable", colorCode: "§d[97§e00§b✥§e]" },
  { level: 9800, name: "Forgotten", colorCode: "§0[§89800✥§0]" },
  { level: 9900, name: "Fuse", colorCode: "§8[§79§f900§e✥§f]" },
  { level: 10000, name: "Prestigious", colorCode: "§9[§b1§f0000§c✥§4]" },
];

export function bedwarsPrestige(star: number): BedwarsPrestige {
  const bracket = Math.min(Math.max(Math.floor(star / 100), 0), 100);
  const entry = BEDWARS_PRESTIGES[bracket];
  return { bracket, name: entry.name, colorCode: entry.colorCode };
}

