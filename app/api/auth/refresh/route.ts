import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/prisma";
import crypto from "crypto";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  serializeAccessTokenCookie,
  serializeRefreshTokenCookie,
  clearTokenCookies,
  type UserClaims,
} from "@/lib/tokens";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshTokenValue = cookieStore.get("refresh_token")?.value;

    if (!refreshTokenValue) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // Verify refresh token JWT signature + expiration
    let payload;
    try {
      payload = await verifyRefreshToken(refreshTokenValue);
    } catch {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (!payload.jti) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Validate refresh token against database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!storedToken || storedToken.revokedAt) {
      // Revoked token reuse detected → revoke entire token family (theft protection)
      if (storedToken?.revokedAt) {
        await prisma.refreshToken.updateMany({
          where: { professorId: storedToken.professorId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      const response = NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
      clearTokenCookies().forEach((cookie) =>
        response.headers.append("Set-Cookie", cookie)
      );
      return response;
    }

    // Get fresh user data from database (picks up any role/name changes)
    const professor = await prisma.professor.findUnique({
      where: { id: storedToken.professorId },
      select: { id: true, firstName: true, lastName: true, isAdmin: true },
    });

    if (!professor) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const claims: UserClaims = {
      professorId: professor.id,
      firstName: professor.firstName,
      lastName: professor.lastName,
      isAdmin: professor.isAdmin,
    };

    // Create new token pair
    const newAccessToken = await createAccessToken(claims);
    const newJti = crypto.randomUUID();
    const newRefreshToken = await createRefreshToken(claims, newJti);

    // Token rotation: revoke old, store new (atomic transaction)
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { jti: payload.jti },
        data: { revokedAt: new Date(), replacedBy: newJti },
      }),
      prisma.refreshToken.create({
        data: {
          jti: newJti,
          professorId: professor.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Housekeeping: clean up expired/old revoked tokens (fire-and-forget)
    prisma.refreshToken
      .deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            {
              revokedAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      })
      .catch(() => {});

    // Set both new cookies
    const response = NextResponse.json(claims, { status: 200 });
    response.headers.append(
      "Set-Cookie",
      serializeAccessTokenCookie(newAccessToken)
    );
    response.headers.append(
      "Set-Cookie",
      serializeRefreshTokenCookie(newRefreshToken)
    );

    return response;
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Session refresh failed" },
      { status: 401 }
    );
  }
}
