export interface GameInfo {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}

export const GAMES: readonly GameInfo[] = [
  { id: 2, code: "QUAKECRAFT", name: "Quakecraft" },
  { id: 3, code: "WALLS", name: "Walls" },
  { id: 4, code: "PAINTBALL", name: "Paintball" },
  { id: 5, code: "SURVIVAL_GAMES", name: "Blitz Survival Games" },
  { id: 6, code: "TNTGAMES", name: "The TNT Games" },
  { id: 7, code: "VAMPIREZ", name: "VampireZ" },
  { id: 13, code: "WALLS3", name: "Mega Walls" },
  { id: 14, code: "ARCADE", name: "Arcade" },
  { id: 17, code: "ARENA", name: "Arena Brawl" },
  { id: 20, code: "UHC", name: "UHC Champions" },
  { id: 21, code: "MCGO", name: "Cops and Crims" },
  { id: 23, code: "BATTLEGROUND", name: "Warlords" },
  { id: 24, code: "SUPER_SMASH", name: "Smash Heroes" },
  { id: 25, code: "GINGERBREAD", name: "Turbo Kart Racers" },
  { id: 26, code: "HOUSING", name: "Housing" },
  { id: 51, code: "SKYWARS", name: "SkyWars" },
  { id: 52, code: "TRUE_COMBAT", name: "Crazy Walls" },
  { id: 54, code: "SPEED_UHC", name: "Speed UHC" },
  { id: 55, code: "SKYCLASH", name: "SkyClash" },
  { id: 56, code: "LEGACY", name: "Classic Games" },
  { id: 57, code: "PROTOTYPE", name: "Prototype" },
  { id: 58, code: "BEDWARS", name: "Bed Wars" },
  { id: 59, code: "MURDER_MYSTERY", name: "Murder Mystery" },
  { id: 60, code: "BUILD_BATTLE", name: "Build Battle" },
  { id: 61, code: "DUELS", name: "Duels" },
  { id: 63, code: "SKYBLOCK", name: "SkyBlock" },
  { id: 64, code: "PIT", name: "Pit" },
  { id: 65, code: "REPLAY", name: "Replay" },
  { id: 67, code: "SMP", name: "SMP" },
  { id: 68, code: "WOOL_GAMES", name: "Wool Games" },
];

const GAMES_BY_CODE = new Map(GAMES.map((game) => [game.code, game]));
const GAMES_BY_ID = new Map(GAMES.map((game) => [game.id, game]));

export function gameByCode(code: string): GameInfo {
  return GAMES_BY_CODE.get(code) ?? { id: 0, code, name: code };
}

export function gameById(id: number): GameInfo {
  return GAMES_BY_ID.get(id) ?? { id, code: "UNKNOWN", name: "Unknown" };
}

