/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'streaming-video-infras',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: { region: 'ap-southeast-1' },
        cloudflare: '6.18.0',
        mongodbatlas: '4.12.0',
        cloudamqp: '3.31.0',
        '@upstash/pulumi': '0.5.0',
      },
    };
  },
  async run() {
    const [cloudfrontModule, bucketModule, cachingModule, messageBrokerModule, dbModule] =
      await Promise.all([
        import('./cloud-infras/create-cloudfront.js'),
        import('./cloud-infras/create-bucket.js'),
        import('./cloud-infras/create-Caching.js'),
        import('./cloud-infras/create-message-broker.js'),
        import('./cloud-infras/create-db.js'),
      ]);
    const { createVideoCdn } = cloudfrontModule;
    const { createBucket } = bucketModule;
    const { createCaching } = cachingModule;
    const { createMessageBroker } = messageBrokerModule;
    const { createDb } = dbModule;

    // //* Deploy database
    const dbUri = await createDb();
    dbUri.apply((uri) => {
      console.log('✅ Mongo Database deployed successfully!');
      console.log('db: ', uri);
    });
    console.log('creating createDb');

    // //* Deploy caching
    const redisUri = await createCaching();
    redisUri.apply((uri) => {
      console.log('✅ Upstash Redis deployed successfully!');
      console.log('redisUri: ', uri);
    });

    // //* Deploy message broker
    const rabbitmqUri = await createMessageBroker();
    rabbitmqUri.apply((uri) => {
      console.log('✅ Message broker deployed successfully!');
      console.log('rabbitmqUri: ', uri);
    });

    // * Deploy Bucket
    const response = await createBucket();
    response.bucketUrl.apply((uri) => {
      console.log('✅ Bucket deployed successfully!');
      console.log('S3: ', uri);
    });

    // * Deploy CloudFront
    const { keyPair } = await createVideoCdn(response.videoBucket);
    keyPair.apply((keyPair) => {
      console.log('✅ Distribution deploy successfully!');
      console.log('key: ', keyPair);
    });

    return {};
  },
});
