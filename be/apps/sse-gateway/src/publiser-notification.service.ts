import { Injectable, MessageEvent } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { defer, finalize, Observable, ReplaySubject, Subject } from 'rxjs';
import { SseGatewayService } from './sse-gateway.service';

@Injectable()
export class PublisherNotificationService {
  constructor(private readonly sseGatewayService: SseGatewayService) {}
}
