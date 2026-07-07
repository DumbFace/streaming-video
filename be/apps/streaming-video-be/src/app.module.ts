import { MongooseModule } from '@nestjs/mongoose';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, VideoService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Video, VideoSchema, DomainModule } from '@app/domain';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forRoot(
      'mongodb://mongo_user:mongo_pass@localhost:27017/streaming_video?authSource=admin',
    ),
    DomainModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public'),
      serveRoot: '/public',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, Logger, VideoService],
})
export class AppModule {}
