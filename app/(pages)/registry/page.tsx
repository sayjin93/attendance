import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import RegistryPageClient from "./ClientComponent";

export default async function RegistryPage() {
  const { professorId, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <RegistryPageClient professorId={professorId} isAdmin={isAdmin === "true"} />;
}