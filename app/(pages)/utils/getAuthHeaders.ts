import { headers } from "next/headers";

export async function getAuthHeaders() {
  const headerList = await headers();

  return {
    professorId: headerList.get("X-Professor-Id") || null,
    firstName: headerList.get("X-First-Name") || null,
    lastName: headerList.get("X-Last-Name") || null,
    isAdmin: headerList.get("X-Is-Admin") || "false",
  };
}
