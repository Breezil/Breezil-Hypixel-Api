import type { ExternalRequester } from "./http/requester";
import type { HypixelApiConfigSource } from "./config";

const PING_BASE_URL = "https://bordic.xyz/api/v2/resources/ping";

interface PingResponse {
  success?: boolean;
  data?: Array<{ avg?: number }>;
}

export class PingService {
  constructor(
    private readonly http: ExternalRequester,
    private readonly getConfig: HypixelApiConfigSource,
  ) {}

  public async ping(uuid: string): Promise<number | null> {
    const key = this.getConfig().pingApiKey.trim();
    if (key.length === 0) {
      return null;
    }
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

