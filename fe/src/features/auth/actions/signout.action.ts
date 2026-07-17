"use server";

import { signOut } from "@/src/features/auth/auth";

export async function signOutAction() {
  await signOut();
}
