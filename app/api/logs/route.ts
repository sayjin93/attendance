import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

// GET: Fetch activity logs (Admin only)
export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të shikojnë logs!" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (entity && entity !== "all") {
      whereClause.entity = entity;
    }

    if (action && action !== "all") {
      whereClause.action = action;
    }

    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDateTime;
      }
    }

    // Get total count for pagination
    const total = await prisma.activityLog.count({ where: whereClause });

    // Fetch logs with pagination
    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(
      {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Dështoi marrja e logs!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
