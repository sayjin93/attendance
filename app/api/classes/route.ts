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

    // ✅ Ensure decoded exists and extract professorId and isAdmin
    if (!decoded) {
      return NextResponse.json(
        { error: "❌ Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const professorId = decoded.professorId; // ✅ Get `professorId` from token

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID not found in session!" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeStudents = searchParams.get("includeStudents") === "true";

    // ✅ Fetch classes based on condition
    const classes = await prisma.class.findMany({
      include: {
        students: includeStudents, // ✅ Conditionally include students
      },
    });

    return NextResponse.json(classes || [], { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch classes" },
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

    // ✅ Ensure decoded exists and extract professorId and isAdmin
    if (!decoded) {
      return NextResponse.json(
        { error: "❌ Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const professorId = decoded.professorId; // ✅ Get `professorId` from token
    const isAdmin = decoded.isAdmin; // ✅ Get `isAdmin` from token

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Profesori nuk është i identifikuar!" },
        { status: 400 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "❌ Vetëm administratorët mund të krijojnë klasa!" },
        { status: 403 }
      );
    }

    const { name } = await req.json();

    // ✅ Check if class name already exists (Use `findFirst()`)
    const existingClass = await prisma.class.findFirst({
      where: { name },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "❌ Emri i klasës ekziston tashmë!" },
        { status: 409 }
      ); // 409 = Conflict
    }

    // ✅ Create new class
    const newClass = await prisma.class.create({
      data: { name },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating class:", error);
    return NextResponse.json(
      { error: "⚠️ Dështoi krijimi i klasës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
