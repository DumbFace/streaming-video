import { SchemaFactory } from '@nestjs/mongoose';
import { VideoSegment } from '@lib/shared/src/classes/video-segment.class';

export const VideoSegmentSchema = SchemaFactory.createForClass(VideoSegment);
