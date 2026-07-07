import { BaseEntity } from 'libs/domain/src/entities/base-entity';
import { StatusVideoSegment } from 'libs/domain/src/enums/status-video-segment';

export class VideoSegment extends BaseEntity {
  name: string = '';
  url: string = '';
  duration: number = 0;
  status: StatusVideoSegment = StatusVideoSegment.queue;
}
