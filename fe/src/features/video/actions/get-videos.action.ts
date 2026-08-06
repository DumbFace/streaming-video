'use server';
import { authOptions } from '@/src/features/auth/auth-config';
import ModelVideo from '@/src/features/video/models/video.schema';
import connectDB from '@/src/lib/db';
import { IVideo } from '@streaming-video/shared';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth';

export const getVideos = async (pageIndex: number, pageSize: number) => {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await connectDB();

  const [videos, total] = await Promise.all([
    ModelVideo.aggregate<VideoAggregate>([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $skip: pageIndex * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
          segmentsCount: { $size: '$segments' },
        },
      },
      { $project: { segments: 0, updatedAt: 0 } },
    ]),
    ModelVideo.countDocuments({ userId }),
  ]);

  return {
    data: videos.map((video) => ({
      ...video,
      _id: video._id.toString(),
      userId: video.userId.toString(),
    })),
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};

export type VideoAggregate = Omit<IVideo, 'segments'> & {
  _id: string;
  segmentsCount: number;
};

// function toVideoResponseDto(
//   video: IVideo & { _id: Types.ObjectId; segmentsCount: number; createdAt: string },
// ): IVideoResponseDto {
//   return {
//     _id: video._id.toString(),
//     userId: video.userId.toString(),
//     title: video.title,
//     description: video.description,f
//     status: StatusVideo.processing,
//     totalChunks: 0,
//     masterPlaylistUrl: video.masterPlaylistUrl,
//     directory: video.directory,
//     segmentsCount: video.segmentsCount,
//     createdAt: createdAt,
//   };
// }
