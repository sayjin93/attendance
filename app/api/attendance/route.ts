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

    // ✅ Fetch attendance only for the professor's students
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        student: {
          class: { professorId }, // ✅ Only fetch attendance of professor's students
        },
      },
      include: { student: true, lecture: true },
    });

    return NextResponse.json(attendanceRecords, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { studentId, lectureId, status } = await req.json();

    if (!studentId || !lectureId || !status) {
      return NextResponse.json(
        { error: "❌ Të dhëna të paplota!" },
        { status: 400 }
      );
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: { studentId, lectureId },
    });

    if (existingAttendance) {
      // Përditëso nëse ekziston
      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { status },
      });
      return NextResponse.json(
        { message: "✅ Prezenca u përditësua me sukses!" },
        { status: 200 }
      );
    } else {
      // Krijo nëse nuk ekziston
      await prisma.attendance.create({
        data: { studentId, lectureId, status },
      });
      return NextResponse.json(
        { message: "✅ Prezenca u regjistrua me sukses!" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("❌ Error gjatë regjistrimit të prezencës:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim në server, provo përsëri!" },
      { status: 500 }
    );
  }
}
