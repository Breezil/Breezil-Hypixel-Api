import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { IdentityRecord, IdentityStore } from "./identity-store";
import { MemoryIdentityStore } from "./memory-identity-store";

export class JsonFileIdentityStore implements IdentityStore {
  private readonly memory = new MemoryIdentityStore();
  private loaded: Promise<void> | null = null;
  private dirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly filePath: string,
    private readonly flushDelayMs = 1000,
  ) {}

  public async getByName(name: string): Promise<string | null> {
    await this.ensureLoaded();
    return this.memory.getByName(name);
  }

  public async getByUuid(uuid: string): Promise<IdentityRecord | null> {
    await this.ensureLoaded();
    return this.memory.getByUuid(uuid);
  }

  public async save(name: string, uuid: string): Promise<void> {
    await this.ensureLoaded();
    this.memory.save(name, uuid);
    this.scheduleFlush();
  }

  public async flush(): Promise<void> {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (!this.dirty) {
      return;
    }
    this.dirty = false;
    try {
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(
        this.filePath,
        JSON.stringify(this.memory.snapshot()),
        "utf8",
      );
    } catch {
      this.dirty = true;
    }
  }

  private ensureLoaded(): Promise<void> {
    this.loaded ??= this.load();
    return this.loaded;
  }

  private async load(): Promise<void> {
    try {
      const text = await readFile(this.filePath, "utf8");
      const data = JSON.parse(text) as Record<string, unknown>;
      for (const value of Object.values(data)) {
        if (
          typeof value === "object" &&
          value !== null &&
          typeof (value as IdentityRecord).uuid === "string" &&
          typeof (value as IdentityRecord).name === "string"
        ) {
          const record = value as IdentityRecord;
          this.memory.save(record.name, record.uuid);
        }
      }
    } catch {
      // No readable file yet
    }
  }

  private scheduleFlush(): void {
    this.dirty = true;
    if (this.flushTimer !== null) {
      return;
    }
    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, this.flushDelayMs);
    // A pending flush must not keep the process alive.
    (this.flushTimer as unknown as { unref?: () => void }).unref?.();
  }
}

