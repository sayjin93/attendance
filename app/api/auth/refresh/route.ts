import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { serialize } from "cookie";
import { SECRET_KEY } from "@/constants";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the current token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );

    // Create a new JWT with extended expiration
    const newToken = await new SignJWT({
      professorId: payload.professorId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      isAdmin: payload.isAdmin,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m") // Reset the 30-minute timer
      .sign(new TextEncoder().encode(SECRET_KEY));

    // Create new cookie with the refreshed token
    const cookie = serialize("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60, // 30 minutes
    });

    // Return response with new cookie
    return new NextResponse(
      JSON.stringify({
        professorId: payload.professorId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        isAdmin: payload.isAdmin,
      }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json({ error: "Session refresh failed" }, { status: 401 });
  }
}
