import {
  canonicalUuid,
  type IdentityRecord,
  type IdentityStore,
} from "./identity-store";

export class MemoryIdentityStore implements IdentityStore {
  private readonly byName = new Map<string, IdentityRecord>();
  private readonly byUuid = new Map<string, IdentityRecord>();

  public getByName(name: string): string | null {
    return this.byName.get(name.trim().toLowerCase())?.uuid ?? null;
  }

  public getByUuid(uuid: string): IdentityRecord | null {
    return this.byUuid.get(canonicalUuid(uuid)) ?? null;
  }

  public save(name: string, uuid: string): void {
    const record: IdentityRecord = {
      uuid: canonicalUuid(uuid),
      name: name.trim(),
    };
    this.byName.set(record.name.toLowerCase(), record);
    this.byUuid.set(record.uuid, record);
  }

  public snapshot(): Record<string, IdentityRecord> {
    const out: Record<string, IdentityRecord> = {};
    for (const [uuid, record] of this.byUuid) {
      out[uuid] = record;
    }
    return out;
  }
}

