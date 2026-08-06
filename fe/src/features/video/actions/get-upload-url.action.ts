'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { extname } from 'path';
import { FnResponse } from '@/src/lib/fn-response';

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export async function getUploadUrlAction(fileName: string, fileType: string) {
  try {
    if (!BUCKET_NAME) return FnResponse.Fail('BUCKET_NAME couldnt be null');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(fileName);
    const fileKey = `videos/${uniqueSuffix}/raw${ext}`;

    const s3 = new S3Client({ region: 'ap-southeast-1' });

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 300 });

    return FnResponse.Succeed('Get upload URL successful', {
      uploadUrl,
      fileKey,
      directory: `videos/${uniqueSuffix}/`,
    });
  } catch (error: any) {
    const err = error as Error;
    return FnResponse.Fail('Get upload URL unsuccessful!', {
      name: err.name,
      message: err.message,
      code: 500,
    });
  }
}
