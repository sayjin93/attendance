import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/prisma/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  createAccessToken,
  createRefreshToken,
  serializeAccessTokenCookie,
  serializeRefreshTokenCookie,
  type UserClaims,
} from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Missing username/email or password" },
        { status: 400 }
      );
    }

    // Find user by username or email
    const professor = await prisma.professor.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
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

    const claims: UserClaims = {
      professorId: professor.id,
      firstName: professor.firstName,
      lastName: professor.lastName,
      isAdmin: professor.isAdmin,
    };

    // Create access token (short-lived, 15 min)
    const accessToken = await createAccessToken(claims);

    // Create refresh token (long-lived, 7 days) with unique jti
    const jti = crypto.randomUUID();
    const refreshToken = await createRefreshToken(claims, jti);

    // Store refresh token reference in database for revocation
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
      || headerList.get("x-real-ip")
      || null;

    await prisma.refreshToken.create({
      data: {
        jti,
        professorId: professor.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
      },
    });

    // Return response with both cookies
    const response = NextResponse.json(claims, { status: 200 });
    response.headers.append(
      "Set-Cookie",
      serializeAccessTokenCookie(accessToken)
    );
    response.headers.append(
      "Set-Cookie",
      serializeRefreshTokenCookie(refreshToken)
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
