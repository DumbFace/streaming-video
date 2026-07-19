'use server';
import { VideoFormValues } from '@/src/features/video/components/dialog';
import ModelVideo from '@/src/features/video/models/video';
import connectDB from '@/src/lib/db';
import { FnResponse } from '@/src/lib/fn-response';

export const addVideoAction = async ({
  data,
  totalChunks,
  directory,
  url,
}: {
  data: VideoFormValues;
  url: string;
  directory: string;
  totalChunks: number;
}) => {
  const { title, description } = data;
  await connectDB();

  const newVideo = await ModelVideo.create({
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
