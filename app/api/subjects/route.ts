import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

const prisma = new PrismaClient();

// ✅ GET: Fetch all subjects for the logged-in professor or all subjects for admins
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

    // ✅ Fetch subjects AND include Program data
    const subjects = await prisma.subject.findMany({
      include: {
        program: true, // ✅ Include program data
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
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST: Create a new subject (Only Admins)
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

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

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Dështoi krijimi i lëndës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
