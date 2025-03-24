import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

const prisma = new PrismaClient();

// GET: Fetch all classes for the logged-in professor or all classes for admins
export async function GET() {
  try {
    const auth = await authenticateRequest();

    // Check auth
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

    // Fetch classes AND include Program data
    const classes = await prisma.class.findMany({
      include: {
        program: true, // Include program data
      },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new class (Only Admins)
export async function POST(req: Request) {
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
        { error: "Vetëm administratorët mund të krijojnë klasa!" },
        { status: 403 }
      );
    }

    const { name, programId } = await req.json();

    // Validate required fields
    if (!name || !programId) {
      return NextResponse.json(
        { error: "Emri i klasës dhe Program ID janë të detyrueshëm!" },
        { status: 400 }
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

    // Check if class name already exists in the selected program
    const existingClass = await prisma.class.findFirst({
      where: { name, programId },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "Një klasë me këtë emër ekziston tashmë në këtë program!" },
        { status: 409 }
      );
    }

    // Create the new class under the selected program
    const newClass = await prisma.class.create({
      data: {
        name,
        programId,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Dështoi krijimi i klasës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
