import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET - Merr të gjitha klasat dhe lëndët për një profesor ose për të gjithë nëse është admin
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId");

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID është i nevojshëm!" },
        { status: 400 }
      );
    }

    // ✅ Kontrollo nëse profesori është admin
    const professor = await prisma.professor.findUnique({
      where: { id: Number(professorId) },
      select: { isAdmin: true },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "❌ Profesori nuk u gjet!" },
        { status: 404 }
      );
    }

    let classes;

    if (professor.isAdmin) {
      // ✅ Nëse është admin, merr të gjitha klasat dhe lëndët për secilën klasë
      classes = await prisma.class.findMany({
        include: {
          program: {
            include: {
              subject: {
                // ✅ Saktësimi i emrit të saktë nga Prisma
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } else {
      // ✅ Nëse nuk është admin, merr vetëm klasat ku profesori jep mësim
      classes = await prisma.class.findMany({
        where: {
          program: {
            subject: {
              some: {
                teachingAssignments: {
                  some: { professorId: Number(professorId) },
                },
              },
            },
          },
        },
        include: {
          program: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    // ✅ Kthejmë të dhënat në formatin e duhur
    const formattedClasses = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      subjects: cls.program?.subject || [], // ✅ Marrim lëndët e programit të klasës
    }));

    return NextResponse.json(formattedClasses, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes and subjects:", error);
    return NextResponse.json(
      { error: "❌ Dështoi marrja e klasave dhe lëndëve." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const { date, classId, subjectId, professorId } = await req.json();

    if (!professorId || !classId || !subjectId || !date) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    // ✅ Verifikojmë nëse profesori ka të drejtë të japë këtë lëndë në këtë klasë
    const teachingAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        professorId,
        subjectId,
        subject: {
          program: {
            classes: { some: { id: classId } },
          },
        },
      },
    });

    if (!teachingAssignment) {
      return NextResponse.json(
        { error: "You are not assigned to this subject in this class!" },
        { status: 403 }
      );
    }

    // ✅ Kontrollojmë nëse ekziston një leksion për këtë klasë, lëndë dhe datë
    const existingLecture = await prisma.lecture.findFirst({
      where: { date: new Date(date), classId, subjectId },
    });

    if (existingLecture) {
      return NextResponse.json(
        {
          error:
            "A lecture already exists for this class and subject on this date!",
        },
        { status: 409 }
      );
    }

    // ✅ Krijojmë leksionin
    const newLecture = await prisma.lecture.create({
      data: { date: new Date(date), classId, subjectId, professorId },
    });

    return NextResponse.json(newLecture, { status: 201 });
  } catch (error) {
    console.error("Error creating lecture:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to create lecture" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
