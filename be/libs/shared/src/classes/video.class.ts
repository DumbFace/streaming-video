import { Schema, Prop } from '@nestjs/mongoose';
import { VideoSegment } from '@lib/shared/src/classes/video-segment.class';
import { StatusVideo } from '@lib/shared/src/enums/video.enum';
import { VideoSegmentSchema } from '@lib/shared/src/schemas/video-segment.schema';
import { IVideo } from '@lib/shared/src/intefaces/video.interface';

@Schema({ timestamps: true })
export class Video implements IVideo {
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
