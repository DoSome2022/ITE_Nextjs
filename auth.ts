// src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth-options";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  trustHost: true,
  debug: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["pkce"],
      allowDangerousEmailAccountLinking: true,
      
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          username: profile.email ? profile.email.split("@")[0] : `user_${profile.sub}`,
          role: "USER",
        }
      },
    }),

    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        const user = await db.user.findUnique({
          where: { username },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,
            schoolId: user.name, 
          };
        }
        return null;
      },
    }),
  ],

  events: {
    async signIn({ user, account }) {
      console.log('🎉 signIn event:', { user: user.id, account: account?.provider });
    },
  },
});
