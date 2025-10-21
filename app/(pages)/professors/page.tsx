import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import ProfessorsPageClient from "./ClientComponent";

export default async function ProfessorsPage() {
  const { professorId, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  // Only admins can access professors page
  if (isAdmin !== "true") return redirect("/dashboard");

  return <ProfessorsPageClient isAdmin={isAdmin} />;
}