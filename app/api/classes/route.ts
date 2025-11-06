import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

// GET: Fetch all classes for the logged-in professor or all classes for admins
export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest();

    // Check auth
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId");
    const includeLectures = searchParams.get("includeLectures") === "true";

    // Build include options
    const includeOptions = {
      program: true,
      teachingAssignments: {
        include: {
          subject: true, // Include subject info for each assignment
          ...(includeLectures && {
            lectures: {
              where: professorId && !decoded.isAdmin ? {
                teachingAssignment: {
                  professorId: parseInt(professorId, 10)
                }
              } : {},
              include: {
                teachingAssignment: {
                  include: {
                    professor: true,
                    subject: true,
                  }
                },
                attendance: true,
              },
              orderBy: {
                date: 'desc' as const
              }
            }
          })
        },
      },
      students: {
        orderBy: [{ firstName: 'asc' as const }, { lastName: 'asc' as const }]
      }, // Always include students to count them
    };

    let classes;

    if (professorId && !decoded.isAdmin) {
      const professorIdInt = parseInt(professorId, 10);
      
      // For non-admin professors, get only classes they are assigned to
      classes = await prisma.class.findMany({
        where: {
          teachingAssignments: {
            some: {
              professorId: professorIdInt
            }
          }
        },
        include: includeOptions,
      });
    } else {
      // For admins, get all classes
      classes = await prisma.class.findMany({
        include: includeOptions,
      });
    }

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new class (Only Admins)
export async function POST(req: Request) {
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
        { error: "Vetëm administratorët mund të krijojnë klasa!" },
        { status: 403 }
      );
    }

    const { name, programId } = await req.json();

    // Validate required fields
    if (!name || !programId) {
      return NextResponse.json(
        { error: "Emri i klasës dhe Program ID janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // Check if the provided program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Programi nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if class name already exists in the selected program
    const existingClass = await prisma.class.findFirst({
      where: { name, programId },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "Një klasë me këtë emër ekziston tashmë në këtë program!" },
        { status: 409 }
      );
    }

    // Create the new class under the selected program
    const newClass = await prisma.class.create({
      data: {
        name,
        programId,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Dështoi krijimi i klasës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Update a class (Only Admins)
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
        { error: "Vetëm administratorët mund të modifikojnë klasa!" },
        { status: 403 }
      );
    }

    const { id, name, programId } = await req.json();

    // Validate required fields
    if (!id || !name || !programId) {
      return NextResponse.json(
        { error: "ID, emri i klasës dhe Program ID janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // Check if the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Klasa nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if the provided program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Programi nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if another class with the same name already exists in the selected program
    const duplicateClass = await prisma.class.findFirst({
      where: { 
        name, 
        programId,
        NOT: { id } // Exclude current class from check
      },
    });

    if (duplicateClass) {
      return NextResponse.json(
        { error: "Një klasë me këtë emër ekziston tashmë në këtë program!" },
        { status: 409 }
      );
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        programId,
      },
      include: {
        program: true,
      },
    });

    return NextResponse.json(updatedClass, { status: 200 });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Dështoi modifikimi i klasës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Delete a class (Only Admins)
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
        { error: "Vetëm administratorët mund të fshijnë klasa!" },
        { status: 403 }
      );
    }

    const { id } = await req.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID e klasës është e detyrueshme!" },
        { status: 400 }
      );
    }

    // Check if the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Klasa nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if class has students
    if (existingClass.students && existingClass.students.length > 0) {
      return NextResponse.json(
        { error: "Nuk mund të fshihet klasa sepse ka studentë të regjistruar!" },
        { status: 400 }
      );
    }

    // Delete the class
    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Klasa u fshi me sukses!" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Dështoi fshirja e klasës" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
