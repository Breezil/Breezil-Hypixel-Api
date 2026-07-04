export interface HttpRequester {
  request<T = Record<string, unknown>>(endpoint: string): Promise<T | null>;
}

export interface ExternalRequester {
  requestExternal<T>(cacheKey: string, url: string): Promise<T | null>;
}

