import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId"); // ✅ Get professor ID

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Fetch reports only for professor's students
    const reports = await prisma.attendance.groupBy({
      by: ["studentId"],
      where: {
        student: { class: { professorId } }, // ✅ Only fetch reports for professor's students
      },
      _count: {
        status: true,
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch reports" },
      { status: 500 }
    );
  }
}
