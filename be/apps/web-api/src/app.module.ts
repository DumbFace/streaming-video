import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { VideoModule } from './videos/video.module';
import { VideoSegmentModule } from './video-segments/video-segment.module';

@Module({
  imports: [
    VideoModule,
    VideoSegmentModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public'),
      serveRoot: '/public',
    }),
  ],
})
export class AppModule {}
