import { redirect } from "next/navigation";
import { cookies } from "next/headers";


import LoginPageClient from "./ClientComponent";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    return redirect("/dashboard");
  }

  return <LoginPageClient />;
}
