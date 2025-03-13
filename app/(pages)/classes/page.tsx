import { redirect } from "next/navigation";
import { getAuthHeaders } from "../utils/authUtils";
import ClassesPageClient from "./ClientComponent";

//components
import Loader from "@/components/Loader";

export default async function ClassesPage() {
  //#region constants
  const { professorId, isAdmin } = await getAuthHeaders();
  //#endregion

  if (professorId === null) return <Loader />;
  if (!professorId) return redirect("/login");

  return <ClassesPageClient isAdmin={isAdmin} />;

}
