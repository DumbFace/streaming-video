import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusVideo } from 'apps/web-api/src/videos/enum/status-video';

@Schema({ timestamps: true })
export class Video {
  @Prop({ default: '', required: true })
  title: string = '';

  @Prop({ default: '', required: true })
  description: string = '';

  @Prop({ default: '' })
  directory: string = '';

  @Prop({ enum: StatusVideo, default: StatusVideo.processing })
  status: StatusVideo = StatusVideo.processing;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
