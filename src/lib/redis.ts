import Redis from "ioredis";

function resolveRedisUrl(raw: string | undefined): string {
  if (!raw?.trim()) {
    throw new Error("REDIS_URL is not set");
  }
  const url = raw.trim();
  // Upstash requires TLS. A plain redis:// URL often ends in ECONNRESET.
  if (url.includes("upstash.io") && url.startsWith("redis://")) {
    return url.replace(/^redis:\/\//, "rediss://");
  }
  return url;
}

export const redis = new Redis(resolveRedisUrl(process.env.REDIS_URL), {
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redis.on("error", (err) => {
  console.error("[Redis]", err.message);
});
