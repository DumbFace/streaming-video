"use server";
import { VideoFormValues } from "@/src/features/video/components/dialog";
import ModelVideo from "@/src/features/video/models/video";
import connectDB from "@/src/lib/db";

export const addVideoAction = async ({
  data,
  totalChunks,
  directory,
  url,
}: {
  data: VideoFormValues;
  url: string;
  directory: string;
  totalChunks: number;
}) => {
  const { title, description } = data;
  await connectDB();

  const newVideo = await ModelVideo.create({
    title: title,
    description: description,
    url: url,
    totalChunks: totalChunks,
    directory: directory,
  });

  return {
    success: true,
    message: "Create Video Successfully",
    data: JSON.parse(JSON.stringify(newVideo)),
  };
};
