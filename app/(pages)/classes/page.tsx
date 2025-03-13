import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import ClassesPageClient from "./ClientComponent";

export default async function ClassesPage() {
  const { professorId, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <ClassesPageClient isAdmin={isAdmin} />;
}
