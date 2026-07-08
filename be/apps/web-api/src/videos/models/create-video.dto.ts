import { StatusVideo } from 'apps/web-api/src/videos/enum/status-video';

export class CreateVideoDto {
  title: string = '';
  description: string = '';
  directory: string = '';
  status: StatusVideo = StatusVideo.processing;
}
