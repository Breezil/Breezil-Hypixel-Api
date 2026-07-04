import { WEEK_MS } from "./time";

const WEEKLY_OSCILLATION_START = 1417237200000;

export function monthBucket(now: Date): "a" | "b" {
  return now.getMonth() % 2 ? "a" : "b";
}

export function weekBucket(now: Date): "a" | "b" {
  const weeks = Math.floor(
    Math.abs(now.getTime() - WEEKLY_OSCILLATION_START) / WEEK_MS,
  );
  return weeks % 2 ? "a" : "b";
}

export function monthlyValue(a: number, b: number, now: Date): number {
  return monthBucket(now) === "a" ? a : b;
}

export function weeklyValue(a: number, b: number, now: Date): number {
  return weekBucket(now) === "a" ? a : b;
}

