import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const SECRET_KEY = process.env.SECRET_KEY!;
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

const ADMIN_ONLY_PATHS = [
  "/classes",
  "/students",
  "/professors",
  "/subjects",
  "/assignments",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  let payload: Record<string, unknown> | null = null;
  let needsNewAccessToken = false;

  // 1. Try to verify access token
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

  // 2. If access token failed, try to extract claims from refresh token
  if (!payload && refreshToken) {
    try {
      const result = await jwtVerify(refreshToken, encodedSecret);
      payload = result.payload as Record<string, unknown>;
      needsNewAccessToken = true;
    } catch {
      payload = null;
    }
  }

  // 4. No valid authentication → redirect to login
  if (!payload || !payload.professorId) {
    return NextResponse.redirect(new URL("/login", request.url));
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

  // 7. Issue a fresh access token if the current one was expired/missing
  if (needsNewAccessToken) {
    try {
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
    } catch {
      // If token creation fails, continue without refresh
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|login|forgot-password|reset-password|_next/.*|images/.*).*)",
  ],
};
