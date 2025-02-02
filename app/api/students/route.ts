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

    // ✅ Fetch students only for classes belonging to the professor
    const students = await prisma.student.findMany({
      where: {
        class: { professorId }, // ✅ Filter students by professor's classes
      },
      include: { class: true },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, classId } = await req.json();
    const newStudent = await prisma.student.create({
      data: { name, email, classId },
    });
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);

    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
