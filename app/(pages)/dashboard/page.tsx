
import Link from "next/link";
import { redirect } from "next/navigation";

//components
import Loader from "@/components/Loader";
import { getAuthHeaders } from "../utils/getAuthHeaders";

export default async function Dashboard() {
  //#region constants
  const { professorId, firstName, lastName, isAdmin } = await getAuthHeaders();

  const fullName = firstName + " " + lastName;
  //#endregion

  if (professorId === null) return <Loader />;
  if (!professorId) return redirect("/login");

  return (
    <div className="lg:pt-16 flex flex-col items-center justify-center">
      <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-balance text-gray-900">🎓 Mirësevini, {fullName}!</h2>

      <p className="text-base sm:text-lg text-gray-600">
        Menaxhoni klasat, studentët dhe leksionet tuaja.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {isAdmin && (
          <>
            <Link
              href="/classes"
              className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
            >
              📚 Menaxho Klasat
            </Link>
            <Link
              href="/students"
              className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
            >
              🧑‍🎓 Menaxho Studentët
            </Link>
          </>
        )}

        <Link
          href="/lectures"
          className="p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600"
        >
          🎓 Menaxho Leksionet
        </Link>
        <Link
          href="/attendance"
          className="p-4 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600"
        >
          ✅ Lista e Prezencës
        </Link>
        <Link
          href="/reports"
          className="p-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
        >
          📊 Raportet e Studentëve
        </Link>
      </div>
    </div>
  );
}
