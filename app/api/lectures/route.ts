import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId"); // ✅ Get professor ID

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Fetch lectures only for classes belonging to the professor
    const lectures = await prisma.lecture.findMany({
      where: {
        class: { professorId }, // ✅ Filter by professor
      },
      include: { class: true },
    });

    return NextResponse.json(lectures, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching lectures:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch lectures" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { date, classId } = await req.json();
    const newLecture = await prisma.lecture.create({
      data: { date: new Date(date), classId },
    });
    return NextResponse.json(newLecture, { status: 201 });
  } catch (error) {
    console.error("Error creating lecture:", error);
    return NextResponse.json(
      { error: "Failed to create lecture" },
      { status: 500 }
    );
  }
}
