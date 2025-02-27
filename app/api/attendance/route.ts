import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Fetch Attendance API
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId") ?? undefined;
    const classId = searchParams.get("classId") ?? undefined;
    const lectureId = searchParams.get("lectureId") ?? undefined;

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Fetch students of the selected class
    const students = await prisma.student.findMany({
      where: {
        classId: classId ?? undefined, // ✅ Ensure classId is not null
      },
      select: { id: true, name: true },
    });

    // ✅ Fetch attendance records for the selected lecture
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        lectureId: lectureId ?? undefined, // ✅ Ensure lectureId is not null
      },
      select: { studentId: true, status: true },
    });

    // ✅ Merge attendance status with students list
    const studentsWithAttendance = students.map((student) => {
      const attendance = attendanceRecords.find(
        (att) => att.studentId === student.id
      );
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        status: attendance ? attendance.status : "PRESENT", // Default status
      };
    });

    return NextResponse.json(studentsWithAttendance || [], { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch attendance" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ Update/Create Attendance API
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
      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { status },
      });
      return NextResponse.json(
        { message: "✅ Prezenca u përditësua me sukses!" },
        { status: 200 }
      );
    } else {
      await prisma.attendance.create({
        data: { studentId, lectureId, status },
      });
      return NextResponse.json(
        { message: "✅ Prezenca u regjistrua me sukses!" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("❌ Error during attendance update:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim në server, provo përsëri!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
