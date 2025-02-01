import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json([], { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: { attendance: true },
    });

    const reports = students.map((student) => {
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
        name: student.name,
        presence,
        absence,
        participation,
      };
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim gjatë marrjes së raporteve" },
      { status: 500 }
    );
  }
}
