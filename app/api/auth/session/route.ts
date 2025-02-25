import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
      }
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json(
      {
        professorId: decoded.professorId,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isAdmin: decoded.isAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}
