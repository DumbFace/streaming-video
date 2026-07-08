/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';

@Controller('video-segment')
export class VideoSegmentController {
  constructor() {}

  @Get()
  get() {
    return 'Ok';
  }
}
