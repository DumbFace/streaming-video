import { addWeeks } from "date-fns";
import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "@lib/shared/src/intefaces/user.interface";

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    isActive: { type: Number, required: true, default: 0 },
    googleId: { type: String, required: false },
  },
  { timestamps: true },
);

export const ModelUser = (mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema)) as Model<IUser>;
