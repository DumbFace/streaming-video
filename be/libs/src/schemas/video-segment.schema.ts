import { VideoSegment } from '@lib/src/classes/video-segment.class';
import { SchemaFactory } from '@nestjs/mongoose';

export const VideoSegmentSchema = SchemaFactory.createForClass(VideoSegment);
