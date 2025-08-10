import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is blocked
    const blockedUser = await prisma.blockedUser.findUnique({
      where: { email: session.user.email },
    });

    if (blockedUser) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const data = await request.json();

    // Check if user already has a profile
    const existingProfile = await prisma.alumni.findUnique({
      where: { email: session.user.email },
    });

    let alumni;
    if (existingProfile) {
      // Update existing profile (for rejected users resubmitting)
      alumni = await prisma.alumni.update({
        where: { email: session.user.email },
        data: {
          ...data,
          status: "pending",
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          rejectionReason: null,
        },
      });
    } else {
      // Create new profile
      alumni = await prisma.alumni.create({
        data: {
          ...data,
          email: session.user.email,
          status: "pending",
        },
      });
    }

    // Link user to alumni profile
    await prisma.user.update({
      where: { email: session.user.email },
      data: { alumniId: alumni.id },
    });

    return NextResponse.json({ success: true, alumni });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alumni = await prisma.alumni.findUnique({
      where: { email: session.user.email },
    });

    return NextResponse.json({ alumni });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
