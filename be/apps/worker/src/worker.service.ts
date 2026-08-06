import ffmpeg from 'fluent-ffmpeg';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist';
import { AmqpConnection, Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as amqplib from 'amqplib';

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { StatusVideo, StatusVideoSegment } from '@streaming-video/shared';
import { Video } from '@lib/src/classes/video.class';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Video.name)
    private readonly videoSchema: Model<Video>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  s3 = new S3Client({
    region: 'ap-southeast-1',
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
          const outputFile = path.join(outputDirectory, `chunk_${data.index}.ts`);
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
    queue: 'video.slicing.main.queue',
    exchange: 'video.slicing.main.exchange',
    routingKey: 'video.slicing.main.route',
    queueOptions: {
      deadLetterExchange: 'video.slicing.error.exchange',
      deadLetterRoutingKey: 'video.slicing.error.route',
    },
  })
  public async processVideo(data: any, amqpMsg: amqplib.ConsumeMessage) {
    const retryCount = (amqpMsg.properties.headers?.['x-retry-count'] ?? 0) as number;
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
        const url = new URL(result.Location);
        await this.addSegment(data.videoId, {
          url: `${url.pathname}`,
          status: StatusVideoSegment.uploaded,
          duration: response.duration,
          order: Number(data.index + 1),
        });

        this.amqpConnection.publish(
          'video.producing.master.main.exchange',
          'video.producing.master.main.route',
          {
            videoId: data.videoId,
          },
        );

        console.log('Acknowledge video ', data.index);
      }
    } catch (error: any) {
      console.error('Processing failed', error);

      if (retryCount < 3) {
        await this.amqpConnection.publish(
          'video.slicing.wait.exchange',
          'video.slicing.wait.route',
          data,
          {
            headers: {
              ...amqpMsg.properties.headers,
              'x-retry-count': retryCount + 1,
            },
          },
        );
        return;
      }

      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    queue: 'video.producing.master.main.queue',
    exchange: 'video.producing.master.main.exchange',
    routingKey: 'video.producing.master.main.route',
    queueOptions: {
      deadLetterExchange: 'video.producing.master.error.exchange',
      deadLetterRoutingKey: 'video.producing.master.error.route',
    },
  })
  public async videoProducingMasterFile(data: any, amqpMsg: amqplib.ConsumeMessage) {
    const retryCount = (amqpMsg.properties.headers?.['x-retry-count'] ?? 0) as number;
    try {
      console.log('ProducingMasterFle receives message');
      var video = await this.findById(data.videoId);
      if (!video) {
        throw new NotFoundException(`Video not found for id ${data.videoId}`);
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
          const chunkUrl = new URL(segment.url, process.env.CDN_SERVER);

          m3u8Content += `#EXTINF:${segment.duration},\n`;
          m3u8Content += `${chunkUrl}\n`;
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
        console.log(`Uploaded ${progress.loaded} out of ${progress.total} bytes`);
      });
      var result = await parallelUploadToS3.done();

      if (!result.Location) return;

      const masterFilePath = new URL(result.Location).pathname;
      await this.update(data.videoId, {
        masterPlaylistUrl: `${process.env.CDN_SERVER}/${masterFilePath}`,
        status: StatusVideo.completed,
      });

      console.log('result: ', result);
    } catch (error: any) {
      console.error('Processing failed', error);
      if (retryCount < 3) {
        await this.amqpConnection.publish(
          'video.producing.master.wait.exchange',
          'video.producing.master.wait.route',
          data,
          {
            headers: {
              ...amqpMsg.properties.headers,
              'x-retry-count': retryCount + 1,
            },
          },
        );
        return;
      }

      return new Nack(false);
    }
  }

  // @RabbitSubscribe({
  //   exchange: 'video.producing.master.error.exchange',
  //   routingKey: 'video.producing.master.error.route',
  //   queue: 'video.producing.master.error.queue',
  // })
  // public async handleDeadLetter(data: any, amqpMsg: amqplib.ConsumeMessage) {
  //   await this.amqpConnection.publish(
  //     'video.producing.master.main.exchange',
  //     'video.producing.master.main.route',
  //     data,
  //   );
  // }
}
