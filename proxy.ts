import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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
  let refreshSetCookies: string[] = [];

  // 1. Try to verify access token
  if (accessToken) {
    try {
      const result = await jwtVerify(accessToken, encodedSecret);
      payload = result.payload as Record<string, unknown>;
    } catch {
      // Access token invalid/expired, fall through to refresh token
    }
  }

  // 2. If access token failed/missing, validate refresh token against DB via
  //    the refresh endpoint, which enforces revocation and rotates the token.
  if (!payload && refreshToken) {
    try {
      const refreshResponse = await fetch(
        new URL("/api/auth/refresh", request.url),
        {
          method: "POST",
          headers: { cookie: `refresh_token=${refreshToken}` },
        }
      );

      if (refreshResponse.ok) {
        payload = await refreshResponse.json();
        refreshSetCookies = refreshResponse.headers.getSetCookie();
      }
    } catch {
      // Network or parse error; payload stays null → redirect to login below
    }
  }

  // 3. No valid authentication → redirect to login and clear cookies
  if (!payload || !payload.professorId) {
    const loginResponse = NextResponse.redirect(
      new URL("/login", request.url)
    );
    loginResponse.cookies.delete("access_token");
    loginResponse.cookies.delete("refresh_token");
    return loginResponse;
  }

  // 4. Block non-admin users from admin-only routes
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  if (isAdminOnlyPath && !payload.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. Forward user claims as headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Professor-Id", String(payload.professorId));
  requestHeaders.set("X-First-Name", String(payload.firstName ?? ""));
  requestHeaders.set("X-Last-Name", String(payload.lastName ?? ""));
  requestHeaders.set("X-Is-Admin", payload.isAdmin ? "true" : "false");

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // 6. Forward new cookies issued by the refresh endpoint (new access token +
  //    rotated refresh token) so the browser receives updated credentials.
  for (const cookie of refreshSetCookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|login|forgot-password|reset-password|_next/.*|images/.*).*)",
  ],
};
