import { StatusVideo } from '../enum/status-video';
export class PatchVideoDto {
  title: string = '';
  description: string = '';
  directory: string = '';
  status: StatusVideo = StatusVideo.processing;
}
