/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    console.log('process.env.ATLAS_PUBLIC_KEY: ', process.env.ATLAS_PUBLIC_KEY);
    return {
      name: 'streaming-video',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        mongodbatlas: {
          package: '@pulumi/mongodbatlas',
          version: '4.12.0',
          publicKey: process.env.ATLAS_PUBLIC_KEY,
          privateKey: process.env.ATLAS_PRIVATE_KEY,
        },
        cloudamqp: {
          package: '@pulumi/cloudamqp',
          version: '3.31.0',
          apikey: process.env.CLOUDAMQP_API_KEY,
        },
        upstash: {
          package: '@upstash/pulumi',
          version: '0.5.0',
          email: process.env.UPSTASH_EMAIL,
          apiKey: process.env.UPSTASH_API_KEY,
        },
      },
    };
  },
  async run() {
    // console.log('process.env.ATLAS_PUBLIC_KEY: ', process.env.ATLAS_PUBLIC_KEY);
    const mongodbatlas = await import('@pulumi/mongodbatlas');
    const upstash = await import('@upstash/pulumi');
    const cloudamqp = await import('@pulumi/cloudamqp');
    // const mongoUri = new sst.Secret('DATABASE_URI');
    // const nextAuthUrl = new sst.Secret('NEXTAUTH_URL');
    // const vpc = {
    //   id: 'vpc-0b7dfbb79b62f8121',
    //   privateSubnets: ['subnet-00bd9b1c88b9a9d3a', 'subnet-0767f2afa5bfbfa04'],
    //   publicSubnets: ['subnet-0b63f6b140dafc4c3'],
    //   securityGroups: ['sg-006d006ed3ec985e3'],
    // };
    if (!process.env.ATLAS_ORG_ID) {
      throw new Error('ATLAS_ORG_ID couldnt be empty');
    }
    const project = new mongodbatlas.Project('myProject', {
      name: 'streaming-video-mongo-stage',
      orgId: process.env.ATLAS_ORG_ID,
    });
    const mongoCluster = new mongodbatlas.Cluster('main', {
      projectId: project.id,
      name: 'streaming-video-cluster-stage',
      providerName: 'TENANT',
      backingProviderName: 'AWS',
      providerInstanceSizeName: 'M0',
      providerRegionName: 'AP_SOUTHEAST_1',
    });
    const mongoUser = new mongodbatlas.DatabaseUser('mongo-user', {
      projectId: project.id,
      username: 'mongo_user',
      password: 'mongo_password',
      authDatabaseName: 'admin',
      roles: [
        {
          roleName: 'readWriteAnyDatabase',
          databaseName: 'admin',
        },
      ],
    });
    const ipAccessList = new mongodbatlas.ProjectIpAccessList('allow-all-ip', {
      projectId: project.id,
      cidrBlock: '0.0.0.0/0',
      comment: 'Allow access from anywhere for staging',
    });
    const redis = new upstash.RedisDatabase('main', {
      databaseName: 'streaming-video-redis-stage',
      region: 'global',
      primaryRegion: 'ap-southeast-1',
      tls: true,
    });
    const redisUri = $interpolate`rediss://default:${redis.password}@${redis.endpoint}:${redis.port}`;
    const rabbitmq = new cloudamqp.Instance('main', {
      name: 'streaming-video-rabbitmq-stage',
      plan: 'squirrel-1',
      region: 'amazon-web-services::ap-southeast-1',
    });
    const rabbitmqUri = rabbitmq.url;
    // const rabbitmqDefinitionPlugin = new cloudamqp.Plugin('definition-plugin', {
    //   instanceId: rabbitmq.id,
    //   name: 'rabbitmq_top',
    //   enabled: true,
    // });
    console.log('mongoCluster: ', mongoCluster);
    const dbUri = mongoCluster.connectionStrings.apply((cs) => {
      const url = new URL(cs[0].standardSrv);
      return $interpolate`mongodb+srv://${mongoUser.username}:${mongoUser.password}@${url.host}/streaming_video?appName=${mongoCluster.name}`;
    });
    const site = new sst.aws.Nextjs('WebFrontend', {
      path: 'fe',
      server: {
        architecture: 'x86_64',
        layers: ['arn:aws:lambda:ap-southeast-1:651200558258:layer:ffmpeg-x86:1'],
      },
      permissions: [
        {
          actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          resources: ['arn:aws:s3:::streaming-video-s3/*'],
        },
      ],
      // vpc,
      // link: [mongoUri, nextAuthUrl],
      environment: {
        DATABASE_URI: dbUri,
        MESSAGE_BROKER: rabbitmq.url,
        CACHER_URI: redisUri,
        AWS_S3_BUCKET_NAME: 'streaming-video-s3',
        FFMPEG: '/opt/bin/ffmpeg',
        FFPROBE: '/opt/bin/ffprobe',
      },
    });
    return {
      url: site.url,
      mongoConnectionString: dbUri,
      redisEndpoint: redisUri,
      rabbitmqUrl: rabbitmqUri,
    };
  },
});
