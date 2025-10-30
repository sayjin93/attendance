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
    interface TeachingType {
      id: number;
      name: string;
    }

    interface Stats {
      classes?: number;
      students?: number;
      professors?: number;
      subjects?: number;
      assignments?: number;
      lectures: number;
      attendance?: number;
      assignmentClasses?: Array<{ id: number; name: string; types: TeachingType[] }>;
      subjectList?: Array<{ id: number; name: string; code: string; types: TeachingType[] }>;
    }

    const stats: Stats = {
      lectures: 0,
    };

    // If admin, get all stats
    if (decoded.isAdmin) {
      const [classes, students, professors, subjects, assignments, lectures] = await Promise.all([
        prisma.class.count(),
        prisma.student.count(),
        prisma.professor.count({
          where: {
            isAdmin: false,
          },
        }),
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
      // For non-admin professors, get their specific stats and data
      const professorId = Number(decoded.professorId);
      
      const [assignmentData, subjectData, lectures, lecturesWithAttendance] = await Promise.all([
        // Get teaching assignments with class and type info for this professor
        prisma.teachingAssignment.findMany({
          where: {
            professorId: professorId,
          },
          include: {
            class: true,
            type: true,
          },
        }),
        // Get unique subjects this professor teaches with type info
        prisma.teachingAssignment.findMany({
          where: {
            professorId: professorId,
          },
          include: {
            subject: true,
            type: true,
          },
          distinct: ['subjectId'],
        }),
        // Count lectures given by this professor
        prisma.lecture.count({
          where: {
            professorId: professorId,
          },
        }),
        // Count lectures with attendance records for this professor
        prisma.lecture.count({
          where: {
            professorId: professorId,
            attendance: {
              some: {},
            },
          },
        }),
      ]);

      // Extract unique classes with their types
      const classMap = new Map();
      assignmentData.forEach(a => {
        const classId = a.class.id;
        if (!classMap.has(classId)) {
          classMap.set(classId, {
            ...a.class,
            types: []
          });
        }
        const classData = classMap.get(classId);
        if (!classData.types.some((t: TeachingType) => t.id === a.type.id)) {
          classData.types.push(a.type);
        }
      });
      const uniqueClasses = Array.from(classMap.values());

      // Extract unique subjects with their types
      const subjectMap = new Map();
      subjectData.forEach(s => {
        const subjectId = s.subject.id;
        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            ...s.subject,
            types: []
          });
        }
        const subjectDataItem = subjectMap.get(subjectId);
        if (!subjectDataItem.types.some((t: TeachingType) => t.id === s.type.id)) {
          subjectDataItem.types.push(s.type);
        }
      });
      const uniqueSubjects = Array.from(subjectMap.values());

      stats.assignments = assignmentData.length;
      stats.subjects = subjectData.length;
      stats.lectures = lectures;
      stats.attendance = lecturesWithAttendance;
      
      // Add the actual data for display
      stats.assignmentClasses = uniqueClasses;
      stats.subjectList = uniqueSubjects;
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
