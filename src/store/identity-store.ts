export type MaybePromise<T> = T | Promise<T>;

export interface IdentityRecord {
  readonly uuid: string;
  readonly name: string;
}

export interface IdentityStore {
  getByName(name: string): MaybePromise<string | null>;
  getByUuid(uuid: string): MaybePromise<IdentityRecord | null>;
  save(name: string, uuid: string): MaybePromise<void>;
}

export function canonicalUuid(uuid: string): string {
  return uuid.trim().replace(/-/g, "").toLowerCase();
}

