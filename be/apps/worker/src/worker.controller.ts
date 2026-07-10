import { Body, Controller, Get } from '@nestjs/common';

import { S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import path from 'path';

import { WorkerService } from './worker.service';

const s3 = new S3Client({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const bucketName = process.env.AWS_S3_BUCKET_NAME;

@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Get()
  async slicingVideo(
    @Body('videoUrl') videoUrl: string,
    @Body('index') index: number,
  ) {
    var result = await this.workerService.sliceVideoAsync({
      videoUrl: videoUrl ?? '/home/kangfarmfun/Videos/video.mp4',
      index: index ?? 0,
    });

    return result;
  }

  @Get('uploadVideo')
  async uploadVideo(
    @Body('videoUrl') videoUrl: string,
    @Body('key') key: string,
  ) {
    var result = await this.workerService.uploadChunk(
      { videoFilePath: videoUrl },
      `videos/${key}`,
    );

    return result;
  }

  @Get('crashRAM')
  async crashRAM(@Body('path') path: string) {
    console.log('Bắt đầu nạp video vào RAM...');

    // fs.readFile sẽ cào TOÀN BỘ dữ liệu của file ở ổ cứng
    // và nhồi nhét tất cả vào một biến duy nhất (data) nằm trên RAM.
    fs.readFile(path, (err, data) => {
      if (err) {
        console.log('Lỗi:', err);
        return;
      }
      // Đoạn code này sẽ KHÔNG BAO GIỜ chạy tới được nếu file quá 2GB
      console.log('Đã nạp xong! Kích thước data:', data.length);
    });
  }
}
