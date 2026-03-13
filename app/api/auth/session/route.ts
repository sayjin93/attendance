import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/tokens";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    return NextResponse.json({
      professorId: payload.professorId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      isAdmin: payload.isAdmin,
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
