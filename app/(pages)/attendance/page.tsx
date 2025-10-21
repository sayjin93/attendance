import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import AttendancePageClient from "./ClientComponent";

export default async function AttendancePage() {
  const { professorId } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <AttendancePageClient professorId={professorId} />;
}
