import { cookies } from "next/headers";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";

// ✅ Helper function to check authentication
export async function authenticateRequest() {
    const cookieStore = await cookies(); // ✅ Get cookies
    const token = cookieStore.get("session")?.value;

    if (!token) return { error: "Not authenticated", status: 401 };

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        if (!decoded || !decoded.professorId)
            return { error: "Invalid session", status: 401 }; // ✅ Ensure `decoded` exists
        return { decoded };
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return { error: "Session expired", status: 401 };
        }
        return { error: "Invalid session", status: 401 };
    }
}