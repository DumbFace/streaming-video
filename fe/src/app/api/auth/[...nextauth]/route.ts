import NextAuth from "next-auth";
import { authConfig } from "@/src/features/auth/auth-config";

const { handlers } = NextAuth(authConfig);

export const { GET, POST } = handlers;
