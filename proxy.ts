import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/prisma/prisma";
import crypto from "crypto";

const SECRET_KEY = process.env.SECRET_KEY!;
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const REFRESH_TOKEN_EXPIRY_MS = REFRESH_TOKEN_MAX_AGE * 1000;

const ADMIN_ONLY_PATHS = [
  "/classes",
  "/students",
  "/professors",
  "/subjects",
  "/assignments",
];

/** Clear both auth cookies on the given response. */
function clearAuthCookies(response: NextResponse): void {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set("access_token", "", opts);
  response.cookies.set("refresh_token", "", opts);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  let payload: Record<string, unknown> | null = null;
  let needsNewAccessToken = false;
  let newRefreshToken: string | null = null;

  // 1. Try to verify the access token cryptographically.
  if (accessToken) {
    try {
      const result = await jwtVerify(accessToken, encodedSecret);
      payload = result.payload as Record<string, unknown>;
    } catch {
      needsNewAccessToken = true;
    }
  } else {
    needsNewAccessToken = true;
  }

  // 2. Even when the access token is valid, enforce that the paired refresh
  //    token has not been revoked in the DB. This prevents a stolen/copied
  //    session (both cookies) from remaining active after logout.
  //    If the refresh token is present but invalid/expired, also reject —
  //    this prevents bypassing the DB check by corrupting the refresh cookie.
  if (payload && refreshToken) {
    try {
      const rtResult = await jwtVerify(refreshToken, encodedSecret);
      const jti = rtResult.payload.jti as string | undefined;
      if (jti) {
        const stored = await prisma.refreshToken.findUnique({
          where: { jti },
          select: { revokedAt: true },
        });
        if (!stored || stored.revokedAt) {
          payload = null; // Refresh token revoked → treat session as invalid
        }
      }
    } catch {
      // Refresh token is present but JWT verification failed (tampered or
      // expired) → reject the session rather than silently fall through.
      payload = null;
    }
  }

  // 3. If access token is missing/expired, validate the refresh token against
  //    the DB and, if valid, rotate it and mint a new access token.
  if (!payload && refreshToken) {
    try {
      const rtResult = await jwtVerify(refreshToken, encodedSecret);
      const rtPayload = rtResult.payload as Record<string, unknown>;
      const jti = rtPayload.jti as string | undefined;

      if (!jti) throw new Error("Missing jti");

      const stored = await prisma.refreshToken.findUnique({ where: { jti } });

      if (!stored || stored.revokedAt) {
        // Revoked-token reuse detected → revoke the entire token family.
        if (stored?.revokedAt) {
          await prisma.refreshToken.updateMany({
            where: {
              professorId: stored.professorId,
              revokedAt: null,
            },
            data: { revokedAt: new Date() },
          });
        }
        throw new Error("Revoked");
      }

      // Fetch fresh user data so any role/name changes are picked up.
      const professor = await prisma.professor.findUnique({
        where: { id: stored.professorId },
        select: { id: true, firstName: true, lastName: true, isAdmin: true },
      });

      if (!professor) throw new Error("User not found");

      // Rotate: revoke old token, create new one (atomic).
      const newJti = crypto.randomUUID();
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { jti },
          data: { revokedAt: new Date(), replacedBy: newJti },
        }),
        prisma.refreshToken.create({
          data: {
            jti: newJti,
            professorId: professor.id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
          },
        }),
      ]);

      // Build new refresh token JWT to set in the cookie.
      newRefreshToken = await new SignJWT({
        professorId: professor.id,
        firstName: professor.firstName,
        lastName: professor.lastName,
        isAdmin: professor.isAdmin,
        jti: newJti,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedSecret);

      payload = {
        professorId: professor.id,
        firstName: professor.firstName,
        lastName: professor.lastName,
        isAdmin: professor.isAdmin,
      };
      needsNewAccessToken = true;
    } catch {
      payload = null;
    }
  }

  // 4. No valid authentication → redirect to login and clear cookies.
  if (!payload || !payload.professorId) {
    const loginResponse = NextResponse.redirect(
      new URL("/login", request.url)
    );
    clearAuthCookies(loginResponse);
    return loginResponse;
  }

  // 5. Block non-admin users from admin-only routes.
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  if (isAdminOnlyPath && !payload.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 6. Forward user claims as headers for server components.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Professor-Id", String(payload.professorId));
  requestHeaders.set("X-First-Name", String(payload.firstName ?? ""));
  requestHeaders.set("X-Last-Name", String(payload.lastName ?? ""));
  requestHeaders.set("X-Is-Admin", payload.isAdmin ? "true" : "false");

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const isProduction = process.env.NODE_ENV === "production";

  // 7. Issue a fresh access token if the current one was expired/missing.
  if (needsNewAccessToken) {
    const newAccessToken = await new SignJWT({
      professorId: payload.professorId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      isAdmin: payload.isAdmin,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(encodedSecret);

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }

  // 8. Set the rotated refresh token cookie if we just did a rotation.
  if (newRefreshToken) {
    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|login|forgot-password|reset-password|_next/.*|images/.*).*)",
  ],
};
