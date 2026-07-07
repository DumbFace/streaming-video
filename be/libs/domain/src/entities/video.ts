import { BaseEntity } from 'libs/domain/src/entities/base-entity';
import { StatusVideo } from 'libs/domain/src/enums/status-video';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Video extends BaseEntity {
  @Prop({ default: '' })
  title: string = '';

  @Prop({ default: '' })
  description: string = '';

  @Prop({ default: '' })
  directory: string = '';

  @Prop({ type: String, enum: StatusVideo, default: StatusVideo.processing })
  status: StatusVideo = StatusVideo.processing;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
