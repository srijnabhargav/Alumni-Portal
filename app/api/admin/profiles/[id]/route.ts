import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { action, reason, adminUsername } = await request.json();

    if (action === "approve") {
      await prisma.alumni.update({
        where: { id: params.id },
        data: {
          status: "approved",
          reviewedAt: new Date(),
          reviewedBy: adminUsername,
        },
      });
    } else if (action === "reject") {
      await prisma.alumni.update({
        where: { id: params.id },
        data: {
          status: "rejected",
          reviewedAt: new Date(),
          reviewedBy: adminUsername,
          rejectionReason: reason,
        },
      });
    } else if (action === "block") {
      const alumni = await prisma.alumni.findUnique({
        where: { id: params.id },
      });

      if (alumni) {
        // Add to blocked users
        await prisma.blockedUser.create({
          data: {
            email: alumni.email,
            blockedBy: adminUsername,
            reason,
          },
        });

        // Update alumni status
        await prisma.alumni.update({
          where: { id: params.id },
          data: {
            status: "blocked",
            reviewedAt: new Date(),
            reviewedBy: adminUsername,
          },
        });
      }
    } else if (action === "unblock") {
      const alumni = await prisma.alumni.findUnique({
        where: { id: params.id },
      });

      if (alumni) {
        // Remove from blocked users
        await prisma.blockedUser.deleteMany({
          where: { email: alumni.email },
        });

        // Update alumni status to pending for review
        await prisma.alumni.update({
          where: { id: params.id },
          data: {
            status: "rejected",
            reviewedAt: new Date(),
            reviewedBy: adminUsername,
            rejectionReason: null, // Clear previous rejection reason
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
