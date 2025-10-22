import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import DashboardClient from "./ClientComponent";

export default async function Dashboard() {
  const { professorId, firstName, lastName, isAdmin } = await getAuthHeaders();

  if (!professorId) return redirect("/login");

  const fullName = `${firstName} ${lastName}`;

  return <DashboardClient fullName={fullName} isAdmin={isAdmin === "true"} />;
}
