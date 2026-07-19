import { StatusVideo } from '../enums/video.enum';

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
