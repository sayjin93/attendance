import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import StudentsPageClient from "./ClientComponent";

export default async function StudentsPage() {
  const { professorId, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <StudentsPageClient isAdmin={isAdmin} />;
}
