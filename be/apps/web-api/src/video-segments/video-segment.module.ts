import { MongooseModule } from '@nestjs/mongoose';
/*
https://docs.nestjs.com/modules
*/

import { Logger, Module } from '@nestjs/common';
import { VideoSegment, VideoSegmentSchema } from './entities/video-segment';
import { VideoSegmentController } from './video-segment.controller';

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
