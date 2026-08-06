import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { infrasName } from './utils/infras.constant';

export async function createBucket() {
  // const bucketName = 'streaming-video-s3';
  // const bucketFullName = `${infrasName.bucketName}-${$app.stage}`;
  // 1. Bucket chứa video (HLS manifest + segments)
  const videoBucket = new aws.s3.Bucket(infrasName.bucketFullName, {
    bucket: infrasName.bucketFullName,
    forceDestroy: $app.stage !== 'prod',
  });

  // 2. Chặn toàn bộ public access — bucket chỉ được đọc qua CloudFront OAC
  const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(`videoBucketPab-${$app.stage}`, {
    bucket: videoBucket.id,

    blockPublicAcls: true,
    ignorePublicAcls: true,

    blockPublicPolicy: false,
    restrictPublicBuckets: false,
  });

  // 3. Server-side encryption mặc định (khớp với header x-amz-server-side-encryption bạn từng thấy trong curl)
  const encryption = new aws.s3.BucketServerSideEncryptionConfiguration(
    `videoBucketEncryption-${$app.stage}`,
    {
      bucket: videoBucket.id,
      rules: [
        {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: 'AES256',
          },
        },
      ],
    },
  );

  // 4. CORS config Ở CẤP S3 — chỉ cần thiết nếu backend dùng presigned URL để browser
  // upload trực tiếp lên S3 (PUT). Nếu upload luôn đi qua backend NestJS (server-to-server),
  // có thể bỏ qua bước này vì mọi request đọc video đã đi qua CloudFront, không chạm S3 trực tiếp.
  // const bucketCors = new aws.s3.BucketCorsConfiguration('videoBucketGetCors', {
  //   bucket: videoBucket.id,
  //   corsRules: [
  //     {
  //       allowedOrigins: ['https://streaming.dumbface.org'],
  //       allowedMethods: ['PUT', 'GET', 'HEAD'],
  //       allowedHeaders: ['*'],
  //       exposeHeaders: ['ETag'],
  //       maxAgeSeconds: 3000,
  //     },
  //   ],
  // });
  // const origin = $app.stage === 'prod' ? 'streaming' : `streaming-${$app.stage}`;
  const bucketCors = new aws.s3.BucketCorsConfiguration(`videoBucketCors-${$app.stage}`, {
    bucket: videoBucket.id,
    corsRules: [
      {
        allowedOrigins: [infrasName.applicationOrigin],
        allowedMethods: ['PUT', 'GET', 'HEAD'],
        allowedHeaders: ['*'],
        exposeHeaders: ['ETag'],
        maxAgeSeconds: 3600,
      },
    ],
  });

  const uri = pulumi.all([videoBucket.id]).apply(([name]) => {
    return $interpolate`s3://${name}/`;
  });

  return { bucketUrl: uri, videoBucket: videoBucket };
}
