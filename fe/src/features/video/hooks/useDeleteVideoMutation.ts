"use client";
import { deleteVideoAction } from "@/src/features/video/actions/delete-video.action";
import { useVideoDialogStore } from "@/src/features/video/shared/dialogStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteVideoMutation = () => {
  const queryClient = useQueryClient();
  const { pagination, data } = useVideoDialogStore((store) => store);

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteVideoAction(id);
      return {
        success: true,
        message: `Delete video ${data?.title} successful`,
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
