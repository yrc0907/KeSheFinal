import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      systemType?: string;
    } & DefaultSession["user"]
  }

  interface User {
    systemType?: string;
    metadata?: string;
  }

  interface JWT {
    systemType?: string;
  }
} 