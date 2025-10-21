import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

const prisma = new PrismaClient();

// ✅ GET: Fetch students for a specific class
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required!" },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: { classId: Number(classId) },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);

    return NextResponse.json(
      { error: "Failed to fetch students!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
export async function POST(req: Request) {
  try {
    debugger;
    const { firstName, lastName, classId, professorId } = await req.json();

    if (!professorId || !classId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "❌ All fields are required!" },
        { status: 400 }
      );
    }

    // ✅ Ensure professor owns the class before adding a student
    const classExists = await prisma.class.findFirst({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: "❌ You cannot add students to a class you do not own!" },
        { status: 403 }
      );
    }

    // ✅ Trim spaces and capitalize first letter
    const formatName = (name: string) =>
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);

    const newStudent = await prisma.student.create({
      data: {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        classId,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to create student" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Update a student (Only Admins)
export async function PUT(req: Request) {
  try {
    const auth = await authenticateRequest();

    // Check auth
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    // Ensure user is authenticated
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const isAdmin = decoded.isAdmin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të modifikojnë studentë!" },
        { status: 403 }
      );
    }

    const { id, firstName, lastName, classId } = await req.json();

    // Validate required fields
    if (!id || !firstName || !lastName || !classId) {
      return NextResponse.json(
        { error: "ID, emri, mbiemri dhe ID e klasës janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // Check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Studenti nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if the provided class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Klasa nuk ekziston!" },
        { status: 404 }
      );
    }

    // ✅ Trim spaces and capitalize first letter
    const formatName = (name: string) =>
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        classId,
      },
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Dështoi modifikimi i studentit" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Delete a student (Only Admins)
export async function DELETE(req: Request) {
  try {
    const auth = await authenticateRequest();

    // Check auth
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    // Ensure user is authenticated
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const isAdmin = decoded.isAdmin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të fshijnë studentë!" },
        { status: 403 }
      );
    }

    const { id } = await req.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID e studentit është e detyrueshme!" },
        { status: 400 }
      );
    }

    // Check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        attendance: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Studenti nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if student has attendance records
    if (existingStudent.attendance && existingStudent.attendance.length > 0) {
      return NextResponse.json(
        { error: "Nuk mund të fshihet studenti sepse ka regjistrime pranie!" },
        { status: 400 }
      );
    }

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Studenti u fshi me sukses!" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Dështoi fshirja e studentit" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
