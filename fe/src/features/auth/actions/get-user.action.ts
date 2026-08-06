'use server';
import { ModelUser } from '@/src/features/auth/models/user';
import connectDB from '@/src/lib/db';
import { FlexibleFnResponse, FnResponse } from '@/src/lib/fn-response';
import { IUser } from '@streaming-video/shared';

export const getUserAction = async (email: string): Promise<FlexibleFnResponse<IUser>> => {
  await connectDB();

  const user = await ModelUser.findOne({
    email,
  }).lean();

  if (!user) return FnResponse.Fail('Email is incorrect');

  return FnResponse.Succeed<IUser>('', user);
};
