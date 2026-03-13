import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import LoginPageClient from "./ClientComponent";
import { SECRET_KEY } from "@/constants";
import { jwtVerify } from "jose";

export default async function LoginPage() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("access_token")?.value ??
    cookieStore.get("refresh_token")?.value;

  if (!token) {
    return <LoginPageClient />;
  }

  let payload;
  try {
    const result = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
    payload = result.payload;
  } catch {
    return <LoginPageClient />;
  }

  if (payload && payload.professorId) {
    return redirect("/dashboard");
  }

  return <LoginPageClient />;
}
