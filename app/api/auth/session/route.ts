import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { parse } from "cookie";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";

export async function GET(req: Request) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.session;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

    if (!decoded || !decoded.professorId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json(
      {
        professorId: decoded.professorId, // ✅ Correct
        name: decoded.name, // ✅ Correct (instead of `decoded.professor.name`)
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
