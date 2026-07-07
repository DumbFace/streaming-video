import { Video as VideoDomain } from "@/src/lib/domain/entities/video";
import mongoose, { Schema, Document, Model } from "mongoose";

const VideoSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    status: { type: String, default: "processing", required: true },
    masterPlaylistUrl: { type: String },
  },
  { timestamps: true },
);

const Video: Model<VideoDomain> =
  mongoose.models.Video || mongoose.model<VideoDomain>("Video", VideoSchema);

export default Video;
