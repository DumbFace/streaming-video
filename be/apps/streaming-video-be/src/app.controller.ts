import ffmpeg from 'fluent-ffmpeg';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as fs from 'fs';

import { AppService, VideoService } from './app.service';
import type { Response } from 'express';
import path, { join } from 'path';

@UseGuards()
@Controller('videos')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
    // private readonly videoService: VideoProcessingService,
    private readonly videoService: VideoService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/test')
  test(): string {
    return 'Test';
  }

  @Post()
  async post(
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    this.videoService.createVideo(title, description);
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
}
