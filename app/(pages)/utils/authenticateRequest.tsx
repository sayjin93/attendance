import { cookies } from "next/headers";
import { jwtVerify, JWTPayload, errors as joseErrors } from "jose";
import { SECRET_KEY } from "@/constants";

type AuthResult = { decoded: JWTPayload } | { error: string; status: number };

export async function authenticateRequest(): Promise<AuthResult> {
  // Get the session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return { error: "Not authenticated", status: 401 };
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );
    if (!payload.professorId) {
      return { error: "Invalid session", status: 401 };
    }
    return { decoded: payload };
  } catch (error: unknown) {
    if (error instanceof joseErrors.JWTExpired) {
      return { error: "Session expired", status: 401 };
    }
    return { error: "Invalid session", status: 401 };
  }
}
