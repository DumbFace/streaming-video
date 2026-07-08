import { MongooseModule } from '@nestjs/mongoose';
/*
https://docs.nestjs.com/modules
*/

import { Logger, Module } from '@nestjs/common';
import { VideoSegmentController } from 'apps/web-api/src/controllers/video-segment.controller';
import { VideoSegment, VideoSegmentSchema } from './entities/video-segment';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://mongo_user:mongo_pass@localhost:27017/streaming_video?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: VideoSegment.name, schema: VideoSegmentSchema },
    ]),
  ],
  controllers: [VideoSegmentController],
  providers: [Logger],
})
export class VideoSegmentModule {}
