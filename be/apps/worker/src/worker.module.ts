import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SharedModule } from '@lib/src';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'video.slicing.main.exchange',
          type: 'direct',
        },
        {
          name: 'video.slicing.wait.exchange',
          type: 'direct',
        },
        {
          name: 'video.slicing.error.exchange',
          type: 'direct',
        },

        {
          name: 'video.producing.master.main.exchange',
          type: 'direct',
        },
        {
          name: 'video.producing.master.wait.exchange',
          type: 'direct',
        },
        {
          name: 'video.producing.master.error.exchange',
          type: 'direct',
        },
      ],
      queues: [
        {
          name: 'video.slicing.main.queue',
          exchange: 'video.slicing.main.exchange',
          routingKey: 'video.slicing.main.route',
          options: {
            durable: true,
            deadLetterExchange: 'video.slicing.error.exchange',
            deadLetterRoutingKey: 'video.slicing.error.route',
          },
        },
        {
          name: 'video.slicing.wait.queue',
          exchange: 'video.slicing.wait.exchange',
          routingKey: 'video.slicing.wait.route',
          options: {
            durable: true,
            messageTtl: 5000,
            deadLetterExchange: 'video.slicing.main.exchange',
            deadLetterRoutingKey: 'video.slicing.main.route',
          },
        },
        {
          name: 'video.slicing.error.queue',
          exchange: 'video.slicing.error.exchange',
          routingKey: 'video.slicing.error.route',
          options: { durable: true },
        },

        {
          name: 'video.producing.master.main.queue',
          exchange: 'video.producing.master.main.exchange',
          routingKey: 'video.producing.master.main.route',
          options: {
            durable: true,
            deadLetterExchange: 'video.producing.master.error.exchange',
            deadLetterRoutingKey: 'video.producing.master.error.route',
          },
        },
        {
          name: 'video.producing.master.wait.queue',
          exchange: 'video.producing.master.wait.exchange',
          routingKey: 'video.producing.master.wait.route',
          options: {
            durable: true,
            messageTtl: 5000,
            deadLetterExchange: 'video.producing.master.main.exchange',
            deadLetterRoutingKey: 'video.producing.master.main.route',
          },
        },
        {
          name: 'video.producing.master.error.queue',
          exchange: 'video.producing.master.error.exchange',
          routingKey: 'video.producing.master.error.route',
          options: { durable: true },
        },
      ],
      prefetchCount: 1,
      uri: process.env.MESSAGE_BROKER_URI as string,
      connectionInitOptions: { wait: false },
      deserializer: (message: Buffer, amqpMsg: any) => {
        const msgString = message.toString();

        if (!msgString) {
          return {};
        }

        try {
          return JSON.parse(msgString);
        } catch (error) {
          console.error(`Malformed JSON received: ${msgString}`);
          return { _raw: msgString, error: 'Invalid JSON' };
        }
      },
    }),
    SharedModule,
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.DATABASE_URI,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      // serveRoot: '/public',
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
})
export class WorkerModule {}
