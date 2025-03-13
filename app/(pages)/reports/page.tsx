import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import ReportsPageClient from "./ClientComponent";

export default async function ReportsPage() {
  const { professorId } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <ReportsPageClient professorId={professorId} />;
}
