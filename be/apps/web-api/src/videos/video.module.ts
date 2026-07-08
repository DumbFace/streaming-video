import { MongooseModule } from '@nestjs/mongoose';
import { VideoService } from './video.service';
/*
https://docs.nestjs.com/modules
*/
import { Logger, Module } from '@nestjs/common';
import { Video, VideoSchema } from './entities/video';
import { VideoController } from 'apps/web-api/src/videos/video.controller';
console.log(process.env.DATABASE_URI);

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.DATABASE_URI,
      }),
    }),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [VideoController],

  providers: [VideoService, Logger],
})
export class VideoModule {}
