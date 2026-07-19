'use client';
import { LoginFormValues } from '@/src/features/auth/components/sign-in-form';
import { FnResponse } from '@/src/lib/fn-response';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (loginFormValues: LoginFormValues) => {
      const result = await signIn('credentials', {
        email: loginFormValues.email,
        password: loginFormValues.password,
        redirect: false,
      });

      if (!result || result.error) {
        return FnResponse.Fail('Login unsuccessful', {
          name: '',
          message: result?.error ?? 'Unknown error',
          code: 401,
        });
      }

      return FnResponse.Succeed<any>('Login successful', result);
    },
    onSuccess: (data, variables, context) => {},
  });
};
