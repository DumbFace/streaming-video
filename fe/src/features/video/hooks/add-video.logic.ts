import { VideoFormValues } from '@/src/features/video/components/dialog';
import { FnResponse } from '@/src/lib/fn-response';
import { AddVideoDeps } from '@/src/features/video/types/add-video.deps';
import { toast } from 'sonner';

export const addVideoLogic = async (
  formVideoData: VideoFormValues,
  userId: string,
  deps: AddVideoDeps,
) => {
  if (!formVideoData.videoFile?.[0]) {
    return FnResponse.Fail('No video file provided');
  }

  const file = formVideoData.videoFile[0];

  const urlResponse = await deps.getUploadUrlAction(file.name, file.type);
  if (!urlResponse.success) return urlResponse;

  const { uploadUrl, fileKey, directory }: any = urlResponse.data;

  try {
    await deps.uploadFileDirectly(file, uploadUrl);
  } catch (err) {
    const error = err as Error;
    return FnResponse.Fail('Upload Unsuccessful', {
      message: error.message,
      name: error.name,
      code: 500,
    });
  }

  const responseFromProcess = await deps.processUploadedVideoAction(fileKey, directory);
  if (!responseFromProcess.success) return responseFromProcess;

  const { url, totalChunks }: any = responseFromProcess.data;
  const responseFromAddVideo = await deps.addVideoAction({
    userId,
    title: formVideoData.title,
    description: formVideoData.description,
    url,
    totalChunks,
    directory,
  });
  if (!responseFromAddVideo.success) return responseFromAddVideo;

  toast(responseFromAddVideo.message);

  const { _id }: any = responseFromAddVideo.data;
  const responseFromPublishMessage = await deps.publishAddVideoMessage(
    _id,
    totalChunks,
    url,
    directory,
  );
  if (!responseFromPublishMessage.message) return responseFromPublishMessage;

  return FnResponse.Succeed<object>('Handle video successfully', {});
};
