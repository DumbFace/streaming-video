import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Video } from '@lib/src/classes/video.class';
import { VideoSchema } from '@lib/src/schemas/video.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }])],
  providers: [SharedService],
  exports: [SharedService, MongooseModule],
})
export class SharedModule {}
