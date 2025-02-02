import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId"); // ✅ Get professor ID from request

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    const classes = await prisma.class.findMany({
      where: { professorId }, // ✅ Only fetch classes of logged-in professor
      include: { students: true, lectures: true },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, professorId } = await req.json(); // ✅ Tani API pret professorId

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Profesori nuk është i identifikuar!" },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: { name, professorId }, // ✅ Lidh klasën me profesorin
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating class:", error);
    return NextResponse.json(
      { error: "⚠️ Dështoi krijimi i klasës" },
      { status: 500 }
    );
  }
}
