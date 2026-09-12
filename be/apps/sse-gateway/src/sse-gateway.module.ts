import { Module } from '@nestjs/common';
import { SseGatewayController } from './sse-gateway.controller';
import { SseGatewayService } from './sse-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PublisherNotificationService } from './publiser-notification.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REDIS_BUS',
        transport: Transport.REDIS,
        options: {
          //TODO Use env var instead
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [SseGatewayController],
  providers: [SseGatewayService, PublisherNotificationService],
})
export class SseGatewayModule {}
