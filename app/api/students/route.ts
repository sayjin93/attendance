import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "❌ Class ID is required!" }, { status: 400 });
    }

    // ✅ Ensure the professor owns the class
    const classExists = await prisma.class.findFirst({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "❌ Class not found!" }, { status: 403 });
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: { class: true },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return NextResponse.json({ error: "⚠️ Failed to fetch students" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    debugger;
    const { name, email, classId, professorId } = await req.json();

    if (!professorId || !classId || !name) {
      return NextResponse.json({ error: "❌ All fields are required!" }, { status: 400 });
    }

    // ✅ Ensure professor owns the class before adding a student
    const classExists = await prisma.class.findFirst({
      where: { id: classId, professorId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "❌ You cannot add students to a class you do not own!" }, { status: 403 });
    }

    const newStudent = await prisma.student.create({
      data: { name, email, classId },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "⚠️ Failed to create student" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
