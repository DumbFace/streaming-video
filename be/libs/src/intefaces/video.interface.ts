import { StatusVideo } from '@streaming-video/shared';

export interface IVideo {
  title: string;
  description: string;
  directory: string;
  url: string;
  status: StatusVideo;
  masterPlaylistUrl: string;
  totalChunks: number;
  segments: any[];
}
