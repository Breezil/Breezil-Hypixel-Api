export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** A zero denominator yields the numerator (K/D convention), unlike percent() which yields 0. */
export function ratio(a: number, b: number): number {
  return b === 0 ? a : round2(a / b);
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : round2((part / whole) * 100);
}

export function perGame(value: number, games: number): number {
  return ratio(value, games);
}

export function neededForNextWholeRatio(
  numerator: number,
  denominator: number,
): number {
  if (denominator === 0) {
    return 0;
  }
  const target = Math.floor(numerator / denominator) + 1;
  return Math.max(0, Math.ceil(target * denominator - numerator));
}

