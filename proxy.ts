import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";
import crypto from "crypto";
import {
  verifyAccessToken,
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  type UserClaims,
} from "@/lib/tokens";

const ADMIN_ONLY_PATHS = [
  "/classes",
  "/students",
  "/professors",
  "/subjects",
  "/assignments",
];

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  let payload: UserClaims | null = null;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;

  // 1. Validate refresh token exists in DB (required for all requests)
  //    This ensures deleting/revoking a token in DB immediately invalidates the session
  let refreshTokenValid = false;
  let refreshPayload: Awaited<ReturnType<typeof verifyRefreshToken>> | null = null;

  if (refreshToken) {
    try {
      refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload.jti) {
        const storedToken = await prisma.refreshToken.findUnique({
          where: { jti: refreshPayload.jti },
          select: { revokedAt: true, ipAddress: true, professorId: true },
        });

        if (storedToken && !storedToken.revokedAt) {
          // IP address check: if IP doesn't match, treat as token theft
          const currentIP = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || null;
          if (storedToken.ipAddress && currentIP && storedToken.ipAddress !== currentIP) {
            // Different IP → revoke ALL tokens for this user
            await prisma.refreshToken.updateMany({
              where: { professorId: storedToken.professorId, revokedAt: null },
              data: { revokedAt: new Date() },
            });
            refreshTokenValid = false;
          } else {
            refreshTokenValid = true;
          }
        }
      }
    } catch {
      // Refresh token JWT invalid
    }
  }

  // 2. Try to verify access token (only if refresh token is valid in DB)
  if (refreshTokenValid && accessToken) {
    try {
      const result = await verifyAccessToken(accessToken);
      payload = {
        professorId: result.professorId,
        firstName: result.firstName,
        lastName: result.lastName,
        isAdmin: result.isAdmin,
      };
    } catch {
      // Access token invalid/expired — will try refresh token rotation
    }
  }

  // 3. If access token invalid but refresh token is valid in DB, rotate tokens
  if (!payload && refreshTokenValid && refreshPayload) {
    try {
      if (refreshPayload.jti) {
        const storedToken = await prisma.refreshToken.findUnique({
          where: { jti: refreshPayload.jti },
        });

        if (storedToken && !storedToken.revokedAt) {
          // Valid token in DB — get fresh user data and rotate
          const professor = await prisma.professor.findUnique({
            where: { id: storedToken.professorId },
            select: { id: true, firstName: true, lastName: true, isAdmin: true },
          });

          if (professor) {
            const claims: UserClaims = {
              professorId: professor.id,
              firstName: professor.firstName,
              lastName: professor.lastName,
              isAdmin: professor.isAdmin,
            };

            const newJti = crypto.randomUUID();
            newAccessToken = await createAccessToken(claims);
            newRefreshToken = await createRefreshToken(claims, newJti);

            const currentIP = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
              || request.headers.get("x-real-ip")
              || null;

            // Atomic: revoke old refresh token, create new one
            await prisma.$transaction([
              prisma.refreshToken.update({
                where: { jti: refreshPayload.jti },
                data: { revokedAt: new Date(), replacedBy: newJti },
              }),
              prisma.refreshToken.create({
                data: {
                  jti: newJti,
                  professorId: professor.id,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  ipAddress: currentIP,
                },
              }),
            ]);

            payload = claims;
          }
        } else if (storedToken?.revokedAt) {
          // Revoked token reuse detected → theft protection: revoke ALL tokens for user
          await prisma.refreshToken.updateMany({
            where: { professorId: storedToken.professorId, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        }
        // If token not found in DB (deleted), payload stays null → redirect to login
      }
    } catch {
      // Refresh token JWT invalid — user needs to re-login
    }
  }

  // 4. No valid authentication → redirect to login
  if (!payload || !payload.professorId) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  // 5. Block non-admin users from admin-only routes
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  if (isAdminOnlyPath && !payload.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 6. Forward user claims as headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Professor-Id", String(payload.professorId));
  requestHeaders.set("X-First-Name", String(payload.firstName ?? ""));
  requestHeaders.set("X-Last-Name", String(payload.lastName ?? ""));
  requestHeaders.set("X-Is-Admin", payload.isAdmin ? "true" : "false");

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // 7. Set rotated cookies if tokens were refreshed
  if (newAccessToken) {
    response.cookies.set("access_token", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    });
  }
  if (newRefreshToken) {
    response.cookies.set("refresh_token", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|login|forgot-password|reset-password|_next/.*|images/.*).*)",
  ],
};
