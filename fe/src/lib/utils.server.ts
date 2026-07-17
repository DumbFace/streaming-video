"use server";
import redis from "@/src/lib/redis";
import bcrypt from "bcrypt";
import crypto from "crypto";
export async function hashPassword(plainTextPassword: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const hash = await bcrypt.hashSync(plainTextPassword, salt);
  return hash;
}

export async function comparePassword(
  plainTextPassword: string,
  storedHash: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(plainTextPassword, storedHash);
  return isMatch;
}

export const generateResetToken = async () => {
  const token = crypto.randomBytes(32).toString("hex");

  return token;
};
