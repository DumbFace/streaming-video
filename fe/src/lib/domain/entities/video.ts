export interface Video {
  title: string;
  description: string;
  image: string;
  status: StatusVideo;
  masterPlaylistUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export enum StatusVideo {
  UnProcessing,
  Processing,
  Processed,
  Canceled,
}
