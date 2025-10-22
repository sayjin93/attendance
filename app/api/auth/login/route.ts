import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { serialize } from "cookie";
import { SECRET_KEY } from "@/constants";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json(); // 🔹 Accepts username OR email as identifier

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Missing username/email or password" },
        { status: 400 }
      );
    }

    // Find user by username or email
    const professor = await prisma.professor.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }], // 🔹 Search by email OR username
      },
    });
    if (!professor) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, professor.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = await new SignJWT({
      professorId: professor.id,
      firstName: professor.firstName,
      lastName: professor.lastName,
      isAdmin: professor.isAdmin,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(SECRET_KEY));

    // Create cookie with the token
    const cookie = serialize("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h to match the token expiresIn so cookie will removed automatically
    });

    // Return response with cookie
    return new NextResponse(
      JSON.stringify({
        professorId: professor.id,
        firstName: professor.firstName,
        lastName: professor.lastName,
        isAdmin: professor.isAdmin,
      }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
