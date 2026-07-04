export function pickObject(
  res: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  const value = res?.[key];
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function pickArray(
  res: Record<string, unknown> | null,
  key: string,
): unknown[] | null {
  const value = res?.[key];
  return Array.isArray(value) ? value : null;
}

export function asRootArray(res: unknown): unknown[] | null {
  return Array.isArray(res) ? res : null;
}

