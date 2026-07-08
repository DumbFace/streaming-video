import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateVideoDto } from 'apps/web-api/src/videos/models/create-video.dto';
import { GetVideoDto } from './models/get-video.dto';
import { VideoService } from 'apps/web-api/src/videos/video.service';
import { PatchVideoDto } from 'apps/web-api/src/videos/models/patch-video.dto';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
      // storage: diskStorage({
      //   destination: process.env.VIDEO_DIRECTORY,
      //   filename: (req, file, callback) => {
      //     const uniqueSuffix =
      //       Date.now() + '-' + Math.round(Math.random() * 1e9);
      //     const ext = extname(file.originalname);
      //     callback(null, `${uniqueSuffix}${ext}`);
      //   },
      // }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4|mkv|quicktime|x-matroska)$/)) {
          return callback(
            new BadRequestException('Only video files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      // limits: {
      //   fileSize: 100 * 1024 * 1024,
      // },
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
}

// @Post('process')
// @HttpCode(HttpStatus.OK)
// async processVideo(
//   @Body('name') name: string,
//   @Body('startTime') startTime: string,
//   @Body('inputPath') inputPath: string,
//   @Body('outputDir') outputDir: string,
//   @Res() res: Response,
// ) {
//   const abortController = new AbortController();

//   res.on('close', () => {
//     if (!abortController.signal.aborted) {
//       this.logger.warn(
//         '⚠️ HTTP connection closed early by client! Aborting service task...',
//       );
//       abortController.abort();
//     }
//   });

//   this.logger.log('⏳ Request is processing...');
//   await this.videoService.splitVideoToHls(
//     name,
//     inputPath,
//     outputDir,
//     abortController.signal,
//   );

//   return { success: true };
// }
