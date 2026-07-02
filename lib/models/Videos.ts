import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideo extends Document {
  title: string;
  status: string;
  masterPlaylistUrl?: string;
  createdAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    status: { type: String, default: "processing", required: true },
    masterPlaylistUrl: { type: String },
  },
  { timestamps: true },
);

const Video: Model<IVideo> =
  mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);

export default Video;
