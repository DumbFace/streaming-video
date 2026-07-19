'use server';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path, { extname } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import amqp from 'amqplib';
import connectDB from '@/src/lib/db';
import { VideoFormValues } from '@/src/features/video/components/dialog';
import { FnResponse } from '@/src/lib/fn-response';
import { Readable } from 'stream';
import { tmpdir } from 'os';

const ALLOWED_TYPES = [
  'video/mp4',
  // "video/mkv",
  // "video/quicktime",
  // "video/x-matroska",
];
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export async function uploadVideoAction(formData: VideoFormValues) {
  try {
    if (!formData.videoFile?.[0]) {
      return FnResponse.Fail('No video file provided');
    }

    const file = formData.videoFile[0];

    if (file.size === 0) {
      return FnResponse.Fail('No video file provided');
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return FnResponse.Fail('Only video files are allowed!');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.name);
    const fileKey = `videos/${uniqueSuffix}/raw${ext}`;

    const s3 = new S3Client({
      region: 'ap-southeast-1',
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const parallelUploads3 = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
      },
    });

    await parallelUploads3.done();

    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    if (!process.env.FFMPEG || !process.env.FFPROBE)
      throw new Error('FFMPEG or FFPROBE coudnt be null or undefined ');

    ffmpeg.setFfmpegPath(process.env.FFMPEG);
    ffmpeg.setFfprobePath(process.env.FFPROBE);

    const duration: number = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(presignedUrl, (err, metadata) => {
        if (err) {
          const error = err as Error;
          return FnResponse.Fail('There is something wrong with ffmpeg', {
            name: error.name,
            message: error.message,
            code: 500,
          });
        }

        const duration = metadata.format.duration;
        if (duration && duration > 0) {
          resolve(duration);
        }
        reject(err);
      });
    });

    if (!(duration && duration > 0 && presignedUrl)) {
      return FnResponse.Fail('There is something wrong with duration video or presignedUrl!');
    }

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
