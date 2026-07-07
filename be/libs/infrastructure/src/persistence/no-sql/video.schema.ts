import { Video } from 'libs/domain/src/entities/video';
import { StatusVideo } from 'libs/domain/src/enums/status-video';
import { Schema } from 'mongoose';

export interface VideoDocument extends Document, Omit<Video, 'id'> {}

export const VideoSchema = new Schema<VideoDocument>(
  {
    // title: { type: String, default: '' },
    // description: { type: String, default: '' },
    // directory: { type: String, default: '' },
    // status: {
    //   type: String,
    //   enum: Object.values(StatusVideo),
    //   default: StatusVideo.processing,
    // },
  },
  {
    timestamps: true, // Useful if your BaseEntity tracks createdAt/updatedAt
  },
);
