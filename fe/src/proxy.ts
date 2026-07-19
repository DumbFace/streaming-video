import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/verify-otp', '/reset-password'];

export default withAuth(
  function middleware(req) {
    const isLoggedIn = !!req.nextauth.token;
    const isPublicPage = publicPaths.includes(req.nextUrl.pathname);

    if (isPublicPage && isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isPublicPage = publicPaths.includes(req.nextUrl.pathname);
        if (isPublicPage) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
