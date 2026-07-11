import ffmpeg from 'fluent-ffmpeg';
import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { VideoSegment } from 'apps/worker/src/entities/video-segment';
import { VideoSegmentSchema } from './entities/video-segment';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(VideoSegment.name)
    private readonly videoSegmentSchema: Model<VideoSegment>,
  ) {}
  private readonly logger = new Logger(WorkerService.name);

  getHello(): string {
    return 'Hello World!';
  }

  async sliceVideoAsync(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({ success: true });
      const outputDirectory = 'public/chunks/';
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      // const outputFile = path.join(outputDirectory, `chunk_%03d.ts`);

      const outputFile = path.join(outputDirectory, `chunk_%03d.ts`);
      const startTime = data.index * 30;

      const ffmpegCommand = ffmpeg(data.videoUrl)
        .seekInput(startTime)
        .outputOptions([
          '-t',
          '30', // Limit duration to 30s
          '-c:v',
          'libx264', // Video codec
          '-c:a',
          'aac', // Audio codec
          '-f',
          'segment', // Use segment format
          '-segment_start_number',
          `${data.index}`, // Dynamic start number
          '-segment_time',
          '30', // Dynamic target segment length
        ])

        .output(outputFile)

        .on('end', () => {
          this.logger.log('Video successfully split into HLS chunks!');
          resolve({ success: true });
        })
        .on('error', (err) => {
          this.logger.error(`Error chunking video: ${err.message}`);
          reject(err);
        });
      ffmpegCommand.run();
    });
  }

  async create(data: Partial<VideoSegment>): Promise<VideoSegment> {
    return new this.videoSegmentSchema(data).save();
  }

  async findById(id: string): Promise<VideoSegment | null> {
    return this.videoSegmentSchema.findById(id).exec();
  }

  async findAll(): Promise<VideoSegment[]> {
    return this.videoSegmentSchema.find().exec();
  }

  async update(
    id: string,
    data: Partial<VideoSegment>,
  ): Promise<VideoSegment | null> {
    return this.videoSegmentSchema
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    return !!this.videoSegmentSchema.findByIdAndDelete(id).exec();
  }
}
