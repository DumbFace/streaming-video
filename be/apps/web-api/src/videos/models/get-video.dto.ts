import { Video } from '@lib/shared/src/classes/video.class';
import { StatusVideo } from '@lib/shared/src/enums/video.enum';

export class GetVideoDto {
  title: string = '';
  description: string = '';
  directory: string = '';
  status: StatusVideo = StatusVideo.processing;

  constructor(partial: Partial<Video | null>) {
    Object.assign(this, partial);
  }
}
