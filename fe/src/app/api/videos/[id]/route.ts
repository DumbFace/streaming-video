import { grantVideoAccess } from '@/src/features/video/actions/grant-video-access';
import { FnResponse } from '@/src/lib/fn-response';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // const cookieStore = await cookies();
  // const cloudfrontSignature = cookieStore.get('CloudFront-Signature')?.value;
  // console.log('cloudfrontSignature; ', cloudfrontSignature);

  // if (cloudfrontSignature)
  //   return NextResponse.json(
  //     FnResponse.Succeed<string>(
  //       '',
  //       `https://${process.env.CLOUDFRONT_DOMAIN}/videos/${id}/master.m3u8`,
  //     ),
  //   );

  const response = await grantVideoAccess(id);

  if (!response.success) return NextResponse.json(response);

  return NextResponse.json(response);
}
