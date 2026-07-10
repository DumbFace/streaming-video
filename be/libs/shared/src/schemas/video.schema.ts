import { SchemaFactory } from '@nestjs/mongoose';
import { Video } from '@lib/shared/src/classes/video.class';

export const VideoSchema = SchemaFactory.createForClass(Video);
