import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import AssignmentsPageClient from "./ClientComponent";

export default async function AssignmentsPage() {
  const { professorId, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <AssignmentsPageClient isAdmin={isAdmin} />;
}
