'use server';
import { VideoFormValues } from '@/src/features/video/components/dialog';
import ModelVideo from '@/src/features/video/models/video.schema';
import connectDB from '@/src/lib/db';

export const updateVideo = async (data: VideoFormValues, id: string) => {
  await connectDB();

  var video = await ModelVideo.findByIdAndUpdate(
    id,
    { title: data.title, description: data.description },
    {
      new: true,
    },
  ).exec();

  return {
    success: true,
    message: 'Update Successfully',
  };
};
