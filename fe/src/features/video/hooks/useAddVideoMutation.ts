"use client";
import { addVideoAction } from "@/src/features/video/actions/add-video.action";
import { publishAddVideoMessage } from "@/src/features/video/actions/slicing-video-message.action";
import { uploadVideoAction } from "@/src/features/video/actions/upload-video";
import { VideoFormValues } from "@/src/features/video/components/dialog";
import { useVideoDialogStore } from "@/src/features/video/shared/dialogStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddVideoMutation = () => {
  const queryClient = useQueryClient();
  const { pagination } = useVideoDialogStore((store) => store);

  return useMutation({
    mutationFn: async (formVideoData: VideoFormValues) => {
      const responseFromUpload = await uploadVideoAction(formVideoData);
      if (responseFromUpload?.success) {
        toast(responseFromUpload.message);
        const { url, totalChunks, directory }: any = responseFromUpload.data;

        var responseFromAddVideo = await addVideoAction({
          data: formVideoData,
          url: url,
          totalChunks: totalChunks,
          directory: directory,
        });

        if (responseFromAddVideo.success) {
          const { _id, totalChunks, url, directory } =
            responseFromAddVideo.data;
          const responseFromPublishMessage = await publishAddVideoMessage(
            _id,
            totalChunks,
            url,
            directory,
          );

          return {
            success: responseFromAddVideo.success,
            message: responseFromPublishMessage.message,
          };
        } else
          return {
            success: responseFromAddVideo.message,
            message: responseFromAddVideo.message,
          };
      } else {
        return {
          success: false,
          message: `Upload video ${formVideoData.title} unsuccessful`,
        };
      }
    },

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["videos", { pageIndex: 0, pageSize: pagination.pageSize }],
      });
    },
  });
};
