// src/auth/next-auth-token.util.ts
import { jwtDecrypt } from 'jose';
import { hkdf } from '@panva/hkdf';

export interface NextAuthTokenPayload {
  name: string;
  email: string;
  sub: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
}

async function deriveKey(secret: string): Promise<Uint8Array> {
  return hkdf('sha256', secret, '', 'NextAuth.js Generated Encryption Key', 32);
}

export async function decryptNextAuthToken(
  token: string,
  secret: string,
): Promise<NextAuthTokenPayload> {
  const key = await deriveKey(secret);
  const { payload } = await jwtDecrypt(token, key);
  return payload as unknown as NextAuthTokenPayload;
}
