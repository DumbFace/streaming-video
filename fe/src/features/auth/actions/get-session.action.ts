"use server";

import { auth } from "@/src/features/auth/auth";

export async function getSessionAction() {
  // const { user } = auth;
  return auth();
}
