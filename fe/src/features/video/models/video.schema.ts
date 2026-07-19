import { IVideoSegment } from './../../../../../shared/src/intefaces/video-segment.interface';
import mongoose, { Schema } from 'mongoose';
import { IVideo, StatusVideo } from '@streaming-video/shared';
import { VideoSegmentSchema } from '@/src/features/video/models/video-segment.schema';

const VideoSchema: Schema = new Schema<VideoSchema>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Number, default: StatusVideo.processing },
    url: { type: String, require: true },
    totalChunks: { type: Number, require: true },
    masterPlaylistUrl: { type: String, required: false },
    directory: { type: String, required: true },

    segments: [VideoSegmentSchema],
  },
  { timestamps: true },
);

const ModelVideo = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

type VideoSchema = IVideo & {
  segments: IVideoSegment[];
};

export default ModelVideo;
