"use server";
import { VideoFormValues } from "@/src/features/video/components/dialog";
import ModelVideo from "@/src/features/video/models/video";
import { useVideoDialogStore } from "@/src/features/video/shared/dialogStore";
import connectDB from "@/src/lib/db";
import { IVideo } from "@lib/shared/src/intefaces/video.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const updateVideo = async (data: VideoFormValues, id: string) => {
  await connectDB();

  var video = await ModelVideo.findByIdAndUpdate(
    id,
    { title: data.title, description: data.description },
    {
      new: true,
    },
  ).exec();

  return {
    success: true,
    message: "Update Successfully",
    data: JSON.parse(JSON.stringify(video)),
  };
};
