import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

// ✅ PUT: Update a teaching assignment (Only Admins)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të modifikojnë caktimet!" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const assignmentId = parseInt(id, 10);
    const { professorId, subjectId, classId, typeId } = await req.json();

    // ✅ Validate required fields
    if (!professorId || !subjectId || !classId || !typeId) {
      return NextResponse.json(
        { error: "Professor ID, Subject ID, Class ID dhe Type ID janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // ✅ Check if assignment exists
    const existingAssignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Caktimi nuk ekziston!" },
        { status: 404 }
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

    // ✅ Check if another assignment exists with same professor, subject, class (excluding current)
    const duplicateAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        professorId,
        subjectId,
        classId,
        id: { not: assignmentId },
      },
    });

    if (duplicateAssignment) {
      return NextResponse.json(
        { error: "Ekziston tashmë një caktim me këto të dhëna!" },
        { status: 409 }
      );
    }

    // ✅ Update the teaching assignment
    const updatedAssignment = await prisma.teachingAssignment.update({
      where: { id: assignmentId },
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
    });

    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Dështoi modifikimi i caktimit" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ DELETE: Delete a teaching assignment (Only Admins)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të fshijnë caktimet!" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const assignmentId = parseInt(id, 10);

    // ✅ Check if assignment exists
    const existingAssignment = await prisma.teachingAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Caktimi nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Check if there are any lectures associated with this assignment
    const relatedLectures = await prisma.lecture.findFirst({
      where: {
        teachingAssignmentId: assignmentId,
      },
    });

    if (relatedLectures) {
      return NextResponse.json(
        { error: "Nuk mund të fshini këtë caktim sepse ka leksione të lidhura me të!" },
        { status: 409 }
      );
    }

    // ✅ Delete the assignment
    await prisma.teachingAssignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json(
      { message: "Caktimi u fshi me sukses!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Dështoi fshirja e caktimit" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
