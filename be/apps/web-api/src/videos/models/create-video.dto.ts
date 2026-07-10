import { StatusVideo } from '@lib/shared/src/enums/video.enum';

export class CreateVideoDto {
  title: string = '';
  description: string = '';
  directory: string = '';
  status: StatusVideo = StatusVideo.processing;
}
