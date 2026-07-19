'use server';
import { FnResponse } from '@/src/lib/fn-response';
import amqp from 'amqplib';

export const publishAddVideoMessage = async (
  id: string,
  totalChunks: number,
  presignedUrl: string,
  directory: string,
) => {
  if (!process.env.MESSAGE_BROKER) {
    throw new Error('process.env.MESSAGE_BROKER coudnt be null');
  }

  try {
    const connection = await amqp.connect(process.env.MESSAGE_BROKER);
    const channel = await connection.createChannel();

    const exchangeName = 'video.slicing.exchange';
    await channel.assertExchange(exchangeName, 'x-delayed-message', {
      durable: true,
      arguments: {
        'x-delayed-type': 'fanout',
      },
    });

    for (let i = 0; i < totalChunks; i++) {
      channel.publish(
        exchangeName,
        '',
        Buffer.from(
          JSON.stringify({
            videoId: id,
            videoUrl: presignedUrl,
            index: i,
            directory: directory,
          }),
        ),
      );
    }

    return FnResponse.Succeed<object>('Publish message successful', {});
  } catch (err) {
    const error = err as Error;
    return FnResponse.Fail('Publish message unsuccessful', {
      name: error.name,
      message: error.message,
      code: 500,
    });
  }
};
