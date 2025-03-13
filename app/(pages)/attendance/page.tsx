import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import AttendancePagClient from "./ClientComponent";

export default async function AttendancePage() {
  const { professorId } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  return <AttendancePagClient professorId={professorId} />;
}
