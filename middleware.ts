import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";

export async function middleware(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("session=")[1];

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url)); // Redirect if token is invalid/expired
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-Professor-Id", String(payload.professorId));
    requestHeaders.set("X-First-Name", String(payload.firstName));
    requestHeaders.set("X-Last-Name", String(payload.lastName));
    requestHeaders.set("X-Is-Admin", payload.isAdmin ? "true" : "false");

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.log("Error in middleware:", error);
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect if token is invalid/expired
  }
}

// Middleware applies to everything EXCEPT login, API routes, and Next.js assets
export const config = {
  matcher: [
    /*
     * Apply middleware to all pages except:
     * 1. /api/* (exclude all API routes)
     * 2. /login (exclude the login page)
     * 3. /_next/* (exclude Next.js assets, e.g., /_next/static/*)
     */
    "/((?!api|login|_next/static|_next/image.*).*)",
  ],
};
