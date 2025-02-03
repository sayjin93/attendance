import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId");

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Verify professor existence
    const professorExists = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!professorExists) {
      return NextResponse.json(
        { error: "❌ Professor not found!" },
        { status: 404 }
      );
    }

    const classes = await prisma.class.findMany({
      where: { professorId },
      include: { students: true, lectures: true },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch classes" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // ✅ Close Prisma connection properly
  }
}

export async function POST(req: Request) {
  try {
    const { name, professorId } = await req.json();

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Profesori nuk është i identifikuar!" },
        { status: 400 }
      );
    }

    // ✅ Verify professor existence before creating a class
    const professorExists = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!professorExists) {
      return NextResponse.json(
        { error: "❌ Profesor nuk ekziston!" },
        { status: 404 }
      );
    }

    const newClass = await prisma.class.create({
      data: { name, professorId },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating class:", error);
    return NextResponse.json(
      { error: "⚠️ Dështoi krijimi i klasës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // ✅ Close Prisma connection properly
  }
}
