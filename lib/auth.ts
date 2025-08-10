import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user email is blocked
          const blockedUser = await prisma.blockedUser.findUnique({
            where: { email: user.email! },
          });

          if (blockedUser) {
            console.log(`Access denied: Email ${user.email} is blocked`);
            return false;
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, user }) {
      try {
        if (session.user) {
          session.user.id = user.id;
        }

        // Get user with alumni data
        const userWithAlumni = await prisma.user.findUnique({
          where: { id: user.id },
          include: { alumni: true },
        });

        if (userWithAlumni?.alumni && session.user) {
          session.user.alumni = userWithAlumni.alumni;
          session.user.profileStatus = userWithAlumni.alumni.status;
        } else {
          session.user.profileStatus = "no_profile";
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  session: {
    strategy: "database",
  },
};
