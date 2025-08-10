import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { Alumni } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      alumni?: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
        graduationYear: number | null;
        degree: string | null;
        department: string | null;
        currentJob: string | null;
        company: string | null;
        location: string | null;
        linkedinUrl: string | null;
        bio: string | null;
        profilePicture: string | null;
        status: string;
        submittedAt: Date;
        reviewedAt: Date | null;
        reviewedBy: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
      profileStatus?: string;
    } & DefaultSession["user"];
  }

  // interface User extends DefaultUser {
  //   id: string
  //   alumniId?: string | null
  // }
}

// declare module 'next-auth/jwt' {
//   interface JWT extends DefaultJWT {
//     id: string
//   }
// }
