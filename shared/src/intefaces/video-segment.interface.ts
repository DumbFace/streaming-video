import { StatusVideoSegment } from '../enums/video.enum';

export interface IVideoSegment {
  url: string;
  duration: number;
  order: number;
  status: StatusVideoSegment;
}
