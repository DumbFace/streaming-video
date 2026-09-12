import { Controller, Get, Inject, Query, Sse } from '@nestjs/common';
import { SseGatewayService } from './sse-gateway.service';
import { Observable } from 'rxjs';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('sse-gateway')
export class SseGatewayController {
  constructor(
    private readonly sseGatewayService: SseGatewayService,
    @Inject('REDIS_BUS') private readonly redisBus: any,
  ) {}

  @Get()
  greeting(@Query('email') email: string) {
    console.log('greeting called with email:', email);
    this.sseGatewayService.getHello();
  }

  @Get('/test-send')
  publishMessage(@Query('email') email: string) {
    this.redisBus.emit('sse.video.completed', {
      email: email,
    });
  }

  @Sse('/test-sse')
  // @UseGuards(NextAuthGuard)
  sse(
    // @Req() req: any
    @Query('email') email: string,
  ): Observable<any> {
    // const email = req.email;
    console.log('user: ', email);
    return this.sseGatewayService.listen(email);
  }

  @EventPattern('sse.video.completed')
  handleVideoCompleted(
    @Payload()
    event: {
      email: string;
    },
  ) {
    console.log('Received notification:', event);

    this.sseGatewayService.send(
      {
        type: 'video.completed',
        videoId: 'videoId',
        userId: 'userId',
      },
      event.email,
    );
  }
}
