import { VideoModule } from 'apps/web-api/src/videos/video.module';
import { Module } from '@nestjs/common';
import { VideoSegmentModule } from 'apps/web-api/src/video-segments/video-segment.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
