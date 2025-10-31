import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { SECRET_KEY } from "./constants";

export async function middleware(req: Request) {
  try {
    // Get the session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    // If there's no token at all, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url)); // Redirect if token is invalid/expired
    }

    // Verify the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );

    // Check if non-admin professor is trying to access admin-only pages
    const url = new URL(req.url);
    const adminOnlyPaths = ['/classes', '/students', '/professors', '/subjects', '/assignments'];
    const isAdminOnlyPath = adminOnlyPaths.some(path => url.pathname.startsWith(path));
    
    if (isAdminOnlyPath && !payload.isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Attach decoded info as custom headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-Professor-Id", String(payload.professorId));
    requestHeaders.set("X-First-Name", String(payload.firstName));
    requestHeaders.set("X-Last-Name", String(payload.lastName));
    requestHeaders.set("X-Is-Admin", payload.isAdmin ? "true" : "false");

    // Pass the request along with our new headers
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.log("Error in middleware:", error);
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect if token is invalid/expired
  }
}

// Middleware applies to everything EXCEPT login, forgot-password, reset-password, API routes, and Next.js assets
export const config = {
  matcher: [
    /*
     * Apply middleware to all pages except:
     * 1. /api/* (exclude all API routes)
     * 2. /login (exclude the login page)
     * 3. /forgot-password (exclude forgot password page)
     * 4. /reset-password/* (exclude reset password pages)
     * 5. /_next/* (exclude Next.js assets, e.g., /_next/static/*)
     */
    "/((?!api|login|forgot-password|reset-password|_next/.*|images/.*).*)",
  ],
};
