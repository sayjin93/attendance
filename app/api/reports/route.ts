import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId");
    const classId = searchParams.get("classId");

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: "❌ Class ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Fetch student reports for the given professor and class
    const reports = await prisma.student.findMany({
      where: { classId, class: { professorId } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        attendance: {
          select: {
            status: true,
          },
        },
      },
    });

    // ✅ Format the data into proper presence/absence/participation counts
    const formattedReports = reports.map((student) => {
      const presence = student.attendance.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const absence = student.attendance.filter(
        (a) => a.status === "ABSENT"
      ).length;
      const participation = student.attendance.filter(
        (a) => a.status === "PARTICIPATED"
      ).length;

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        presence,
        absence,
        participation,
      };
    });

    return NextResponse.json(formattedReports, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch reports" },
      { status: 500 }
    );
  }
}
