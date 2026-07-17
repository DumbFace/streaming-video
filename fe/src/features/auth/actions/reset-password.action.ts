"use server";
import { FnResponse } from "@/src/lib/fn-response";
import { ModelUser } from "@/src/features/auth/models/user";
import { hashPassword } from "@/src/lib/utils.server";
import connectDB from "@/src/lib/db";

export const ResetPasswordAction = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await connectDB();

    const passwordAfterhashing = await hashPassword(password);

    const response = await ModelUser.findOneAndUpdate(
      { email: email },
      { password: passwordAfterhashing },
    );

    if (!response)
      return FnResponse.Fail("User not found or email is invalid.", {
        name: "NotFoundError",
        message: "No user matched the provided email address.",
        code: 404,
      });

    return FnResponse.Succeed("Reset password successful", {});
  } catch (err: any) {
    const error = err as Error;

    return FnResponse.Fail("Reset password unsuccessful", {
      name: error.name,
      message: error.message,
      code: 500,
    });
  }
};
