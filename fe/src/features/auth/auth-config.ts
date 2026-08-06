import { ModelUser } from '@/src/features/auth/models/user';
import connectDB from '@/src/lib/db';
import { getUserAction } from '@/src/features/auth/actions/get-user.action';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/sign-in',
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.fullName = token.name;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existsUser = await ModelUser.findOne({ email: user.email }).lean().exec();

        if (!existsUser) {
          if (!user.email || !user.name) {
            console.error('User email or User name must not be null or undefined');
            return false;
          }

          const created = await ModelUser.create({
            fullName: user.name,
            email: user.email,
            isActive: 1,
            googleId: account?.id_token,
          });
          user.id = created._id.toString();
        } else {
          user.id = existsUser._id.toString();
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

    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          throw new Error('Invalid credentials');
        }

        const { email, password } = parsedCredentials.data;
        const response = await getUserAction(email);
        if (!response.success) {
          throw new Error(response.message);
        }

        const { data: user } = response;

        if (!user.password) {
          if (user.googleId) {
            throw new Error('User is using google authentication without password');
          }
          throw new Error('Password must not null');
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) throw new Error('Password is incorrect');

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
        };
      },
    }),
  ],
};
