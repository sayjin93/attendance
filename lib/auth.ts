import { cookies } from "next/headers";
import { jwtVerify, JWTPayload, errors as joseErrors } from "jose";
import { NextResponse } from "next/server";
import { SECRET_KEY } from "@/constants";

export interface AuthPayload extends JWTPayload {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

type AuthSuccess = { decoded: AuthPayload };
type AuthFailure = { error: string; status: number };
type AuthResult = AuthSuccess | AuthFailure;

export function isAuthError(result: AuthResult): result is AuthFailure {
  return "error" in result;
}

export async function authenticateRequest(): Promise<AuthResult> {
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
    return { decoded: payload as AuthPayload };
  } catch (error: unknown) {
    if (error instanceof joseErrors.JWTExpired) {
      return { error: "Session expired", status: 401 };
    }
    return { error: "Invalid session", status: 401 };
  }
}

/**
 * Authenticate and authorize an API request.
 * Returns the decoded JWT payload or a NextResponse error.
 * Use in API routes: `const auth = await requireAuth(req); if (auth instanceof NextResponse) return auth;`
 */
export async function requireAuth(): Promise<AuthPayload | NextResponse> {
  const result = await authenticateRequest();
  if (isAuthError(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return result.decoded;
}

/**
 * Authenticate and require admin role.
 * Returns the decoded JWT payload or a NextResponse error.
 */
export async function requireAdmin(): Promise<AuthPayload | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isAdmin) {
    return NextResponse.json(
      { error: "Vetëm administratorët kanë akses!" },
      { status: 403 }
    );
  }
  return auth;
}
