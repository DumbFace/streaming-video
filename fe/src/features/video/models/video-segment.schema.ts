import mongoose, { Schema } from 'mongoose';
import { IVideoSegment } from '@streaming-video/shared';

export const VideoSegmentSchema = new Schema<IVideoSegment>(
  {
    url: { type: String, required: true },
    duration: { type: Number, required: true },
    order: { type: Number, required: true },
    status: { type: Number, required: true },
  },
  { _id: false, timestamps: true },
);
