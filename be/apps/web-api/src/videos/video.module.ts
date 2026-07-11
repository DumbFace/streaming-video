import { MongooseModule } from '@nestjs/mongoose';
import { VideoService } from './video.service';
/*
https://docs.nestjs.com/modules
*/
import { Logger, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Video, VideoSchema } from './entities/video';
import { VideoController } from './video.controller';
console.log(process.env.DATABASE_URI);

@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'WORKER_CLIENT',
    //     transport: Transport.RMQ,
    //     options: {
    //       // urls: ['amqp://guest:guest@localhost:5672/'],
    //       // queue: 'cats_queue',
    //       // queueOptions: {
    //       //   durable: true,
    //       // },
    //     },
    //   },
    // ]),

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
