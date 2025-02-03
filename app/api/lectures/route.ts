import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Fetch Lectures API
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ?? undefined;

    if (!classId) {
      return NextResponse.json(
        { error: "❌ Class ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Fetch lectures for the given class
    const lectures = await prisma.lecture.findMany({
      where: { classId },
    });

    return NextResponse.json(lectures.length > 0 ? lectures : [], {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error fetching lectures:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch lectures" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ Add Lecture API
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

    // ✅ Check if lecture already exists for this date & class
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
