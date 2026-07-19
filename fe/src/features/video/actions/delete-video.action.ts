'use server';

import ModelVideo from '@/src/features/video/models/video.schema';
import connectDB from '@/src/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteVideoAction(id: string) {
  try {
    await connectDB();

    await ModelVideo.findByIdAndDelete(id);

    return { success: true };
  } catch (error) {
    console.error('Failed to delete video:', error);
    return { success: false, error: 'Đã có lỗi xảy ra' };
  }
}
