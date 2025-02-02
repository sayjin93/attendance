import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ id?: string }> }) {
  try {
    const professorId = (await context.params).id; // ✅ Correct way to access params

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ ID e profesorit mungon!" },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
      select: { id: true, name: true, email: true, classes: true },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "🚨 Profesori nuk u gjet!" },
        { status: 404 }
      );
    }

    return NextResponse.json(professor, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching professor:", error);
    return NextResponse.json(
      { error: "⚠️ Dështoi marrja e të dhënave të profesorit" },
      { status: 500 }
    );
  }
}
