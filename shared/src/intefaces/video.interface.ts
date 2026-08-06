import { StatusVideo } from '../enums/video.enum';
import { Types } from 'mongoose';
import { IVideoSegment } from './video-segment.interface';

export interface IVideo {
  userId: Types.ObjectId | string;

  title: string;
  description: string;
  directory: string;
  url: string;
  status: StatusVideo;
  masterPlaylistUrl: string;
  totalChunks: number;
}
