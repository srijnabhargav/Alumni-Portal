import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Add admin authentication check here if needed

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const profiles = await prisma.alumni.findMany({
      where: { status },
      orderBy: { submittedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
