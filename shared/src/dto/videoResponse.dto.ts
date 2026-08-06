import { StatusVideo } from '../enums/video.enum';

export interface IVideoResponseDto {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: StatusVideo;
  url: string;
  totalChunks: number;
  masterPlaylistUrl: string;
  directory: string;
  segmentsCount: number;
  createdAt: string;
}
