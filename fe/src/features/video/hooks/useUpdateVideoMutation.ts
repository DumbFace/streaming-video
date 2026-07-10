"use client";
import { updateVideo } from "@/src/features/video/actions/update-video.action";
import { VideoFormData } from "@/src/features/video/components/dialog";
import { useVideoDialogStore } from "@/src/features/video/shared/dialogStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateVideoMutation = () => {
  const queryClient = useQueryClient();
  const { pagination } = useVideoDialogStore((store) => store);

  return useMutation({
    mutationFn: async ({ data, id }: { data: VideoFormData; id: string }) => {
      await updateVideo(data, id);
      return {
        success: true,
        message: `Update video ${data.title} successful`,
      };
    },

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          "videos",
          { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize },
        ],
      });
    },
  });
};
