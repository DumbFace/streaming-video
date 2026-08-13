import { addVideoAction } from '@/src/features/video/actions/add-video.action';
import { getUploadUrlAction } from '@/src/features/video/actions/get-upload-url.action';
import { processUploadedVideoAction } from '@/src/features/video/actions/process-upload-video.action';
import { publishAddVideoMessage } from '@/src/features/video/actions/slicing-video-message.action';
import { uploadFileDirectly } from '@/src/features/video/actions/upload-file-directly';

export type AddVideoDeps = {
  getUploadUrlAction: typeof getUploadUrlAction;
  uploadFileDirectly: typeof uploadFileDirectly;
  processUploadedVideoAction: typeof processUploadedVideoAction;
  addVideoAction: typeof addVideoAction;
  publishAddVideoMessage: typeof publishAddVideoMessage;
};
