import { ModelUser } from '@/src/features/auth/models/user';
import connectDB from '@/src/lib/db';
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authConfig = {
  pages: {
    signIn: '/sign-in',
  },

  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage =
        nextUrl.pathname === '/sign-in' ||
        nextUrl.pathname === '/sign-up' ||
        nextUrl.pathname === '/forgot-password' ||
        nextUrl.pathname === '/verify-otp' ||
        nextUrl.pathname === '/reset-password';

      if (isPublicPage && isLoggedIn) {
        const url = nextUrl.clone();
        url.pathname = '/';
        console.log('url: ', url);
        // const url = nextUrl.clone();
        // nextUrl
        // console.log('headers: ', url.options.headers);

        return Response.redirect(url);
      }

      if (isPublicPage) return true;

      if (!isLoggedIn) return false;

      return true;
    },

    // async jwt({ token, user }: { token: any; user: any }) {
    //   if (user) {
    //     token.fullName = user.fullName;
    //   }
    //   return token;
    // },

    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.fullName = token.name;
      }
      return session;
    },

    // async redirect({ url, baseUrl }) {
    //   if (url.startsWith("/")) return `${baseUrl}${url}`;

    //   if (new URL(url).origin === baseUrl) return url;

    //   return baseUrl;
    // },

    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider == 'google') {
        await connectDB();
        const existsUser = await ModelUser.findOne({
          email: user.email,
        })
          .lean()
          .exec();

        if (!existsUser) {
          if (!user.email || !user.name) {
            console.error('User email or User name must not null or undefine');
            return false;
          }

          await ModelUser.create({
            fullName: user.name,
            email: user.email,
            isActive: 1,
            googleId: account?.id_token,
          });
        } else {
          if (existsUser?.isActive == 1 && existsUser?.googleId) return true;

          await ModelUser.findOneAndUpdate(
            { _id: existsUser._id },
            { isActive: 1, googleId: account?.id_token },
          );
        }
      }

      return true;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
} satisfies NextAuthConfig;
