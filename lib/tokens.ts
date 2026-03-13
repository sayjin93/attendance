import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { serialize } from "cookie";
import { SECRET_KEY } from "@/constants";

// ─── Expiration Constants ────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Token Payload Types ─────────────────────────────────────
export interface AccessTokenPayload extends JWTPayload {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface RefreshTokenPayload extends JWTPayload {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  jti: string;
}

export type UserClaims = {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
};

const encodedSecret = new TextEncoder().encode(SECRET_KEY);

// ─── Token Creation ──────────────────────────────────────────

export async function createAccessToken(claims: UserClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(encodedSecret);
}

export async function createRefreshToken(
  claims: UserClaims,
  jti: string
): Promise<string> {
  return new SignJWT({ ...claims, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(encodedSecret);
}

// ─── Token Verification ─────────────────────────────────────

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload as RefreshTokenPayload;
}

// ─── Cookie Serialization ───────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

export function serializeAccessTokenCookie(token: string): string {
  return serialize("access_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function serializeRefreshTokenCookie(token: string): string {
  return serialize("refresh_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearTokenCookies(): string[] {
  const opts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  return [
    serialize("access_token", "", opts),
    serialize("refresh_token", "", opts),
  ];
}
