import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  debugger;
  const headerList = await headers();
  const professorId = headerList.get("X-Professor-Id");

  if (!professorId) {
    redirect("/login"); // 🚀 Redirect to login if not authenticated
  } else {
    redirect("/dashboard"); // 🚀 Redirect to dashboard if authenticated
  }
}
