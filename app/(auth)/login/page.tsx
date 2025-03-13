import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import LoginPageClient from "./ClientComponent";
import { SECRET_KEY } from "@/constants";
import { jwtVerify } from "jose";

export default async function LoginPage() {
  // Get the session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  // If there's no token, show the login page.
  if (!token) {
    return <LoginPageClient />;
  }

  let payload;
  try {
    const result = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
    payload = result.payload;
  } catch {
    // If verification fails, render the login page.
    return <LoginPageClient />;
  }

  // If token is valid and contains professorId, perform the redirect.
  if (payload && payload.professorId) {
    return redirect("/dashboard");
  }

  return <LoginPageClient />;
}
