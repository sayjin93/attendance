import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const lectureId = searchParams.get("lectureId");

    if (!classId || !lectureId) {
      return NextResponse.json([], { status: 400 });
    }

    // Merr të dhënat e prezencës vetëm për klasën dhe leksionin e zgjedhur
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        student: { classId },
        lectureId,
      },
      include: { student: true, lecture: true },
    });

    return NextResponse.json(attendanceRecords, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim gjatë marrjes së prezencave" },
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
