import {
  type SkyBlockMuseum,
  type SkyBlockMuseumDonation,
  type SkyBlockMuseumMember,
} from "@breezil/hypixel-parsers";

import { argMax } from "../shared/aggregate";
import { ratio } from "../shared/ratio";

export interface MuseumMemberComputed {
  readonly donatedItemCount: number;
  readonly specialItemCount: number;
  readonly totalDonationCount: number;
  readonly featuredItemCount: number;
  readonly borrowedItemCount: number;
  readonly firstDonatedAt: Date | null;
  readonly lastDonatedAt: Date | null;
  readonly valuePerDonation: number;
}

export interface MuseumComputed {
  readonly memberCount: number;
  readonly appraisedMemberCount: number;
  readonly totalValue: number;
  readonly totalDonatedItemCount: number;
  readonly totalSpecialItemCount: number;
  readonly totalDonationCount: number;
  readonly averageValuePerMember: number;
  readonly averageDonationsPerMember: number;
  readonly topValueMemberUuid: string | null;
  readonly topDonorMemberUuid: string | null;
  readonly lastDonatedAt: Date | null;
}

function donations(member: SkyBlockMuseumMember): SkyBlockMuseumDonation[] {
  return [...member.items, ...member.special];
}

function donationTimes(member: SkyBlockMuseumMember): number[] {
  return donations(member)
    .map((donation) => donation.donatedAt)
    .filter((donatedAt): donatedAt is Date => donatedAt !== null)
    .map((donatedAt) => donatedAt.getTime());
}

function toDate(time: number | null): Date | null {
  return time === null ? null : new Date(time);
}

function latestTime(times: readonly number[]): number | null {
  return times.length === 0 ? null : Math.max(...times);
}

export function computeMuseumMember(
  raw: SkyBlockMuseumMember,
): MuseumMemberComputed {
  const times = donationTimes(raw);
  const totalDonationCount = raw.items.length + raw.special.length;
  return {
    donatedItemCount: raw.items.length,
    specialItemCount: raw.special.length,
    totalDonationCount,
    featuredItemCount: raw.items.filter((item) => item.featuredSlot !== null)
      .length,
    borrowedItemCount: raw.items.filter((item) => item.borrowing).length,
    firstDonatedAt: toDate(times.length === 0 ? null : Math.min(...times)),
    lastDonatedAt: toDate(latestTime(times)),
    valuePerDonation: ratio(raw.value, totalDonationCount),
  };
}

export function computeMuseum(raw: SkyBlockMuseum): MuseumComputed {
  const members = Object.entries(raw.members);
  const totalValue = members.reduce(
    (total, [, member]) => total + member.value,
    0,
  );
  const totalDonatedItemCount = members.reduce(
    (total, [, member]) => total + member.items.length,
    0,
  );
  const totalSpecialItemCount = members.reduce(
    (total, [, member]) => total + member.special.length,
    0,
  );
  const totalDonationCount = totalDonatedItemCount + totalSpecialItemCount;
  return {
    memberCount: members.length,
    appraisedMemberCount: members.filter(([, member]) => member.appraisal)
      .length,
    totalValue,
    totalDonatedItemCount,
    totalSpecialItemCount,
    totalDonationCount,
    averageValuePerMember: ratio(totalValue, members.length),
    averageDonationsPerMember: ratio(totalDonationCount, members.length),
    topValueMemberUuid: argMax(
      members.map(([uuid, member]) => [uuid, member.value] as const),
      0,
    ),
    topDonorMemberUuid: argMax(
      members.map(
        ([uuid, member]) =>
          [uuid, member.items.length + member.special.length] as const,
      ),
      0,
    ),
    lastDonatedAt: toDate(
      latestTime(members.flatMap(([, member]) => donationTimes(member))),
    ),
  };
}

