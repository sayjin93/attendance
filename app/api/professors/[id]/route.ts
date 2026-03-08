import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request, context: { params: Promise<{ id?: string }> }) {
  try {
    const decoded = await requireAdmin();
    if (decoded instanceof NextResponse) return decoded;

    const professorId = (await context.params).id;

    if (!professorId) {
      return NextResponse.json(
        { error: "ID e profesorit mungon!" },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.findUnique({
      where: { id: parseInt(professorId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        isAdmin: true,
        teachingAssignments: {
          include: {
            subject: {
              include: {
                program: true
              }
            }
          }
        }
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Profesori nuk u gjet!" },
        { status: 404 }
      );
    }

    return NextResponse.json(professor, { status: 200 });
  } catch (error) {
    console.error("Error fetching professor:", error);
    return NextResponse.json(
      { error: "Dështoi marrja e të dhënave të profesorit!" },
      { status: 500 }
    );
  }
}
