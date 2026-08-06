'use client';
import { addVideoAction } from '@/src/features/video/actions/add-video.action';
import { getUploadUrlAction } from '@/src/features/video/actions/get-upload-url.action';
import { publishAddVideoMessage } from '@/src/features/video/actions/slicing-video-message.action';
import { uploadFileDirectly } from '@/src/features/video/actions/upload-file-directly';
import { processUploadedVideoAction } from '@/src/features/video/actions/process-upload-video.action';
import { VideoFormValues } from '@/src/features/video/components/dialog';
import { useVideoDialogStore } from '@/src/features/video/shared/dialogStore';
import { FnResponse } from '@/src/lib/fn-response';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export const useAddVideoMutation = () => {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    throw new Error('user Id is undefined');
  }
  const queryClient = useQueryClient();
  const { pagination } = useVideoDialogStore((store) => store);

  return useMutation({
    mutationFn: async (formVideoData: VideoFormValues) => {
      if (!formVideoData.videoFile?.[0]) {
        return FnResponse.Fail('No video file provided');
      }

      const file = formVideoData.videoFile[0];

      const urlResponse = await getUploadUrlAction(file.name, file.type);
      if (!urlResponse.success) return urlResponse;

      const { uploadUrl, fileKey, directory }: any = urlResponse.data;

      try {
        const response = await uploadFileDirectly(file, uploadUrl);
      } catch (err) {
        const error = err as Error;
        return FnResponse.Fail('Upload Unsuccessful', {
          message: error.message,
          name: error.name,
          code: 500,
        });
      }

      const responseFromProcess = await processUploadedVideoAction(fileKey, directory);

      if (!responseFromProcess.success) return responseFromProcess;

      const { url, totalChunks }: any = responseFromProcess.data;
      var responseFromAddVideo = await addVideoAction({
        userId: session?.user?.id,
        title: formVideoData.title,
        description: formVideoData.description,
        url: url,
        totalChunks: totalChunks,
        directory: directory,
      });
      if (!responseFromAddVideo.success) return responseFromAddVideo;

      toast(responseFromAddVideo.message);

      const { _id }: any = responseFromAddVideo.data;

      const responseFromPublishMessage = await publishAddVideoMessage(
        _id,
        totalChunks,
        url,
        directory,
      );

      if (!responseFromPublishMessage.message) return responseFromPublishMessage;

      return FnResponse.Succeed<object>('Handle video successfully', {});
    },

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['videos', { pageIndex: 0, pageSize: pagination.pageSize }],
      });
    },
  });
};
