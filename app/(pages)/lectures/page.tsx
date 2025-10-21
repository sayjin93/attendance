import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import LecturesPageClient from "./ClientComponent";

export default async function LecturesPage() {
  const { professorId } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <LecturesPageClient />;
}
