"use server";
import ModelVideo from "@/src/features/video/models/video";
import connectDB from "@/src/lib/db";

export const getVideos = async (pageIndex: number, pageSize: number) => {
  await connectDB();

  const rawData = await ModelVideo.find()
    .select("-updatedAt")
    .sort({ createdAt: -1 })
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .lean()
    .exec();

  return JSON.parse(JSON.stringify(rawData));
};
