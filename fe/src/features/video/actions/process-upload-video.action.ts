'use server';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ffmpeg from 'fluent-ffmpeg';
import { FnResponse } from '@/src/lib/fn-response';

const ALLOWED_TYPES = [
  'video/mp4',
  // "video/mkv",
  // "video/quicktime",
  // "video/x-matroska",
];

export async function processUploadedVideoAction(fileKey: string, directory: string) {
  const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

  try {
    if (!BUCKET_NAME) return FnResponse.Fail('BUCKET_NAME couldnt be null');
    if (!process.env.FFMPEG || !process.env.FFPROBE)
      throw new Error('FFMPEG or FFPROBE coudnt be null or undefined ');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const s3 = new S3Client({ region: 'ap-southeast-1' });

    const getCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey });

    const presignedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

    if (!presignedUrl) {
      return FnResponse.Fail('There is something wrong with presignedUrl!');
    }

    ffmpeg.setFfmpegPath(process.env.FFMPEG);
    ffmpeg.setFfprobePath(process.env.FFPROBE);

    const duration: number = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(presignedUrl, (err, metadata) => {
        if (err) {
          const error = err as Error;
          return reject(error);
        }

        const duration = metadata.format.duration;
        if (typeof duration !== 'number' || duration <= 0) {
          return reject(FnResponse.Fail('Video duration is invalid'));
        }

        if (duration && duration > 0) {
          resolve(duration);
        }
      });
    });

    const segmentTime = 30;
    const index = Math.ceil(duration / segmentTime);

    return FnResponse.Succeed<any>('Upload video Successfully', {
      url: presignedUrl,
      totalChunks: index,
      directory: `videos/${uniqueSuffix}/`,
    });
  } catch (error: any) {
    const err = error as Error;
    return FnResponse.Fail('Upload video unsuccessful!', {
      name: err.name,
      message: err.message,
      code: 500,
    });
  }
}
