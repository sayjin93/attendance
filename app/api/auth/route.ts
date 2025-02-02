import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = "my_super_secret_key_jk";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const professor = await prisma.professor.findUnique({
      where: { email },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, professor.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ professorId: professor.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return NextResponse.json(
      { token, professorId: professor.id, name: professor.name },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
