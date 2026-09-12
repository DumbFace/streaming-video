import { Body, Controller, Get, Post, Query, Req, Sse, UseGuards } from '@nestjs/common';

import * as fs from 'fs';

import { WorkerService } from './worker.service';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Get()
  async slicingVideo(@Body('videoUrl') videoUrl: string, @Body('index') index: number) {
    var result = await this.workerService.sliceVideoAsync({
      videoUrl: videoUrl ?? '/home/kangfarmfun/Videos/video.mp4',
      index: index ?? 0,
    });

    return result;
  }

  @Get('uploadVideo')
  async uploadVideo(@Body('videoUrl') videoUrl: string, @Body('key') key: string) {
    var result = await this.workerService.uploadChunk({ videoFilePath: videoUrl }, `videos/${key}`);

    return result;
  }

  @Get('crashRAM')
  async crashRAM(@Body('path') path: string) {
    console.log('Bắt đầu nạp video vào RAM...');

    fs.readFile(path, (err, data) => {
      if (err) {
        console.log('Lỗi:', err);
        return;
      }
      console.log('Đã nạp xong! Kích thước data:', data.length);
    });
  }

  @Post('slicing-directly')
  async slicing(@Body('videoUrl') videoUrl: string, @Body('index') index: number) {
    const outputDirectory = 'public/chunks/';
    const outputFile = path.join(outputDirectory, `chunk_%d.ts`);
    const result = await new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg(videoUrl)
        .seekInput(index * 30)
        .outputOptions([
          '-t',
          '30',
          '-c:v',
          'libx264',
          '-c:a',
          'aac',
          '-f',
          'segment',
          '-segment_start_number',
          `${index}`,
          '-segment_time',
          '30',
          '-threads',
          '1',
        ])
        .output(outputFile)
        .on('end', async () => {
          const outputFile = path.join(outputDirectory, `chunk_${index}.ts`);
          const duration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(outputFile, (err, metadata) => {
              if (err) {
                return reject(err);
              }

              const duration = metadata.format.duration;

              resolve(duration);
            });
          });
          resolve({
            success: true,
            videoFilePath: path.join(outputDirectory, `chunk_${index}.ts`),
            duration: duration,
          });
        })
        .on('error', (err) => {
          reject(err);
        });

      ffmpegCommand.run();
    });
  }
}
