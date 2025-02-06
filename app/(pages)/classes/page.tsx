"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

//types
import { Class } from "@/types";

//hooks
import { useAuth } from "@/hooks/useAuth";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddClassForm from "@/components/AddClassForm";

async function fetchClasses(professorId: string) {
  if (!professorId) return [];

  const res = await fetch(`/api/classes?professorId=${professorId}`);
  return res.json();
}

export default function ClassesPage() {
  //#region constants
  const router = useRouter();
  const { showMessage } = useNotify();
  const { isAuthenticated, professorId } = useAuth();

  const professorIdString = professorId ? professorId.toString() : "";
  //#endregion

  //#region useQuery
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classes", professorId],
    queryFn: () => fetchClasses(professorIdString),
    enabled: !!professorId, // ✅ Fetch only if professorId exists
  });
  //#endregion

  if (isLoading || isAuthenticated === null) return <Loader />;
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (error) {
    showMessage("Error loading classes.", "error");
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e klasave */}
      <Card title="Shto klasë">
        <AddClassForm professorId={professorIdString} />
      </Card>

      {/* Lista e klasave */}
      <Card title="Lista e klasave">
        {data?.length === 0 ? (
          <Alert title="Nuk keni ende klasa. Shtoni një klasë më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {data?.map((classItem: Class) => (
              <div
                key={classItem.id}
                className="flex justify-center align-middle relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
              >
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold">{classItem.name}</h2>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
