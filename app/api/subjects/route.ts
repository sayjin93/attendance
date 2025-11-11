import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";
import { logActivity, getChangedFields } from "@/lib/activityLogger";

// ✅ GET: Fetch all subjects for the logged-in professor or all subjects for admins
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

    // ✅ Fetch subjects AND include Program data + classes through teaching assignments
    const subjects = await prisma.subject.findMany({
      include: {
        program: true, // ✅ Include program data
        teachingAssignments: {
          include: {
            class: true, // ✅ Include class data from teaching assignments
          },
        },
      },
    });

    // ✅ Fetch all programs separately
    const programs = await prisma.program.findMany();

    return NextResponse.json({ subjects, programs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create a new subject (Only Admins)
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    // ✅ Ensure user is authenticated
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const isAdmin = decoded.isAdmin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të krijojnë klasa!" },
        { status: 403 }
      );
    }

    const { code, name, programId } = await req.json();

    // ✅ Validate required fields
    if (!name || !programId) {
      return NextResponse.json(
        { error: "Emri i lendës dhe Program ID janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // ✅ Check if the provided program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Programi nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Check if subjecy name already exists in the selected program
    const existingSubject = await prisma.subject.findFirst({
      where: { name, programId },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Një lendë me këtë emër ekziston tashmë në këtë program!" },
        { status: 409 }
      );
    }

    // ✅ Create the new subject under the selected program
    const newSubject = await prisma.subject.create({
      data: {
        code,
        name,
        programId,
      },
    });

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "CREATE",
      entity: "subjects",
      entityId: newSubject.id,
      details: { code, name, programId },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Dështoi krijimi i lëndës" },
      { status: 500 }
    );
  }
}

// PUT: Update a subject (Only Admins)
export async function PUT(req: Request) {
  try {
    const auth = await authenticateRequest();

    // Check auth
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    // Ensure user is authenticated
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const isAdmin = decoded.isAdmin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të modifikojnë lëndët!" },
        { status: 403 }
      );
    }

    const { id, code, name, programId } = await req.json();

    // Validate required fields
    if (!id || !name || !programId) {
      return NextResponse.json(
        { error: "ID, emri i lëndës dhe Program ID janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // Check if the subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Lënda nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if the provided program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Programi nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if another subject with the same name already exists in the selected program
    const duplicateSubject = await prisma.subject.findFirst({
      where: { 
        name, 
        programId,
        NOT: { id } // Exclude current subject from check
      },
    });

    if (duplicateSubject) {
      return NextResponse.json(
        { error: "Një lëndë me këtë emër ekziston tashmë në këtë program!" },
        { status: 409 }
      );
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        code,
        name,
        programId,
      },
      include: {
        program: true,
      },
    });

    // Log activity
    const changes = getChangedFields(
      {
        code: existingSubject.code,
        name: existingSubject.name,
        programId: existingSubject.programId,
      },
      { code, name, programId }
    );

    if (Object.keys(changes).length > 0) {
      await logActivity({
        userId: decoded.professorId as number,
        userName: `${decoded.firstName} ${decoded.lastName}`,
        action: "UPDATE",
        entity: "subjects",
        entityId: id,
        details: { changes },
      });
    }

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Dështoi modifikimi i lëndës" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subject (Only Admins)
export async function DELETE(req: Request) {
  try {
    const auth = await authenticateRequest();

    // Check auth
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    // Ensure user is authenticated
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const isAdmin = decoded.isAdmin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të fshijnë lëndët!" },
        { status: 403 }
      );
    }

    const { id } = await req.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID e lëndës është e detyrueshme!" },
        { status: 400 }
      );
    }

    // Check if the subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        teachingAssignments: {
          include: {
            lectures: true, // Include lectures through teaching assignments
          },
        },
      },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Lënda nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if subject has teaching assignments or lectures
    const hasTeachingAssignments = existingSubject.teachingAssignments && existingSubject.teachingAssignments.length > 0;
    const hasLectures = existingSubject.teachingAssignments.some(assignment => 
      assignment.lectures && assignment.lectures.length > 0
    );

    if (hasTeachingAssignments || hasLectures) {
      return NextResponse.json(
        { error: "Nuk mund të fshihet lënda sepse ka caktime mësimore ose leksione!" },
        { status: 400 }
      );
    }

    // Delete the subject
    await prisma.subject.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "DELETE",
      entity: "subjects",
      entityId: id,
      details: {
        code: existingSubject.code,
        name: existingSubject.name,
        programId: existingSubject.programId,
      },
    });

    return NextResponse.json({ message: "Lënda u fshi me sukses!" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Dështoi fshirja e lëndës" },
      { status: 500 }
    );
  }
}
