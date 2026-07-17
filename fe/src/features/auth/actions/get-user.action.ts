"use server";
import { ModelUser } from "@/src/features/auth/models/user";
import connectDB from "@/src/lib/db";
import { LoginFormValues } from "@/src/features/auth/components/sign-in-form";
import { IUser } from "@lib/shared/src/intefaces/user.interface";
import { FlexibleFnResponse, FnResponse } from "@/src/lib/fn-response";

export const getUserAction = async (
  email: string,
): Promise<FlexibleFnResponse<IUser>> => {
  await connectDB();

  const user = await ModelUser.findOne({
    email,
  }).lean();

  if (!user) return FnResponse.Fail("Email is incorrect");

  return FnResponse.Succeed<IUser>("", user);
};
