import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Get session with your auth options
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (
      data.graduationYear &&
      (isNaN(data.graduationYear) ||
        data.graduationYear < 1900 ||
        data.graduationYear > new Date().getFullYear())
    ) {
      return NextResponse.json(
        { error: "Invalid graduation year" },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find the user by email - Fix: Handle null email properly
      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error("User email not found");
      }

      const user = await tx.user.findUnique({
        where: { email: userEmail }, // Now userEmail is guaranteed to be string
        include: { alumni: true }, // Fix: Make sure this include works
      });

      if (!user) {
        throw new Error("User not found");
      }

      let updatedAlumni;

      // Fix: Check if user has alumni using the correct property
      if (user.alumni) {
        // Update existing alumni record
        updatedAlumni = await tx.alumni.update({
          where: { id: user.alumni.id },
          data: {
            name: data.name || null,
            graduationYear: data.graduationYear || null,
            degree: data.degree || null,
            department: data.department || null,
            currentJob: data.currentJob || null,
            phone: data.phone || null,
            company: data.company || null,
            location: data.location || null,
            linkedinUrl: data.linkedinUrl || null,
            profilePicture: data.profilePicture || null,
            bio: data.bio || null,
            updatedAt: new Date(),
          },
        });
      } else {
        // Check if alumni record exists for this email
        const existingAlumni = await tx.alumni.findUnique({
          where: { email: userEmail },
        });

        if (existingAlumni) {
          // Update existing alumni record
          updatedAlumni = await tx.alumni.update({
            where: { id: existingAlumni.id },
            data: {
              name: data.name || null,
              graduationYear: data.graduationYear || null,
              degree: data.degree || null,
              department: data.department || null,
              currentJob: data.currentJob || null,
              phone: data.phone || null,
              company: data.company || null,
              location: data.location || null,
              linkedinUrl: data.linkedinUrl || null,
              profilePicture: data.profilePicture || null,
              bio: data.bio || null,
              updatedAt: new Date(),
            },
          });

          // Link the alumni record to the user
          await tx.user.update({
            where: { id: user.id },
            data: { alumniId: updatedAlumni.id },
          });
        } else {
          throw new Error("Alumni record not found");
        }
      }

      return updatedAlumni;
    });

    return NextResponse.json({
      message: "Alumni information updated successfully",
      alumni: result,
    });
  } catch (error) {
    console.error("Error updating alumni information:", error);

    if (error instanceof Error) {
      if (
        error.message === "User not found" ||
        error.message === "User email not found"
      ) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.message === "Alumni record not found") {
        return NextResponse.json(
          { error: "Alumni record not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
