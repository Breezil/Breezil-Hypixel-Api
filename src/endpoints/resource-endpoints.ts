import {
  parseAchievements,
  parseChallenges,
  parseGames,
  parseGuildAchievements,
  parseQuests,
  parseVanityCompanions,
  parseVanityPets,
  type AchievementsGame,
  type GameDefinition,
  type GuildAchievements,
  type ResourceChallenge,
  type ResourceQuest,
  type VanityResource,
} from "@breezil/hypixel-parsers";

import { EndpointGroup } from "./endpoint-group";
import type { Timestamped } from "./envelope";

export class ResourceEndpoints extends EndpointGroup {
  public achievements(): Promise<Timestamped<
    Record<string, AchievementsGame>
  > | null> {
    return this.parseTimestampedObject(
      "/resources/achievements",
      "achievements",
      parseAchievements,
    );
  }

  public challenges(): Promise<Timestamped<
    Record<string, readonly ResourceChallenge[]>
  > | null> {
    return this.parseTimestampedObject(
      "/resources/challenges",
      "challenges",
      parseChallenges,
    );
  }

  public quests(): Promise<Timestamped<
    Record<string, ResourceQuest[]>
  > | null> {
    return this.parseTimestampedObject(
      "/resources/quests",
      "quests",
      parseQuests,
    );
  }

  public guildAchievements(): Promise<GuildAchievements | null> {
    return this.parseEnvelope(
      "/resources/guilds/achievements",
      parseGuildAchievements,
    );
  }

  public games(): Promise<Timestamped<
    Readonly<Record<string, GameDefinition>>
  > | null> {
    return this.parseTimestampedObject("/resources/games", "games", parseGames);
  }

  public vanityPets(): Promise<Timestamped<VanityResource> | null> {
    return this.parseTimestampedEnvelope(
      "/resources/vanity/pets",
      parseVanityPets,
    );
  }

  public vanityCompanions(): Promise<Timestamped<VanityResource> | null> {
    return this.parseTimestampedEnvelope(
      "/resources/vanity/companions",
      parseVanityCompanions,
    );
  }
}

