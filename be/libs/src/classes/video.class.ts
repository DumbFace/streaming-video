import { Schema, Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IVideo, StatusVideo } from '@streaming-video/shared';
import { VideoSegmentSchema } from '@lib/src/schemas/video-segment.schema';
import { VideoSegment } from '@lib/src/classes/video-segment.class';

@Schema({ timestamps: true })
export class Video implements IVideo {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string | Types.ObjectId = '';

  @Prop({ default: '', required: true })
  title: string = '';
  @Prop({ default: '', required: true })
  description: string = '';
  @Prop({ default: '' })
  directory: string = '';
  @Prop({ default: '' })
  url: string = '';
  @Prop({ enum: StatusVideo, default: StatusVideo.processing })
  status: StatusVideo = StatusVideo.processing;
  //TODO number could not be zero
  @Prop()
  totalChunks: number = 0;
  @Prop({ type: [VideoSegmentSchema], default: [] })
  segments: VideoSegment[] = [];

  @Prop({ default: '', required: false })
  masterPlaylistUrl: string = '';
}
