/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'streaming-video-be',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    const { getSecret } = await import('@streaming-video/shared/cloud-infras/utils/get-secret.js');
    const { infrasName } =
      await import('@streaming-video/shared/cloud-infras/utils/infras.constant.js');

    const dbUri = getSecret('DATABASE_URI');
    const rabbitmqUri = getSecret('MESSAGE_BROKER_URI');
    const redisUri = getSecret('CACHER_URI');

    const vpc = new sst.aws.Vpc(`BeVpc-${$app.stage}`, {
      az: 2,
      nat: 'ec2',
      transform: {
        natInstance: {
          instanceType: 't4g.micro',
        },
      },
    });

    const cluster = new sst.aws.Cluster(`BeCluster-${$app.stage}`, { vpc });

    const worker = new sst.aws.Service(`NestjsWorker-${$app.stage}`, {
      cluster,
      image: {
        dockerfile: 'be/dockerfile',
        context: '../',
      },
      cpu: '0.5 vCPU',
      memory: '1 GB',

      environment: {
        DATABASE_URI: dbUri.version.secretString,
        MESSAGE_BROKER_URI: rabbitmqUri.version.secretString,

        CDN_SERVER: infrasName.CDN_SERVER,
        AWS_S3_BUCKET_NAME: infrasName.bucketFullName,

        //TODO Consider removing those lines
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      scaling: {
        min: 1,
        max: 1,
        cpuUtilization: 50,
        memoryUtilization: 60,
        requestCount: false,
      },
    });

    return {
      clusterName: cluster.nodes.cluster.name,
    };
  },
});
