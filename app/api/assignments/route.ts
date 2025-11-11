import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

// ✅ GET: Fetch all teaching assignments + professors + subjects + teaching types
export async function GET() {
  try {
    const auth = await authenticateRequest();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    // ✅ Fetch all professors (excluding admins)
    const professors = await prisma.professor.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // ✅ Fetch all programs
    const programs = await prisma.program.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // ✅ Fetch all subjects with program info
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        programId: true,
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // ✅ Fetch all classes with program info
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        programId: true,
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // ✅ Fetch all teaching types from the database
    const teachingTypes = await prisma.teachingType.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // ✅ Fetch assignments based on user role
    let assignments;
    if (decoded.isAdmin) {
      assignments = await prisma.teachingAssignment.findMany({
        include: {
          professor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          type: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { subject: { name: 'asc' } },
          { class: { name: 'asc' } },
        ],
      });
    } else {
      assignments = await prisma.teachingAssignment.findMany({
        where: { professorId: parseInt(decoded.professorId as string, 10) },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          type: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { subject: { name: 'asc' } },
          { class: { name: 'asc' } },
        ],
      });
    }

    return NextResponse.json(
      { assignments, professors, subjects, classes, programs, teachingTypes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teaching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching assignments" },
      { status: 500 }
    );
  }
}

// ✅ POST: Assign a professor to a subject (Only Admins)
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të caktojnë lëndë për profesorët!" },
        { status: 403 }
      );
    }

    const { professorId, subjectId, classId, typeId } = await req.json();

    // ✅ Validate required fields
    if (!professorId || !subjectId || !classId || !typeId) {
      return NextResponse.json(
        { error: "Professor ID, Subject ID, Class ID dhe Type ID janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // ✅ Check if professor exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!existingProfessor) {
      return NextResponse.json(
        { error: "Profesori nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Lënda nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Check if teaching type exists
    const existingTeachingType = await prisma.teachingType.findUnique({
      where: { id: typeId },
    });

    if (!existingTeachingType) {
      return NextResponse.json(
        { error: "Lloji i mësimit nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Klasa nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Check if assignment already exists for same professor, subject, and class
    const existingAssignment = await prisma.teachingAssignment.findFirst({
      where: { 
        professorId, 
        subjectId, 
        classId 
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Ky profesor është tashmë i caktuar për këtë lëndë në këtë klasë!" },
        { status: 409 }
      );
    }

    // ✅ Create new teaching assignment
    const newAssignment = await prisma.teachingAssignment.create({
      data: {
        professorId,
        subjectId,
        classId,
        typeId,
      },
      include: {
        professor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error("Error assigning professor:", error);
    return NextResponse.json(
      { error: "Dështoi caktimi i lëndës për profesorin" },
      { status: 500 }
    );
  }
}
