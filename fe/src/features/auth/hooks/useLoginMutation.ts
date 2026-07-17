"use client";
import { loginAction } from "@/src/features/auth/actions/login.action";
import { LoginFormValues } from "@/src/features/auth/components/sign-in-form";
import { FnResponse } from "@/src/lib/fn-response";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (loginFormValues: LoginFormValues) => {
      var response = await loginAction(loginFormValues);
      return response;
    },
    onSuccess: (data, variables, context) => {},
  });
};
