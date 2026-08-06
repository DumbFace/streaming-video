'use server';

import { authOptions } from '@/src/features/auth/auth-config';
import { generateCloudFrontSignedCookies } from '@/src/lib/cloudfront-sign';
import { FnResponse } from '@/src/lib/fn-response';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import { cookies } from 'next/headers';

export async function grantVideoAccess(videoId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!videoId) throw new Error('Video Id couldnt be null or undefined');

    if (!session?.user) {
      throw new Error('UNAUTHENTICATED');
    }

    // TODO: check quyền xem thật sự — ownership / subscription
    // vd: const canView = await checkVideoAccess(session.user.id, videoId);
    // if (!canView) throw new Error('FORBIDDEN');

    const resourcePattern = `https://${process.env.CLOUDFRONT_DOMAIN}/videos/${videoId}/*`;
    const expiresInSeconds = 6 * 60 * 60; // 6 tiếng

    const signedCookies = generateCloudFrontSignedCookies({
      resourcePattern,
      expiresInSeconds,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    });
    const cookieStore = await cookies();
    const cookieOptions = {
      domain: process.env.COOKIE_DOMAIN,
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: expiresInSeconds,
      path: '/',
    };

    cookieStore.set('CloudFront-Policy', signedCookies['CloudFront-Policy'], cookieOptions);
    cookieStore.set('CloudFront-Signature', signedCookies['CloudFront-Signature'], cookieOptions);
    cookieStore.set(
      'CloudFront-Key-Pair-Id',
      signedCookies['CloudFront-Key-Pair-Id'],
      cookieOptions,
    );
    const manifestUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/videos/${videoId}/master.m3u8`;

    return FnResponse.Succeed<string>('', manifestUrl);
  } catch (err) {
    const error = err as Error;
    return FnResponse.Fail('', { message: error.message, name: error.name, code: 500 });
  }
}
