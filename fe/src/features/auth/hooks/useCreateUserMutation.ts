"use client";
import { createUserAction } from "@/src/features/auth/actions/createUser.action";
import { SignInFormValues } from "@/src/features/auth/components/sign-up-form";
import { useMutation } from "@tanstack/react-query";

export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: async (formSignInValues: SignInFormValues) => {
      var response = await createUserAction(formSignInValues);

      return response;
    },
    onSuccess: (data, variables, context) => {},
  });
};
