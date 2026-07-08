import { Video } from 'apps/web-api/src/videos/entities/video';
import { StatusVideo } from '../enum/status-video';
export class GetVideoDto {
  title: string = '';
  description: string = '';
  directory: string = '';
  status: StatusVideo = StatusVideo.processing;

  constructor(partial: Partial<Video | null>) {
    Object.assign(this, partial);
  }
}
