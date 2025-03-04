import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";

// ✅ Helper function to authenticate user
async function authenticateRequest() {
  const cookieStore = await cookies(); // ✅ Get cookies
  const token = cookieStore.get("session")?.value;

  if (!token) return { error: "Not authenticated", status: 401 };

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    if (!decoded || !decoded.professorId)
      return { error: "Invalid session", status: 401 }; // ✅ Ensure `decoded` exists
    return { decoded };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { error: "Session expired", status: 401 };
    }
    return { error: "Invalid session", status: 401 };
  }
}

// ✅ GET: Fetch all classes for the logged-in professor or all classes for admins
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const includeStudents = searchParams.get("includeStudents") === "true";

    // ✅ Fetch classes AND include Program data
    const classes = await prisma.class.findMany({
      include: {
        students: includeStudents,
        program: true, // ✅ Include program data
      },
    });

    // ✅ Fetch all programs separately
    const programs = await prisma.program.findMany();

    return NextResponse.json({ classes, programs }, { status: 200 });
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

// ✅ POST: Create a new class (Only Admins)
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

    const { name, programId } = await req.json();

    // ✅ Validate required fields
    if (!name || !programId) {
      return NextResponse.json(
        { error: "Emri i klasës dhe Program ID janë të detyrueshëm!" },
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

    // ✅ Check if class name already exists in the selected program
    const existingClass = await prisma.class.findFirst({
      where: { name, programId },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "Një klasë me këtë emër ekziston tashmë në këtë program!" },
        { status: 409 }
      );
    }

    // ✅ Create the new class under the selected program
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
