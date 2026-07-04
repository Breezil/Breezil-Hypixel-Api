export default {
  base: "/Breezil-Hypixel-Api/",
  title: "@breezil/hypixel-api",
  description:
    "Typed Hypixel API client: fetching, caching, rate-limit handling, and an always-on computed stats layer on top of fully parsed responses.",
  cleanUrls: true,
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/Breezil-Hypixel-Api/logo.png" }]],
  themeConfig: {
    logo: "/logo.png",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
      { text: "Computed", link: "/api/computed/" },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/@breezil/hypixel-api",
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "API Overview", link: "/api/" },
        ],
      },
      {
        text: "Client",
        items: [
          { text: "Client & Config", link: "/api/client" },
          { text: "Resolver & Identity Stores", link: "/api/resolver" },
        ],
      },
      {
        text: "Endpoints",
        items: [
          { text: "Player", link: "/api/endpoints/player" },
          { text: "Guild", link: "/api/endpoints/guild" },
          { text: "Network", link: "/api/endpoints/network" },
          { text: "Resources", link: "/api/endpoints/resources" },
          { text: "SkyBlock", link: "/api/endpoints/skyblock" },
          { text: "Housing", link: "/api/endpoints/housing" },
        ],
      },
      {
        text: "Computed",
        items: [
          { text: "Overview & Enriched Types", link: "/api/computed/" },
          { text: "Player", link: "/api/computed/player" },
          { text: "Guild", link: "/api/computed/guild" },
          { text: "SkyBlock Member", link: "/api/computed/skyblock" },
          { text: "SkyBlock Garden", link: "/api/computed/garden" },
          { text: "Network Endpoints", link: "/api/computed/network" },
          { text: "SkyBlock Economy", link: "/api/computed/skyblock-economy" },
          { text: "Shared Math & Tables", link: "/api/computed/shared" },
        ],
      },
      {
        text: "Computed: Game Modes",
        collapsed: true,
        items: [
          { text: "BedWars", link: "/api/computed/modes/bedwars" },
          { text: "SkyWars", link: "/api/computed/modes/skywars" },
          { text: "Duels", link: "/api/computed/modes/duels" },
          { text: "UHC", link: "/api/computed/modes/uhc" },
          { text: "Cops and Crims", link: "/api/computed/modes/copsandcrims" },
          { text: "The Pit", link: "/api/computed/modes/pit" },
          { text: "Warlords", link: "/api/computed/modes/warlords" },
          { text: "Mega Walls", link: "/api/computed/modes/megawalls" },
          { text: "Walls", link: "/api/computed/modes/walls" },
          { text: "Paintball", link: "/api/computed/modes/paintball" },
          { text: "Quakecraft", link: "/api/computed/modes/quakecraft" },
          { text: "Smash Heroes", link: "/api/computed/modes/smashheroes" },
          { text: "Murder Mystery", link: "/api/computed/modes/murdermystery" },
          { text: "Build Battle", link: "/api/computed/modes/buildbattle" },
          { text: "TNT Games", link: "/api/computed/modes/tntgames" },
          { text: "VampireZ", link: "/api/computed/modes/vampirez" },
          { text: "Arena Brawl", link: "/api/computed/modes/arenabrawl" },
          {
            text: "Turbo Kart Racers",
            link: "/api/computed/modes/turbokartracers",
          },
          { text: "Arcade", link: "/api/computed/modes/arcade" },
          { text: "Blitz Survival Games", link: "/api/computed/modes/blitz" },
          { text: "Speed UHC", link: "/api/computed/modes/speeduhc" },
          { text: "Wool Games", link: "/api/computed/modes/woolgames" },
          { text: "SkyClash", link: "/api/computed/modes/skyclash" },
          { text: "True Combat", link: "/api/computed/modes/truecombat" },
          { text: "Legacy", link: "/api/computed/modes/legacy" },
          { text: "Main Lobby", link: "/api/computed/modes/mainlobby" },
          { text: "Housing", link: "/api/computed/modes/housing" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Breezil/Breezil-Hypixel-Api",
      },
      { icon: "discord", link: "https://discord.gg/7SxbNMYQNa" },
    ],
    search: { provider: "local" },
    editLink: {
      pattern:
        "https://github.com/Breezil/Breezil-Hypixel-Api/edit/main/docs/:path",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Built with 💙 by Breezil",
    },
  },
};

