'use server';
import { SignInFormValues } from '@/src/features/auth/components/sign-up-form';
import { ModelUser } from '@/src/features/auth/models/user';
import connectDB from '@/src/lib/db';
import { hashPassword } from '@/src/lib/utils.server';
import { FnResponse } from '@/src/lib/fn-response';
import { ErrorCodes } from '@/src/features/auth/constants/errorCode';

export const createUserAction = async (data: SignInFormValues) => {
  const { fullName, email, password } = data;

  await connectDB();

  const passwordAfterHashing = await hashPassword(password);
  const existUser = await ModelUser.findOne({
    email: email,
  })
    .lean()
    .exec();

  if (existUser && existUser.googleId && existUser.isActive)
    return FnResponse.Fail(
      'You have already created this user using google authentication, please login using google account',
    );

  if (existUser)
    return FnResponse.Fail('User is exist', {
      name: 'User is existed',
      code: ErrorCodes.DuplicateUnique,
    });

  try {
    await ModelUser.create({
      fullName,
      email,
      password: passwordAfterHashing,
    });

    return FnResponse.Succeed<undefined>(`Create user ${data.email}  successful`, undefined);
  } catch (error: any) {
    const err = error as Error;
    return FnResponse.Fail(`Create user ${data.email} unsuccessful`, {
      name: err.name,
      message: err.message,
      code: 0,
    });
  }
};
