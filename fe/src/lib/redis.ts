import Redis from "ioredis";

const redisUri = "redis://127.0.0.1:6379";

const redis = new Redis(redisUri);

export default redis;
