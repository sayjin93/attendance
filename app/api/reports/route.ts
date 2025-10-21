import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const programs = await prisma.program.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });

    const response = {
      programs: programs.map(p => ({ id: p.id.toString(), name: p.name })),
      classes: [],
      subjects: [],
      students: [],
      summary: { totalStudents: 0, passedStudents: 0, failedStudents: 0, averageAttendance: 0 },
      metadata: { program: "", class: "", subject: "" }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error in reports API:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}
