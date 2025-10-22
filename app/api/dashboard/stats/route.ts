import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

export async function GET() {
  const auth = await authenticateRequest();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { decoded } = auth;

  try {
    // Base stats interface
    interface Stats {
      classes?: number;
      students?: number;
      professors?: number;
      subjects?: number;
      assignments?: number;
      lectures: number;
    }

    const stats: Stats = {
      lectures: 0,
    };

    // If admin, get all stats
    if (decoded.isAdmin) {
      const [classes, students, professors, subjects, assignments, lectures] = await Promise.all([
        prisma.class.count(),
        prisma.student.count(),
        prisma.professor.count(),
        prisma.subject.count(),
        prisma.teachingAssignment.count(),
        prisma.lecture.count(),
      ]);

      stats.classes = classes;
      stats.students = students;
      stats.professors = professors;
      stats.subjects = subjects;
      stats.assignments = assignments;
      stats.lectures = lectures;
    } else {
      // For non-admin professors, only count their lectures
      const lectures = await prisma.lecture.count({
        where: {
          professorId: Number(decoded.professorId),
        },
      });

      stats.lectures = lectures;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Dështoi marrja e statistikave" },
      { status: 500 }
    );
  }
}
