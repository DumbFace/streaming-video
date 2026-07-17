import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

export const otpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ratelimit:otp",
  points: 3,
  duration: 600,
  blockDuration: 600,
});
