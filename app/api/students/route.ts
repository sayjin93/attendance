import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

const prisma = new PrismaClient();

// ✅ GET: Fetch students for a specific class
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
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required!" },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: { classId: Number(classId) },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);

    return NextResponse.json(
      { error: "Failed to fetch students!" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const { firstName, lastName, classId, professorId } = await req.json();

    if (!professorId || !classId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "❌ All fields are required!" },
        { status: 400 }
      );
    }

    // ✅ Ensure professor owns the class before adding a student
    const classExists = await prisma.class.findFirst({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: "❌ You cannot add students to a class you do not own!" },
        { status: 403 }
      );
    }

    // ✅ Trim spaces and capitalize first letter
    const formatName = (name: string) =>
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);

    const newStudent = await prisma.student.create({
      data: {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        classId,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to create student" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
