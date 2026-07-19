import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { SharedModule } from '@lib/shared/src';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'video.slicing.exchange',
          type: 'x-delayed-message',
          options: {
            arguments: {
              'x-delayed-type': 'fanout',
            },
          },
        },
        {
          name: 'video.slicing.error.exchange',
          type: 'fanout',
        },
        {
          name: 'video.producing.master.file.exchange',
          type: 'x-delayed-message',
          options: {
            arguments: {
              'x-delayed-type': 'fanout',
            },
          },
        },
        {
          name: 'video.producing.master.error.exchange',
          type: 'fanout',
        },
        {
          name: 'test.exchange',
          type: 'x-delayed-message',
          options: {
            arguments: {
              'x-delayed-type': 'fanout',
            },
          },
        },
        {
          name: 'test.error.exchange',
          type: 'fanout',
        },
      ],
      queues: [
        {
          name: 'video.slicing.error.queue',
          routingKey: '',
          exchange: 'video.slicing.error.exchange',
        },
        {
          name: 'test.error.queue',
          routingKey: '',
          exchange: 'test.error.exchange',
        },
        {
          name: 'video.producing.master.error.queue',
          routingKey: '',
          exchange: 'video.producing.master.error.exchange',
        },
        {
          name: 'video.slicing.error.queue',
          routingKey: '',
          exchange: 'video.slicing.error.exchange',
        },
      ],
      prefetchCount: 1,
      uri: process.env.MESSAGE_BROKER as string,
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
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
})
export class WorkerModule {}
