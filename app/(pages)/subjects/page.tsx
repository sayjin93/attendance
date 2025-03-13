import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import SubjectsPageClient from "./ClientComponent";

export default async function SubjectsPage() {
  const { professorId, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <SubjectsPageClient isAdmin={isAdmin} />;
}
