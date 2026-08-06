import * as aws from '@pulumi/aws';
import { Bucket } from '@pulumi/aws/s3';
import * as fs from 'fs';
import { createSecret } from './utils/create-secret';
import * as cloudflare from '@pulumi/cloudflare';
import { infrasName } from './utils/infras.constant';

export async function createVideoCdn(videoBucket: Bucket) {
  const cloudflareProvider = new cloudflare.Provider('cloudflare', {
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  });

  const originId = `streaming-video-s3-hls-origin-${$app.stage}`;

  const usEast1 = new aws.Provider('usEast1', {
    region: 'us-east-1',
  });

  const cert = new aws.acm.Certificate(
    `infras-cdnCert-${$app.stage}`,
    {
      domainName: infrasName.alternativeCdnDsn,
      validationMethod: 'DNS',
    },
    { provider: usEast1 },
  );

  const zone = await cloudflare.getZone({
    filter: {
      name: 'dumbface.org',
      match: 'all',
    },
  });

  const validationRecord = new cloudflare.DnsRecord(
    `infras-cdnCertValidation-${$app.stage}`,
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
    `infras-cdnCertValidationDone-${$app.stage}`,
    {
      certificateArn: cert.arn,
      validationRecordFqdns: [validationRecord.name],
    },
    { provider: usEast1 },
  );

  const oacName = `infras-video-streaming-oac-${$app.stage}`;
  const oac = new aws.cloudfront.OriginAccessControl(oacName, {
    name: oacName,
    originAccessControlOriginType: 's3',
    signingBehavior: 'always',
    signingProtocol: 'sigv4',
  });

  const publicKey = new aws.cloudfront.PublicKey(`infras-videoSigningKey-${$app.stage}`, {
    encodedKey: fs.readFileSync('cloud-infras/credentials/public_key.pem', 'utf-8'),
    comment: 'Key to verify signed cookies for video streaming',
  });

  const keyGroupName = `infras-videoKeyGroup-${$app.stage}`;

  const keyGroup = new aws.cloudfront.KeyGroup(keyGroupName, {
    name: keyGroupName,
    items: [publicKey.id],
  });

  // 4. CloudFront Function — bypass signed-cookie check cho OPTIONS preflight
  //   const corsPreflightFn = new aws.cloudfront.Function('hlsCorsPreflight', {
  //     runtime: 'cloudfront-js-2.0',
  //     code: `
  //         function handler(event) {
  //             var request = event.request;
  //             if (request.method === 'OPTIONS') {
  //                 return {
  //                     statusCode: 204,
  //                     statusDescription: 'No Content',
  //                     headers: {
  //                         'access-control-allow-origin': { value: 'https://streaming.dumbface.org' },
  //                         'access-control-allow-credentials': { value: 'true' },
  //                         'access-control-allow-methods': { value: 'GET, HEAD, OPTIONS' },
  //                         'access-control-allow-headers': { value: 'Range, Content-Type' },
  //                         'access-control-max-age': { value: '600' },
  //                     },
  //                 };
  //             }
  //             return request;
  //         }`,
  //   });

  // 5. Response Headers Policy — CORS cho request GET/HEAD
  const corsPolicyName = `infras-streaming-video-cors-${$app.stage}`;
  const corsPolicy = new aws.cloudfront.ResponseHeadersPolicy(corsPolicyName, {
    name: corsPolicyName,
    corsConfig: {
      accessControlAllowCredentials: true,
      accessControlAllowOrigins: { items: [infrasName.applicationOrigin] },
      accessControlAllowHeaders: { items: ['Range', 'Content-Type'] },
      accessControlAllowMethods: { items: ['GET', 'HEAD'] },
      accessControlMaxAgeSec: 600,
      originOverride: true,
    },
  });

  // 6. Distribution
  const distribution = new aws.cloudfront.Distribution(`infras-videoCdn-${$app.stage}`, {
    enabled: true,
    comment: `infras-HLS streaming distribution-${$app.stage}`,
    aliases: [infrasName.alternativeCdnDsn],

    origins: [
      {
        originId: originId,
        domainName: videoBucket.bucketRegionalDomainName,
        originAccessControlId: oac.id,
      },
    ],

    defaultCacheBehavior: {
      targetOriginId: originId,
      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: ['GET', 'HEAD'],
      cachedMethods: ['GET', 'HEAD'],
      compress: true,
      trustedKeyGroups: [keyGroup.id],
      responseHeadersPolicyId: corsPolicy.id,
      //   functionAssociations: [
      //     {
      //       eventType: 'viewer-request',
      //       functionArn: corsPreflightFn.arn,
      //     },
      //   ],
      cachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized (managed)
    },

    viewerCertificate: {
      acmCertificateArn: certValidation.certificateArn,
      sslSupportMethod: 'sni-only',
      minimumProtocolVersion: 'TLSv1.2_2021',
    },

    restrictions: {
      geoRestriction: { restrictionType: 'none' },
    },
  });

  const cdnAliasRecord = new cloudflare.DnsRecord(
    `infras-cdnAlias-${$app.stage}`,
    {
      zoneId: zone.id,
      name: infrasName.alternativeCdnDsn.split('.')[0],
      type: 'CNAME',
      content: distribution.domainName,
      proxied: false,
      ttl: 60,
    },
    { provider: cloudflareProvider },
  );

  const bucketPolicy = new aws.s3.BucketPolicy(`infras-videoBucketPolicy-${$app.stage}`, {
    bucket: videoBucket.id,
    policy: $jsonStringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipalReadOnly',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com',
          },
          Action: 's3:GetObject',
          Resource: $interpolate`${videoBucket.arn}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': distribution.arn,
            },
          },
        },
        {
          Sid: 'AllowPublicPutObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:PutObject',
          Resource: $interpolate`${videoBucket.arn}/*`,
        },
      ],
    }),
  });

  const keyPair = keyGroup.items[0];
  const keyPairSecret = createSecret('CLOUDFRONT_KEY_PAIR_ID', keyPair);
  return { keyPair };
}
