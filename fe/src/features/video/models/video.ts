import { Video } from "@lib/shared/src/classes/video.class";
import { StatusVideo } from "@lib/shared/src/enums/video.enum";
import mongoose, { Model, Schema } from "mongoose";
import { IVideo } from "@lib/shared/src/intefaces/video.interface";

const VideoSchema: Schema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Number, default: StatusVideo.processing },
    url: { type: String, require: true },
    totalChunks: { type: Number, require: true },
    masterPlaylistUrl: { type: String, required: false },
    directory: { type: String, required: true },
  },
  { timestamps: true },
);

const ModelVideo: Model<Video> =
  mongoose.models.Video || mongoose.model<Video>("Video", VideoSchema);

export default ModelVideo;
