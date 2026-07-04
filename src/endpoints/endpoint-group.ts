import { date } from "@breezil/hypixel-parsers";

import { asRootArray, pickArray, pickObject } from "../http/extractors";
import type { HttpRequester } from "../http/requester";
import type { Timestamped } from "./envelope";

type ObjectParser<T> = (raw: Record<string, unknown>) => T;
type ArrayParser<T> = (raw: unknown[]) => T;

export abstract class EndpointGroup {
  constructor(protected readonly http: HttpRequester) {}

  protected endpoint(
    path: string,
    params: Record<string, string | number> = {},
  ): string {
    const query = Object.entries(params)
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("&");
    return query.length === 0 ? path : `${path}?${query}`;
  }

  protected async rawObject(
    endpoint: string,
    key: string,
  ): Promise<Record<string, unknown> | null> {
    return pickObject(await this.http.request(endpoint), key);
  }

  protected async parseObject<T>(
    endpoint: string,
    key: string,
    parse: ObjectParser<T>,
  ): Promise<T | null> {
    const raw = pickObject(await this.http.request(endpoint), key);
    return raw === null ? null : parse(raw);
  }

  protected async parseArray<T>(
    endpoint: string,
    key: string,
    parse: ArrayParser<T>,
  ): Promise<T | null> {
    const raw = pickArray(await this.http.request(endpoint), key);
    return raw === null ? null : parse(raw);
  }

  protected async parseRootArray<T>(
    endpoint: string,
    parse: ArrayParser<T>,
  ): Promise<T | null> {
    const raw = asRootArray(await this.http.request<unknown>(endpoint));
    return raw === null ? null : parse(raw);
  }

  protected async parseEnvelope<T>(
    endpoint: string,
    parse: ObjectParser<T>,
  ): Promise<T | null> {
    const raw = await this.http.request(endpoint);
    return raw === null ? null : parse(raw);
  }

  protected async parseTimestampedObject<T>(
    endpoint: string,
    key: string,
    parse: ObjectParser<T>,
  ): Promise<Timestamped<T> | null> {
    const envelope = await this.http.request(endpoint);
    const raw = pickObject(envelope, key);
    return raw === null ? null : this.timestamped(envelope, parse(raw));
  }

  protected async parseTimestampedArray<T>(
    endpoint: string,
    key: string,
    parse: ArrayParser<T>,
  ): Promise<Timestamped<T> | null> {
    const envelope = await this.http.request(endpoint);
    const raw = pickArray(envelope, key);
    return raw === null ? null : this.timestamped(envelope, parse(raw));
  }

  protected async parseTimestampedEnvelope<T>(
    endpoint: string,
    parse: ObjectParser<T>,
  ): Promise<Timestamped<T> | null> {
    const envelope = await this.http.request(endpoint);
    return envelope === null
      ? null
      : this.timestamped(envelope, parse(envelope));
  }

  private timestamped<T>(
    envelope: Record<string, unknown> | null,
    value: T,
  ): Timestamped<T> {
    return { lastUpdatedAt: date(envelope ?? undefined, "lastUpdated"), value };
  }
}

