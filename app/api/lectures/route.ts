import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    let lectures;

    if (classId) {
      lectures = await prisma.lecture.findMany({
        where: { classId },
        include: { class: true },
      });
    } else {
      lectures = await prisma.lecture.findMany({
        include: { class: true },
      });
    }

    return NextResponse.json(lectures, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching lectures:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim gjatë marrjes së leksioneve" },
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
