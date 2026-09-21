import { Redis } from "@upstash/redis";

/**
 * Vercel's Upstash Redis marketplace integration injects UPSTASH_REDIS_REST_URL
 * / UPSTASH_REDIS_REST_TOKEN. Older KV integrations used KV_REST_API_URL /
 * KV_REST_API_TOKEN -- support both so setup isn't fussy about which one
 * ends up in the project's environment variables.
 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
