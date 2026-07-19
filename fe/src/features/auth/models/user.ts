import { IUser } from '@streaming-video/shared';
import mongoose, { Model, Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    isActive: { type: Number, required: true, default: 0 },
    googleId: { type: String, required: false },
  },
  { timestamps: true },
);

export const ModelUser = (mongoose.models.User ||
  mongoose.model<IUser>('User', userSchema)) as Model<IUser>;
