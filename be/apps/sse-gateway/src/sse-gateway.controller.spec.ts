import { Test, TestingModule } from '@nestjs/testing';
import { SseGatewayController } from './sse-gateway.controller';
import { SseGatewayService } from './sse-gateway.service';

describe('SseGatewayController', () => {
  let sseGatewayController: SseGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SseGatewayController],
      providers: [SseGatewayService],
    }).compile();

    sseGatewayController = app.get<SseGatewayController>(SseGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sseGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
