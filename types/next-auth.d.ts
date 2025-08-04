import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'
import { Alumni } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      alumni?: Alumni
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    alumniId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
  }
}