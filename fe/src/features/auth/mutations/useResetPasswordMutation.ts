"use client";
import { ResetPasswordAction } from "@/src/features/auth/actions/reset-password.action";
import {
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

export const useResetPasswordMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await ResetPasswordAction({
        email: email,
        password: password,
      });

      return response;
    },

    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["resetPasswordResult"], data);
    },
  });
};
