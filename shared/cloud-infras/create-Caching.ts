import { createSecret } from './utils/create-secret';
import * as pulumi from '@pulumi/pulumi';
import * as upstash from '@upstash/pulumi';
import { infrasName } from './utils/infras.constant';
export async function createCaching() {
  const upstashProvider = new upstash.Provider('upstash-provider', {
    email: process.env.UPSTASH_EMAIL,
    apiKey: process.env.UPSTASH_API_KEY,
  });

  const redis = new upstash.RedisDatabase(
    infrasName.redisFullName,
    {
      databaseName: infrasName.redisFullName,
      region: 'global',
      primaryRegion: 'ap-southeast-1',
      tls: true,
    },
    {
      provider: upstashProvider,
    },
  );

  // const redisUri = $interpolate`rediss://default:${redis.password}@${redis.endpoint}:${redis.port}`;

  const redisUri = pulumi
    .all([redis.password, redis.endpoint, redis.port])
    .apply(([password, endpoint, port]) => {
      return `rediss://default:${password}@${endpoint}:${port}`;
    });
  const redisSecret = createSecret('CACHER_URI', redisUri);
  return redisUri;
}
