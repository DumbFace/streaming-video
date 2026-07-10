"use server";
import amqp from "amqplib";

export const publishAddVideoMessage = async (
  id: string,
  totalChunks: number,
  presignedUrl: string,
  directory: string,
) => {
  const connection = await amqp.connect("amqp://guest:guest@localhost:5672/");
  const channel = await connection.createChannel();

  const exchangeName = "video.slicing.exchange";
  await channel.assertExchange(exchangeName, "x-delayed-message", {
    durable: true,
    arguments: {
      "x-delayed-type": "fanout",
    },
  });

  for (let i = 0; i < totalChunks; i++) {
    channel.publish(
      exchangeName,
      "",
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

  return {
    success: true,
    message: "Publish Slicing Video Message Successful",
  };
};
