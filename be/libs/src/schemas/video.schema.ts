import { Video } from '@lib/src/classes/video.class';
import { SchemaFactory } from '@nestjs/mongoose';

export const VideoSchema = SchemaFactory.createForClass(Video);
