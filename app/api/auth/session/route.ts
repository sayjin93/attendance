import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/prisma";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/tokens";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const refreshTokenValue = cookieStore.get("refresh_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    // Validate that the refresh token still exists and is not revoked in DB
    if (!refreshTokenValue) {
      return NextResponse.json({ error: "Session revoked" }, { status: 401 });
    }

    try {
      const refreshPayload = await verifyRefreshToken(refreshTokenValue);
      if (refreshPayload.jti) {
        const storedToken = await prisma.refreshToken.findUnique({
          where: { jti: refreshPayload.jti },
          select: { revokedAt: true },
        });
        if (!storedToken || storedToken.revokedAt) {
          return NextResponse.json({ error: "Session revoked" }, { status: 401 });
        }
      }
    } catch {
      return NextResponse.json({ error: "Session revoked" }, { status: 401 });
    }

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
