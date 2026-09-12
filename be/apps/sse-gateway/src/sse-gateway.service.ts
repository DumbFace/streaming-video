import { Injectable, MessageEvent } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { defer, finalize, Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class SseGatewayService {
  getHello(): string {
    return 'Hello World!';
  }

  private readonly channels = new Map<string, ReplaySubject<MessageEvent>>();
  private readonly channel = new ReplaySubject<MessageEvent>(10, 5000);

  listen(email: string): Observable<MessageEvent> {
    if (!email) throw new Error('Email is required to listen to SSE events.');
    if (!this.channels) throw new Error('Channels map is not initialized.');
    if (!this.channels.has(email)) {
      this.channels.set(email, new ReplaySubject<MessageEvent>(10, 5000));
    }

    return defer(() => {
      const channel = this.getOrCreateChannel(email);

      console.log(`SSE connected: ${email}`);

      return channel.asObservable().pipe(
        finalize(() => {
          console.log(`SSE disconnected: ${email}`);
        }),
      );
    });
  }

  send(data: any, email: string): void {
    if (!email) {
      throw new Error('Email is required');
    }

    this.getOrCreateChannel(email).next({
      data,
    });
  }

  private getOrCreateChannel(email: string): ReplaySubject<MessageEvent> {
    let channel = this.channels.get(email);

    if (!channel) {
      channel = new ReplaySubject<MessageEvent>(10, 5000);
      this.channels.set(email, channel);
    }

    return channel;
  }

  // @EventPattern('sse.video.completed')
  // handleSseNotification(event) {
  //   this.channels.send(event.userId, event);
  // }
}
