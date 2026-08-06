// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'streaming-video-fe',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: { region: 'ap-southeast-1' },
        cloudflare: '6.18.0',
      },
    };
  },
  async run() {
    const cloudflare = await import('@pulumi/cloudflare');
    const { getSecret } = await import('@streaming-video/shared/cloud-infras/utils/get-secret.js');
    const { infrasName } =
      await import('@streaming-video/shared/cloud-infras/utils/infras.constant.js');
    const cloudflareProvider = new cloudflare.Provider('cloudflare', {
      apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    });
    const usEast1 = new aws.Provider('usEast1', {
      region: 'us-east-1',
    });

    const dnsRecord = infrasName.alternativeApplicationDNS.split('.')[0];

    const zone = await cloudflare.getZone({
      filter: {
        name: 'dumbface.org',
        match: 'all',
      },
    });

    const cert = new aws.acm.Certificate(
      `fe-cdnCert-${$app.stage}`,
      {
        domainName: infrasName.alternativeApplicationDNS,
        validationMethod: 'DNS',
      },
      { provider: usEast1 },
    );

    const validationRecord = new cloudflare.DnsRecord(
      `fe-cdnCertValidation-${$app.stage}`,
      {
        zoneId: zone.id,
        name: cert.domainValidationOptions[0].resourceRecordName,
        type: cert.domainValidationOptions[0].resourceRecordType,
        content: cert.domainValidationOptions[0].resourceRecordValue,
        ttl: 60,
        proxied: false,
      },
      { provider: cloudflareProvider },
    );

    const certValidation = new aws.acm.CertificateValidation(
      `fe-cdnCertValidationDone-${$app.stage}`,
      {
        certificateArn: cert.arn,
        validationRecordFqdns: [validationRecord.name],
      },
      { provider: usEast1 },
    );

    const dbUri = getSecret('DATABASE_URI');
    const rabbitmqUri = getSecret('MESSAGE_BROKER_URI');
    const redisUri = getSecret('CACHER_URI');
    const keyPairSecret = getSecret('CLOUDFRONT_KEY_PAIR_ID');

    const site = new sst.aws.Nextjs(`WebFrontEnd-${$app.stage}`, {
      domain: {
        name: infrasName.alternativeApplicationDNS,
        dns: false,
        cert: certValidation.certificateArn,
      },

      server: {
        architecture: 'x86_64',
        layers: ['arn:aws:lambda:ap-southeast-1:651200558258:layer:ffmpeg-x86:1'],
      },
      permissions: [
        {
          actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          resources: [`arn:aws:s3:::${infrasName.bucketFullName}/*`],
        },
      ],
      // vpc,
      // link: [mongoUri, nextAuthUrl],
      environment: {
        MESSAGE_BROKER_URI: rabbitmqUri.version.secretString,
        CACHER_URI: redisUri.version.secretString,
        DATABASE_URI: dbUri.version.secretString,
        CLOUDFRONT_KEY_PAIR_ID: keyPairSecret.version.secretString,
        CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,

        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD!,

        SMTP_SERVER: infrasName.SMTP_SERVER!,
        SMTP_PORT: infrasName.SMTP_PORT,
        SMTP_FROM: infrasName.SMTP_FROM!,
        SMTP_TO: infrasName.SMTP_TO!,
        AUTH_TRUST_HOST: infrasName.AUTH_TRUST_HOST,

        GOOGLE_CLIENT_ID: infrasName.GOOGLE_CLIENT_ID!,

        AWS_S3_BUCKET_NAME: infrasName.bucketFullName,
        FFMPEG: infrasName.FFMPEG!,
        FFPROBE: infrasName.FFPROBE!,
        CLOUDFRONT_DOMAIN: infrasName.alternativeCdnDsn,
        COOKIE_DOMAIN: `.${infrasName.cloudflareDNS}`,
        NEXTAUTH_URL: infrasName.applicationOrigin,
      },
    });
    const cdn = site.nodes.cdn;

    if (!$dev && cdn) {
      const cloudFrontDomain = cdn.url.apply((url) => {
        const hostname = new URL(url).hostname;
        console.log('CloudFront hostname:', hostname);
        return hostname;
      });

      new cloudflare.DnsRecord(
        `nextAppAlias-${$app.stage}`,
        {
          zoneId: zone.id,
          name: dnsRecord,
          type: 'CNAME',
          content: cloudFrontDomain,
          proxied: false,
          ttl: 60,
        },
        { provider: cloudflareProvider },
      );
    }
  },
});
