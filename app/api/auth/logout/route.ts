import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/prisma";
import { verifyRefreshToken, clearTokenCookies } from "@/lib/tokens";

export async function POST() {
  const cookieStore = await cookies();
  const refreshTokenValue = cookieStore.get("refresh_token")?.value;

  // Revoke refresh token in database
  if (refreshTokenValue) {
    try {
      const payload = await verifyRefreshToken(refreshTokenValue);
      if (payload.jti) {
        await prisma.refreshToken.update({
          where: { jti: payload.jti },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Token invalid or already revoked — just clear cookies
    }
  }

  // Clear all auth cookies
  const response = new NextResponse(null, { status: 200 });
  clearTokenCookies().forEach((cookie) =>
    response.headers.append("Set-Cookie", cookie)
  );
  return response;
}
