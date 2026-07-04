const DEFAULT_CACHE_TTL_SECONDS = 300;

export type HypixelApiConfigSource = () => {
  apiKey: string;
  pingApiKey: string;
  cacheTtlSeconds: number;
};

export interface HypixelApiConfig {
  apiKey: string;
  pingApiKey?: string;
  cacheTtlSeconds?: number;
}

export type HypixelApiConfigInput =
  | string
  | HypixelApiConfig
  | HypixelApiConfigSource;

export function toConfigSource(
  input: HypixelApiConfigInput,
): HypixelApiConfigSource {
  if (typeof input === "function") {
    return input;
  }
  const config =
    typeof input === "string"
      ? {
          apiKey: input,
          pingApiKey: "",
          cacheTtlSeconds: DEFAULT_CACHE_TTL_SECONDS,
        }
      : {
          apiKey: input.apiKey,
          pingApiKey: input.pingApiKey ?? "",
          cacheTtlSeconds: input.cacheTtlSeconds ?? DEFAULT_CACHE_TTL_SECONDS,
        };
  return () => config;
}

