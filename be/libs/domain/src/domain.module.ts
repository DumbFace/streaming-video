import { Module } from '@nestjs/common';
import { Video, VideoSchema } from 'libs/domain/src/entities/video';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class DomainModule {}
