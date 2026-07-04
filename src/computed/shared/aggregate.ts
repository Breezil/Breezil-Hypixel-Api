type NumberEntries = readonly (readonly [string, number])[];
type NumberRecord = Readonly<Record<string, number>>;

export function sum(values: readonly number[] | NumberRecord): number {
  const list = Array.isArray(values)
    ? (values as readonly number[])
    : Object.values(values as NumberRecord);
  return list.reduce((total, value) => total + value, 0);
}

export function argMax(
  source: NumberRecord | NumberEntries,
  floor = -Infinity,
): string | null {
  const entries = Array.isArray(source)
    ? (source as NumberEntries)
    : Object.entries(source as NumberRecord);
  let bestKey: string | null = null;
  let bestValue = floor;
  for (const [key, value] of entries) {
    if (value > bestValue) {
      bestValue = value;
      bestKey = key;
    }
  }
  return bestKey;
}

export function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function minPositive(values: readonly number[]): number {
  const positives = values.filter((value) => value > 0);
  return positives.length === 0 ? 0 : Math.min(...positives);
}

