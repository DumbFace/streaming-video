import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetVideoDto } from './models/get-video.dto';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { VideoService } from './video.service';
import { PatchVideoDto } from './models/patch-video.dto';
import { CreateVideoDto } from './models/create-video.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  RmqRecordBuilder,
  Transport,
} from '@nestjs/microservices';

const s3 = new S3Client({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

@Controller('videos')
export class VideoController {
  constructor(
    private readonly logger: Logger,
    private readonly videoService: VideoService,
    // @Inject('WORKER_CLIENT') private readonly client: ClientProxy,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME || '',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `videos/${uniqueSuffix}${ext}`);
        },
      }),

      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4|mkv|quicktime|x-matroska)$/)) {
          return callback(
            new BadRequestException('Only video files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async post(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile()
    file: Express.Multer.File & {
      location: string;
      key: string;
      bucket: string;
    },
  ) {
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    console.log('presigned url: ', presignedUrl);
    var newVideo = await this.videoService.create(createVideoDto, file);

    return {
      ...newVideo,
      videoUrl: presignedUrl,
    };
  }

  @Get()
  async get(): Promise<GetVideoDto[]> {
    return await this.videoService.findAll();
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body('data') patchVideoDto: PatchVideoDto,
  ): Promise<GetVideoDto> {
    var video = await this.videoService.update(id, patchVideoDto);

    return new GetVideoDto(video);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return await this.videoService.delete(id);
  }

  @Post('slice-video')
  async publishMessageCat(
    @Body('directory') directory: string,
    @Body('index') index: number,
    @Body('videoUrl') videoUrl: string,
  ) {
    const dynamicClient: ClientProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672/'],
        exchange: 'video_processor_exchange',
        routingKey: '',
        exchangeType: 'fanout',
      },
    });

    await dynamicClient.connect();
    console.log(videoUrl);
    console.log(index);
    console.log(directory);

    dynamicClient.emit('', {
      videoUrl: videoUrl,
      index: index,
      directory: directory,
    });

    return { message: 'Publish Successful' };
  }
}
