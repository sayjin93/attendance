import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { date, classId, professorId } = await req.json();

    if (!professorId || !classId || !date) {
      return NextResponse.json(
        { error: "❌ All fields are required!" },
        { status: 400 }
      );
    }

    // ✅ Ensure professor owns the class before adding a lecture
    const classExists = await prisma.class.findFirst({
      where: { id: classId, professorId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: "❌ You cannot add lectures to a class you do not own!" },
        { status: 403 }
      );
    }

    // ✅ Check if a lecture already exists for this date & class
    const existingLecture = await prisma.lecture.findFirst({
      where: { date: new Date(date), classId },
    });

    if (existingLecture) {
      return NextResponse.json(
        { error: "❌ A lecture already exists for this date!" },
        { status: 409 }
      );
    }

    const newLecture = await prisma.lecture.create({
      data: { date: new Date(date), classId },
    });

    return NextResponse.json(newLecture, { status: 201 });
  } catch (error) {
    console.error("Error creating lecture:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to create lecture" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
