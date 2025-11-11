import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";
import { logActivity } from "@/lib/activityLogger";

export async function GET() {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const professorId = Number(decoded.professorId);
    const isAdmin = decoded.isAdmin;

    let assignments;
    if (isAdmin) {
      assignments = await prisma.teachingAssignment.findMany({
        include: {
          professor: { select: { id: true, firstName: true, lastName: true } },
          subject: { select: { id: true, name: true, code: true } },
          class: { 
            select: { 
              id: true, 
              name: true,
              program: { select: { id: true, name: true } }
            } 
          },
          type: { select: { id: true, name: true } },
        },
        orderBy: [{ subject: { name: 'asc' } }, { class: { name: 'asc' } }],
      });
    } else {
      assignments = await prisma.teachingAssignment.findMany({
        where: { professorId },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { 
            select: { 
              id: true, 
              name: true,
              program: { select: { id: true, name: true } }
            } 
          },
          type: { select: { id: true, name: true } },
        },
        orderBy: [{ subject: { name: 'asc' } }, { class: { name: 'asc' } }],
      });
    }

    let lectures;
    if (isAdmin) {
      lectures = await prisma.lecture.findMany({
        include: {
          teachingAssignment: {
            include: {
              professor: { select: { id: true, firstName: true, lastName: true } },
              subject: { select: { id: true, name: true, code: true } },
              class: { select: { id: true, name: true } },
              type: { select: { id: true, name: true } },
            }
          },
          attendance: { select: { id: true, status: true } },
        },
        orderBy: [{ date: 'desc' }],
      });
    } else {
      lectures = await prisma.lecture.findMany({
        where: { 
          teachingAssignment: {
            professorId: professorId
          }
        },
        include: {
          teachingAssignment: {
            include: {
              subject: { select: { id: true, name: true, code: true } },
              class: { select: { id: true, name: true } },
              type: { select: { id: true, name: true } },
            }
          },
          attendance: { select: { id: true, status: true } },
        },
        orderBy: [{ date: 'desc' }],
      });
    }

    return NextResponse.json({ assignments, lectures, isAdmin, professorId }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return NextResponse.json({ error: "Failed to fetch lectures!" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const { assignmentId, date } = await req.json();

    if (!assignmentId || !date) {
      return NextResponse.json(
        { error: "Assignment ID dhe data janë të detyrueshme!" },
        { status: 400 }
      );
    }

    const professorId = Number(decoded.professorId);

    const assignment = await prisma.teachingAssignment.findFirst({
      where: {
        id: assignmentId,
        ...(decoded.isAdmin ? {} : { professorId }),
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Caktimi nuk u gjet ose nuk ju përket!" },
        { status: 404 }
      );
    }

    const existingLecture = await prisma.lecture.findFirst({
      where: {
        date: new Date(date),
        teachingAssignmentId: assignmentId,
      },
    });

    if (existingLecture) {
      return NextResponse.json(
        { error: "Ekziston tashmë një leksion për këtë datë, klasë dhe lëndë!" },
        { status: 409 }
      );
    }

    const newLecture = await prisma.lecture.create({
      data: {
        date: new Date(date),
        teachingAssignmentId: assignmentId,
      },
      include: {
        teachingAssignment: {
          include: {
            professor: { select: { id: true, firstName: true, lastName: true } },
            subject: { select: { id: true, name: true, code: true } },
            class: { select: { id: true, name: true } },
            type: { select: { id: true, name: true } },
          }
        },
      },
    });

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "CREATE",
      entity: "lectures",
      entityId: newLecture.id,
      details: {
        date: new Date(date).toISOString(),
        assignmentId,
        subject: newLecture.teachingAssignment.subject.name,
        class: newLecture.teachingAssignment.class.name,
      },
    });

    return NextResponse.json(newLecture, { status: 201 });
  } catch (error) {
    console.error("Error creating lecture:", error);
    return NextResponse.json({ error: "Dështoi krijimi i leksionit!" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të modifikojnë leksionet!" },
        { status: 403 }
      );
    }

    const { id, assignmentId, date } = await req.json();

    if (!id || !assignmentId || !date) {
      return NextResponse.json(
        { error: "ID, assignment ID dhe data janë të detyrueshme!" },
        { status: 400 }
      );
    }

    const existingLecture = await prisma.lecture.findUnique({
      where: { id },
    });

    if (!existingLecture) {
      return NextResponse.json(
        { error: "Leksioni nuk ekziston!" },
        { status: 404 }
      );
    }

    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Caktimi nuk ekziston!" },
        { status: 404 }
      );
    }

    const updatedLecture = await prisma.lecture.update({
      where: { id },
      data: {
        date: new Date(date),
        teachingAssignmentId: assignmentId,
      },
      include: {
        teachingAssignment: {
          include: {
            professor: { select: { id: true, firstName: true, lastName: true } },
            subject: { select: { id: true, name: true, code: true } },
            class: { select: { id: true, name: true } },
            type: { select: { id: true, name: true } },
          }
        },
      },
    });

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "UPDATE",
      entity: "lectures",
      entityId: id,
      details: {
        changes: {
          date: { old: existingLecture.date, new: new Date(date) },
          assignmentId: { old: existingLecture.teachingAssignmentId, new: assignmentId },
        },
      },
    });

    return NextResponse.json(updatedLecture, { status: 200 });
  } catch (error) {
    console.error("Error updating lecture:", error);
    return NextResponse.json({ error: "Dështoi përditësimi i leksionit!" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të fshijnë leksionet!" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID e leksionit është e detyrueshme!" },
        { status: 400 }
      );
    }

    const lectureId = parseInt(id);

    const existingLecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: { attendance: true },
    });

    if (!existingLecture) {
      return NextResponse.json(
        { error: "Leksioni nuk ekziston!" },
        { status: 404 }
      );
    }

    if (existingLecture.attendance.length > 0) {
      return NextResponse.json(
        { error: "Nuk mund të fshihet një leksion që ka regjistra prezence!" },
        { status: 400 }
      );
    }

    await prisma.lecture.delete({
      where: { id: lectureId },
    });

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "DELETE",
      entity: "lectures",
      entityId: lectureId,
      details: {
        date: existingLecture.date,
        assignmentId: existingLecture.teachingAssignmentId,
      },
    });

    return NextResponse.json(
      { message: "Leksioni u fshi me sukses!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lecture:", error);
    return NextResponse.json({ error: "Dështoi fshirja e leksionit!" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
