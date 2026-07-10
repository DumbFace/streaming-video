import { StatusVideo } from '@lib/shared/src/enums/video.enum';

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
