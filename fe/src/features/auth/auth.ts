import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/src/features/auth/auth-config";
import bcrypt from "bcrypt";
import { getUserAction } from "@/src/features/auth/actions/get-user.action";
import { redirect } from "next/navigation";
import { Cause } from "next/font/google";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("authorize: ", credentials);

        //TODO consider using only 1 validator model for sign in function
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const response = await getUserAction(email);
          if (!response.success) {
            throw new Error(response.message);
          }
          const { data: user } = response;

          if (!user.password) {
            throw new Error("Password must not null");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) throw new Error("Password is incorrect");

          if (passwordsMatch)
            return {
              email: user.email,
              name: user.fullName,
            };
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
