import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

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
      if (account?.provider === 'google') {
        try {
          // Check if the user's email exists in the alumni database
          const alumni = await prisma.alumni.findUnique({
            where: { email: user.email! }
          })
          
          if (!alumni) {
            // Email not found in alumni database - deny access
            console.log(`Access denied: Email ${user.email} not found in alumni database`)
            return false
          }

          // Check if a user already exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // User exists, update alumni link if not already set
            if (!existingUser.alumniId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  alumniId: alumni.id,
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image,
                }
              })
            }
          }
          // If user doesn't exist, the PrismaAdapter will create it
          // We'll link it to alumni in the session callback

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },

    async session({ session, user }) {
      try {
        // Add user ID to session
        if (session.user) {
          session.user.id = user.id
        }
        
        // Get user with alumni data
        const userWithAlumni = await prisma.user.findUnique({
          where: { id: user.id },
          include: { alumni: true }
        })

        if (userWithAlumni) {
          // If user doesn't have alumni linked yet, try to link it
          if (!userWithAlumni.alumniId && session.user?.email) {
            const alumni = await prisma.alumni.findUnique({
              where: { email: session.user.email }
            })

            if (alumni) {
              // Link the alumni to the user
              await prisma.user.update({
                where: { id: user.id },
                data: { alumniId: alumni.id }
              })

              // Refetch user with alumni data
              const updatedUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: { alumni: true }
              })

              if (updatedUser?.alumni && session.user) {
                session.user.alumni = updatedUser.alumni
              }
            }
          } else if (userWithAlumni.alumni && session.user) {
            session.user.alumni = userWithAlumni.alumni
          }
        }
        
        return session
      } catch (error) {
        console.error('Error in session callback:', error)
        return session
      }
    },

    async jwt({ token, user }) {
      // Add user ID to token
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  events: {
    async createUser({ user }) {
      try {
        // Link newly created user to alumni if email matches
        if (user.email) {
          const alumni = await prisma.alumni.findUnique({
            where: { email: user.email }
          })

          if (alumni) {
            await prisma.user.update({
              where: { id: user.id },
              data: { alumniId: alumni.id }
            })
          }
        }
      } catch (error) {
        console.error('Error linking user to alumni in createUser event:', error)
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/unauthorized',
  },
  session: {
    strategy: 'database',
  },
}