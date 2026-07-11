import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusVideoSegment } from '../enums/status-video-segment';

@Schema({ timestamps: true })
export class VideoSegment {
  @Prop({ default: '', required: true })
  name: string = '';
  @Prop({ default: '', required: true })
  url: string = '';
  @Prop({ default: '', required: true })
  duration: number = 0;
  @Prop({ default: '' })
  status: StatusVideoSegment = StatusVideoSegment.queue;
}

export const VideoSegmentSchema = SchemaFactory.createForClass(VideoSegment);
