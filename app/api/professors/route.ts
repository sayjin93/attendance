import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import bcrypt from "bcryptjs";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";
import { sendWelcomeEmail } from "@/lib/emailService";
import { logActivity, getChangedFields } from "@/lib/activityLogger";

// GET: Fetch all professors (Admin only)
export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të shikojnë profesorët!" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    // Build where clause to exclude current admin user
    const currentUserId = Number(decoded.professorId);
    
    const baseWhereClause = { id: { not: currentUserId } };
    
    let whereClause;
    
    if (search) {
      whereClause = {
        AND: [
          baseWhereClause, // Exclude current admin user
          {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { username: { contains: search } }
            ]
          }
        ]
      };
    } else {
      whereClause = baseWhereClause;
    }

    const professors = await prisma.professor.findMany({
      where: whereClause,
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
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    return NextResponse.json(professors, { status: 200 });
  } catch (error) {
    console.error("Error fetching professors:", error);
    return NextResponse.json(
      { error: "Dështoi marrja e profesorëve!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new professor (Admin only)
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të krijojnë profesorë!" },
        { status: 403 }
      );
    }

    const { firstName, lastName, email, username, password } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { error: "Të gjitha fushat janë të detyrueshme!" },
        { status: 400 }
      );
    }

    // Trim and format names
    const formatName = (name: string) =>
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();

    // Check if email or username already exists
    const existingProfessor = await prisma.professor.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { username: trimmedUsername }
        ]
      }
    });

    if (existingProfessor) {
      return NextResponse.json(
        { error: "Email ose username-i ekziston tashmë!" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newProfessor = await prisma.professor.create({
      data: {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        email: trimmedEmail,
        username: trimmedUsername,
        password: hashedPassword,
        isAdmin: false // Always false for new professors
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        isAdmin: true
      }
    });

    // Send welcome email to the new professor
    try {
      const websiteUrl = `${req.headers.get('origin') || 'http://localhost:9900'}`;
      const professorFullName = `${formattedFirstName} ${formattedLastName}`;
      
      const emailResult = await sendWelcomeEmail({
        to: trimmedEmail,
        professorName: professorFullName,
        username: trimmedUsername,
        password: password, // Send the original password (before hashing)
        websiteUrl: websiteUrl,
      });

      if (!emailResult.success) {
        console.error('Failed to send welcome email:', emailResult.error);
        // Don't fail the registration if email fails, just log it
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the registration if email fails
    }

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "CREATE",
      entity: "professors",
      entityId: newProfessor.id,
      details: {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        email: trimmedEmail,
        username: trimmedUsername,
      },
    });

    return NextResponse.json(newProfessor, { status: 201 });
  } catch (error) {
    console.error("Error creating professor:", error);
    return NextResponse.json(
      { error: "Dështoi krijimi i profesorit!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Update a professor (Admin only)
export async function PUT(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të modifikojnë profesorët!" },
        { status: 403 }
      );
    }

    const { id, firstName, lastName, email, username, password } = await req.json();

    // Validate required fields
    if (!id || !firstName || !lastName || !email || !username) {
      return NextResponse.json(
        { error: "ID, emri, mbiemri, email dhe username janë të detyrueshëm!" },
        { status: 400 }
      );
    }

    // Check if professor exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { id }
    });

    if (!existingProfessor) {
      return NextResponse.json(
        { error: "Profesori nuk ekziston!" },
        { status: 404 }
      );
    }

    // Format data
    const formatName = (name: string) =>
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();

    // Check if email or username is taken by another professor
    const duplicateProfessor = await prisma.professor.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { email: trimmedEmail },
              { username: trimmedUsername }
            ]
          }
        ]
      }
    });

    if (duplicateProfessor) {
      return NextResponse.json(
        { error: "Email ose username-i përdoret nga një profesor tjetër!" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      firstName: string;
      lastName: string;
      email: string;
      username: string;
      password?: string;
    } = {
      firstName: formattedFirstName,
      lastName: formattedLastName,
      email: trimmedEmail,
      username: trimmedUsername
    };

    // Hash new password if provided
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedProfessor = await prisma.professor.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        isAdmin: true
      }
    });

    // Log activity
    const changes = getChangedFields(
      {
        firstName: existingProfessor.firstName,
        lastName: existingProfessor.lastName,
        email: existingProfessor.email,
        username: existingProfessor.username,
      },
      {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        email: trimmedEmail,
        username: trimmedUsername,
      }
    );

    if (Object.keys(changes).length > 0) {
      await logActivity({
        userId: decoded.professorId as number,
        userName: `${decoded.firstName} ${decoded.lastName}`,
        action: "UPDATE",
        entity: "professors",
        entityId: id,
        details: { changes },
      });
    }

    return NextResponse.json(updatedProfessor, { status: 200 });
  } catch (error) {
    console.error("Error updating professor:", error);
    return NextResponse.json(
      { error: "Dështoi përditësimi i profesorit!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Remove a professor (Admin only)
export async function DELETE(req: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: "Vetëm administratorët mund të fshijnë profesorët!" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID e profesorit është e detyrueshme!" },
        { status: 400 }
      );
    }

    const professorId = parseInt(id);

    // Check if professor exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { id: professorId },
      include: {
        teachingAssignments: true
      }
    });

    if (!existingProfessor) {
      return NextResponse.json(
        { error: "Profesori nuk ekziston!" },
        { status: 404 }
      );
    }

    // Check if professor has teaching assignments
    if (existingProfessor.teachingAssignments.length > 0) {
      return NextResponse.json(
        { error: "Nuk mund të fshihet një profesor që ka caktime mësimore!" },
        { status: 400 }
      );
    }

    await prisma.professor.delete({
      where: { id: professorId }
    });

    // Log activity
    await logActivity({
      userId: decoded.professorId as number,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      action: "DELETE",
      entity: "professors",
      entityId: professorId,
      details: {
        firstName: existingProfessor.firstName,
        lastName: existingProfessor.lastName,
        email: existingProfessor.email,
        username: existingProfessor.username,
      },
    });

    return NextResponse.json(
      { message: "Profesori u fshi me sukses!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting professor:", error);
    return NextResponse.json(
      { error: "Dështoi fshirja e profesorit!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}