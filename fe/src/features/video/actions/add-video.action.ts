'use server';
import ModelVideo from '@/src/features/video/models/video.schema';
import connectDB from '@/src/lib/db';
import { FnResponse } from '@/src/lib/fn-response';

export const addVideoAction = async ({
  userId,
  title,
  description,
  totalChunks,
  directory,
  url,
}: {
  userId: string;
  title: string;
  description: string;
  url: string;
  directory: string;
  totalChunks: number;
}) => {
  await connectDB();

  const newVideo = await ModelVideo.create({
    userId: userId,
    title: title,
    description: description,
    url: url,
    totalChunks: totalChunks,
    directory: directory,
  });

  const { _id } = JSON.parse(JSON.stringify(newVideo));

  if (!newVideo) return FnResponse.Fail('Add video record unsuccessful');

  return FnResponse.Succeed<object>('Add video record successful', { _id });
};
