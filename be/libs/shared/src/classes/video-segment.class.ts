import { Schema, Prop } from '@nestjs/mongoose';
import { StatusVideoSegment } from '@lib/shared/src/enums/video.enum';
@Schema({ timestamps: true })
export class VideoSegment {
  @Prop({ default: '', required: true })
  url: string = '';
  @Prop({ default: '', required: true })
  duration: number = 0;
  @Prop({ default: '', required: true })
  order: number = 0;
  @Prop({ default: '' })
  status: StatusVideoSegment = StatusVideoSegment.queue;
}
