import Redis from 'ioredis';

const redisUri = process.env.CACHER_URI as string;

const redis = new Redis(redisUri);

export default redis;
