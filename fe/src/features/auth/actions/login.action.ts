'use server';
import { LoginFormValues } from '@/src/features/auth/components/sign-in-form';
import { FlexibleFnResponse, FnResponse } from '@/src/lib/fn-response';

export const loginAction = async ({
  email,
  password,
}: LoginFormValues): Promise<FlexibleFnResponse<object>> => {
  try {
    return FnResponse.Succeed('Login successful', {});
  } catch (err: any) {
    const error = err as Error;

    return FnResponse.Fail('Login unsuccessful', {
      name: error.name,
      message: error.message,
      code: 0,
    });
  }
};
