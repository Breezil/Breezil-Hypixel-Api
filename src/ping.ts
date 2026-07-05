import { parseKeyList, type HypixelApiConfigSource } from "./config";
import type { ExternalRequester } from "./http/requester";

const PING_BASE_URL = "https://bordic.xyz/api/v2/resources/ping";

interface PingResponse {
  success?: boolean;
  data?: Array<{ avg?: number }>;
}

export class PingService {
  private pingKeyIndex = 0;

  constructor(
    private readonly http: ExternalRequester,
    private readonly getConfig: HypixelApiConfigSource,
  ) {}

  public async ping(uuid: string): Promise<number | null> {
    const keys = parseKeyList(this.getConfig().pingApiKey);
    if (keys.length === 0) {
      return null;
    }
    const key = keys[this.pingKeyIndex % keys.length];
    this.pingKeyIndex = (this.pingKeyIndex + 1) % keys.length;
    const body = await this.http.requestExternal<PingResponse>(
      `ping:${uuid}`,
      `${PING_BASE_URL}?key=${encodeURIComponent(key)}&uuid=${encodeURIComponent(uuid)}`,
    );
    if (
      body === null ||
      !body.success ||
      !Array.isArray(body.data) ||
      body.data.length === 0
    ) {
      return null;
    }
    return Math.round(body.data[0]?.avg ?? 0);
  }
}

