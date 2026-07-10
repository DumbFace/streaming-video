import ffmpeg from 'fluent-ffmpeg';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Video } from '@lib/shared/src/classes/video.class';
import {
  AmqpConnection,
  Nack,
  RabbitMQModule,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import * as amqplib from 'amqplib';
import {
  StatusVideo,
  StatusVideoSegment,
} from '@lib/shared/src/enums/video.enum';

import { NotFound, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Video.name)
    private readonly videoSchema: Model<Video>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  s3 = new S3Client({
    region: process.env.AWS_REGION || '',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
  bucketName = process.env.AWS_S3_BUCKET_NAME;

  private readonly logger = new Logger(WorkerService.name);

  async sliceVideoAsync(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const outputDirectory = 'public/chunks/';
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      const outputFile = path.join(outputDirectory, `chunk_%d.ts`);
      const startTime = data.index * 30;

      const ffmpegCommand = ffmpeg(data.videoUrl)
        .seekInput(startTime)
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
          `${data.index}`,
          '-segment_time',
          '30',
          '-threads',
          '1',
        ])
        .output(outputFile)
        .on('end', async () => {
          this.logger.log('Video successfully split into HLS chunks!');
          const outputFile = path.join(
            outputDirectory,
            `chunk_${data.index}.ts`,
          );
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
            videoFilePath: path.join(outputDirectory, `chunk_${data.index}.ts`),
            duration: duration,
          });
        })
        .on('error', (err) => {
          this.logger.error(`Error chunking video: ${err.message}`);
          reject(err);
        });
      ffmpegCommand.run();
    });
  }

  async create(data: Partial<Video>): Promise<Video> {
    return new this.videoSchema(data).save();
  }

  async findById(id: string): Promise<Video | null> {
    return this.videoSchema.findById(id).exec();
  }

  async findAll(): Promise<Video[]> {
    return this.videoSchema.find().exec();
  }

  async update(id: string, data: Partial<Video>): Promise<Video | null> {
    return this.videoSchema.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    return !!this.videoSchema.findByIdAndDelete(id).exec();
  }

  async addSegment(id: string, segment: any): Promise<Video | null> {
    return this.videoSchema
      .findByIdAndUpdate(id, { $push: { segments: segment } }, { new: true })
      .exec();
  }

  delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async uploadChunk(data: any, key: string) {
    const fileStream = fs.createReadStream(data.videoFilePath);

    const parallelUploadToS3 = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: fileStream,
        ContentType: 'video/mp4',
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
    });

    parallelUploadToS3.on('httpUploadProgress', (progress) => {
      console.log(`Uploaded ${progress.loaded} out of ${progress.total} bytes`);
    });

    return await parallelUploadToS3.done();
  }

  @RabbitSubscribe({
    exchange: 'test.exchange',
    routingKey: '',
    queue: 'test.queue',
  })
  async test(data: any, amqpMsg: amqplib.ConsumeMessage) {
    const retryCount = (amqpMsg.properties.headers?.['x-retry-count'] ??
      0) as number;

    try {
      throw new NotFoundException('Test error queue!!!!!!!!!!!!!!!');
    } catch (error: any) {
      console.error('Processing failed', error.message);
      if (retryCount < 3) {
        this.amqpConnection.publish('test.exchange', '', data, {
          headers: { 'x-retry-count': retryCount + 1, 'x-delay': 3000 },
        });

        return;
      }

      this.amqpConnection.publish('test.error.exchange', '', data, {
        headers: {
          'x-retry-count': retryCount,
          'x-exception-message': error.message,
          'x-exception-stack': error.stack,
        },
      });

      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: 'video.slicing.exchange',
    routingKey: '',
    queue: 'video.slicing.queue',
  })
  public async processVideo(data: any, amqpMsg: amqplib.ConsumeMessage) {
    const retryCount = (amqpMsg.properties.headers?.['x-retry-count'] ??
      0) as number;
    try {
      console.log('data: ', data);
      console.log('amqpMsg: ', amqpMsg);
      var video = await this.findById(data.videoId);

      if (!video) {
        throw new NotFoundException('Video not found');
      }

      var response = await this.sliceVideoAsync(data);
      if (response.success) {
        const key = path.join(data.directory, `chunk_00${data.index}.ts`);
        console.log(`Key: ${key}`);

        console.log(`videoFilePath: ${response.videoFilePath}`);

        var result = await this.uploadChunk(response, key);

        if (!result.Key || !result.Location) {
          throw new Error(
            'S3 upload completed but returned an incomplete response (missing Key or Location).',
          );
        }

        await this.addSegment(data.videoId, {
          url: result.Location,
          status: StatusVideoSegment.uploaded,
          duration: response.duration,
          order: Number(data.index + 1),
        });

        this.amqpConnection.publish(
          'video.producing.master.file.exchange',
          '',
          {
            videoId: data.videoId,
          },
        );

        console.log('Acknowledge video ', data.index);
      }
    } catch (error: any) {
      console.error('Processing failed', error);
      if (retryCount < 3) {
        this.amqpConnection.publish('video.slicing.exchange', '', data, {
          headers: { 'x-retry-count': retryCount + 1, 'x-delay': 5000 },
        });
        return;
      }

      this.amqpConnection.publish('video.slicing.error.exchange', '', data, {
        headers: {
          'x-retry-count': retryCount,
          'x-exception-message': error.message,
          'x-exception-stack': error.stack,
        },
      });

      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: 'video.producing.master.file.exchange',
    routingKey: '',
    queue: 'video.producing.master.file.queue',
  })
  public async videoProducingMasterFile(
    data: any,
    amqpMsg: amqplib.ConsumeMessage,
  ) {
    const retryCount = (amqpMsg.properties.headers?.['x-retry-count'] ??
      0) as number;
    try {
      console.log('ProducingMasterFle receives message');
      var video = await this.findById(data.videoId);
      if (!video) {
        throw new NotFoundException('Video not found');
      }
      if (video.totalChunks != video.segments.length) {
        return true;
      }
      let m3u8Content = `#EXTM3U\n`;
      m3u8Content += `#EXT-X-VERSION:3\n`;
      m3u8Content += `#EXT-X-TARGETDURATION:30\n`;
      m3u8Content += `#EXT-X-MEDIA-SEQUENCE:0\n`;
      video.segments
        .sort((a, b) => a.order - b.order)
        .forEach((segment) => {
          console.log('segment: ', segment.order);
          m3u8Content += `#EXTINF:${segment.duration},\n`;
          m3u8Content += `${segment.url}\n`;
          m3u8Content += `#EXT-X-DISCONTINUITY\n\n`;
        });
      m3u8Content += `#EXT-X-ENDLIST\n`;
      const key = path.join(video.directory, `master.m3u8`);
      const parallelUploadToS3 = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: m3u8Content,
          ContentType: 'application/x-mpegURL',
        },
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
      });
      parallelUploadToS3.on('httpUploadProgress', (progress) => {
        console.log(
          `Uploaded ${progress.loaded} out of ${progress.total} bytes`,
        );
      });
      var result = await parallelUploadToS3.done();
      await this.update(data.videoId, {
        masterPlaylistUrl: result.Location,
        status: StatusVideo.completed,
      });
      console.log('result: ', result);
    } catch (error: any) {
      console.error('Processing failed', error);
      if (retryCount < 3) {
        this.amqpConnection.publish(
          'video.producing.master.file.exchange',
          '',
          data,
          {
            headers: { 'x-retry-count': retryCount + 1, 'x-delay': 5000 },
          },
        );
        return;
      }

      this.amqpConnection.publish(
        'video.producing.master.file.error.exchange',
        '',
        data,
        {
          headers: {
            'x-retry-count': retryCount,
            'x-exception-message': error.message,
            'x-exception-stack': error.stack,
          },
        },
      );

      return new Nack(false);
    }
  }
}
