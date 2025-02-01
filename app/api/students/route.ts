import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json([], { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: { attendance: true }, // Sigurohemi që të lidhim të dhënat e prezencës
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim gjatë marrjes së studentëve" },
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
