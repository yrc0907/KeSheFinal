import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        systemType: { label: "System Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        // If login with a system type, update user's system type
        if (credentials.systemType && user.systemType !== credentials.systemType) {
          await prisma.user.update({
            where: { id: user.id },
            data: { systemType: credentials.systemType },
          })
        }

        return user
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.name) {
          token.name = session.name
        }
        if (session.image) {
          token.picture = session.image
        }
        if (session.systemType) {
          token.systemType = session.systemType
        }
      }
      if (user) {
        token.id = user.id
        token.name = user.name
        token.picture = user.image
        token.systemType = (user as any).systemType || "rental"
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string | null
        session.user.image = token.picture as string | null
        session.user.systemType = token.systemType as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} 