import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

const prisma = new PrismaClient();

// ✅ GET: Fetch all teaching assignments + professors + subjects + teaching types
export async function GET() {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

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

    // ✅ Fetch all subjects
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
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
          professor: true,
          subject: true,
          type: true,
        },
      });
    } else {
      assignments = await prisma.teachingAssignment.findMany({
        where: { professorId: decoded.id },
        include: {
          subject: true,
          type: true,
        },
      });
    }

    return NextResponse.json(
      { assignments, professors, subjects, teachingTypes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teaching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching assignments" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST: Assign a professor to a subject (Only Admins)
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të caktojnë lëndë për profesorët!" },
        { status: 403 }
      );
    }

    const { professorId, subjectId, typeId } = await req.json();

    // ✅ Validate required fields
    if (!professorId || !subjectId || !typeId) {
      return NextResponse.json(
        { error: "Professor ID, Subject ID dhe Type ID janë të detyrueshëm!" },
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

    // ✅ Check if assignment already exists
    const existingAssignment = await prisma.teachingAssignment.findFirst({
      where: { professorId, subjectId, typeId },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Ky profesor është tashmë i caktuar për këtë lëndë me këtë lloj mësimi!" },
        { status: 409 }
      );
    }

    // ✅ Create new teaching assignment
    const newAssignment = await prisma.teachingAssignment.create({
      data: {
        professor: { connect: { id: professorId } },
        subject: { connect: { id: subjectId } },
        type: { connect: { id: typeId } },
      },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error("Error assigning professor:", error);
    return NextResponse.json(
      { error: "Dështoi caktimi i lëndës për profesorin" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
