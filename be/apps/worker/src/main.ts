import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672/'],
      queue: 'video_processor_queue',
      exchange: 'video_processor_exchange',
      routingKey: '',
      queueOptions: {
        durable: true,
      },
      exchangeType: 'fanout',
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
