// ./auth.config.ts
import type { NextAuthConfig } from "next-auth";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (trigger === "update" && session) {
        token = { ...token, ...session };
        return token;
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // @ts-ignore
        token.role = user.role || UserRole.USER; 
        // @ts-ignore
        token.name = user.name;
        
        if (account?.provider === 'google') {
          token.loginMethod = 'google';
        } else {
          token.loginMethod = 'local';
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        // @ts-ignore
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.name = token.name as string;
        // @ts-ignore
        session.user.loginMethod = token.loginMethod as string || 'local';
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;