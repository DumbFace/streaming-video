import { MongooseModule } from '@nestjs/mongoose';
import { VideoService } from './video.service';
/*
https://docs.nestjs.com/modules
*/
import { Logger, Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { SharedModule } from '@lib/shared/src/shared.module';
console.log(process.env.DATABASE_URI);

@Module({
  imports: [
    SharedModule,
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.DATABASE_URI,
      }),
    }),
  ],
  controllers: [VideoController],

  providers: [VideoService, Logger],
})
export class VideoModule {}
