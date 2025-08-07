import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const alumni = await prisma.alumni.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return NextResponse.json(
      { error: "Failed to fetch alumni" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      graduationYear,
      degree,
      department,
      currentJob,
      company,
      location,
      linkedinUrl,
      bio,
      profilePicture,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const alumni = await prisma.alumni.create({
      data: {
        name,
        email,
        phone,
        graduationYear: parseInt(graduationYear),
        degree,
        department,
        currentJob,
        company,
        location,
        linkedinUrl,
        bio,
        profilePicture,
      },
    });

    return NextResponse.json(alumni, { status: 201 });
  } catch (error: any) {
    console.error("Error creating alumni:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Alumni with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create alumni" },
      { status: 500 }
    );
  }
}
