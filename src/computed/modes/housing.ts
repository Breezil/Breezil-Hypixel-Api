import type { HousingStats } from "@breezil/hypixel-parsers";

const KILL_MESSAGE_PREFIX = "killmessages_";

export interface HousingComputed {
  readonly packagesOwnedCount: number;
  readonly packageCategoryBreakdown: Readonly<Record<string, number>>;
  readonly activeKillMessageName: string;
  readonly hasActiveKillMessage: boolean;
  readonly customLayoutCount: number;
  readonly placedLayoutItemsTotal: number;
  readonly distinctLayoutItemTypesCount: number;
  readonly usesCustomLeaderboardReset: boolean;
}

function packageCategory(id: string): string {
  const packIndex = id.indexOf("_pack");
  if (packIndex >= 0) {
    return id.slice(0, packIndex);
  }
  return id.split("_")[0] || id;
}

function breakdown(
  packages: readonly string[],
): Readonly<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const id of packages) {
    const category = packageCategory(id);
    result[category] = (result[category] ?? 0) + 1;
  }
  return result;
}

function collectItemTypes(
  layout: Record<string, unknown>,
  types: Set<string>,
): void {
  for (const item of Object.values(layout)) {
    if (typeof item === "string" && item.length > 0) {
      types.add(item.split(";")[0]);
    }
  }
}

export function computeHousing(raw: HousingStats): HousingComputed {
  let placedLayoutItemsTotal = Object.keys(raw.layoutItems).length;
  const itemTypes = new Set<string>();
  collectItemTypes(raw.layoutItems, itemTypes);
  for (const layout of Object.values(raw.layoutItemsById)) {
    placedLayoutItemsTotal += Object.keys(layout).length;
    collectItemTypes(layout, itemTypes);
  }

  const resetType = raw.leaderboardSettings.resetType;

  return {
    packagesOwnedCount: raw.packages.length,
    packageCategoryBreakdown: breakdown(raw.packages),
    activeKillMessageName: raw.activeKillMessages.startsWith(
      KILL_MESSAGE_PREFIX,
    )
      ? raw.activeKillMessages.slice(KILL_MESSAGE_PREFIX.length)
      : raw.activeKillMessages,
    hasActiveKillMessage: raw.activeKillMessages.length > 0,
    customLayoutCount: Object.keys(raw.layoutItemsById).length,
    placedLayoutItemsTotal,
    distinctLayoutItemTypesCount: itemTypes.size,
    usesCustomLeaderboardReset: resetType !== "" && resetType !== "NEVER",
  };
}

