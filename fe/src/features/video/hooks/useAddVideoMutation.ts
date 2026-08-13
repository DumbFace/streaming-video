'use client';
import { getUploadUrlAction } from '@/src/features/video/actions/get-upload-url.action';
import { publishAddVideoMessage } from '@/src/features/video/actions/slicing-video-message.action';
import { uploadFileDirectly } from '@/src/features/video/actions/upload-file-directly';
import { processUploadedVideoAction } from '@/src/features/video/actions/process-upload-video.action';
import { VideoFormValues } from '@/src/features/video/components/dialog';
import { useVideoDialogStore } from '@/src/features/video/shared/dialogStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { addVideoAction } from '@/src/features/video/actions/add-video.action';
import { addVideoLogic } from '@/src/features/video/hooks/add-video.logic';

export const useAddVideoMutation = () => {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    throw new Error('user Id is undefined');
  }
  const queryClient = useQueryClient();
  const { pagination } = useVideoDialogStore((store) => store);

  return useMutation({
    mutationFn: async (formVideoData: VideoFormValues) =>
      addVideoLogic(formVideoData, session.user.id, {
        getUploadUrlAction,
        uploadFileDirectly,
        processUploadedVideoAction,
        addVideoAction,
        publishAddVideoMessage,
      }),

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['videos', { pageIndex: 0, pageSize: pagination.pageSize }],
      });
    },
  });
};
