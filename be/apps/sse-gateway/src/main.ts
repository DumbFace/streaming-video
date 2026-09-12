import { NestFactory } from '@nestjs/core';
import { SseGatewayModule } from './sse-gateway.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(SseGatewayModule);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.port ?? 3100);
}
bootstrap();
