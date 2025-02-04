"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

  // ✅ Prevent query if professorId is missing (empty string)
  const professorIdString = professorId ? professorId.toString() : "";
  //#endregion

  // ✅ useQuery must always be executed, so it is placed before any return statements
  const { data: classes, isLoading, error } = useQuery({
    queryKey: ["classes", professorIdString],
    queryFn: () => fetchClasses(professorIdString),
    enabled: !!professorIdString, // ✅ Fetch only if professorId exists
  });

  // ✅ Handle loading state
  if (isLoading || isAuthenticated === null) return <Loader />;

  // ✅ Redirect only after useQuery is executed
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // ✅ Handle error messages
  if (error) {
    showMessage("Error loading classes.", "error");
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e klasave */}
      <Card title="Shto klasë">
        <AddClassForm />
      </Card>

      {/* Lista e klasave */}
      <Card title="Lista e klasave">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {classes?.length === 0 ? (
            <Alert
              title="Nuk keni ende klasa. Shtoni një klasë më sipër!"
            />
          ) : (
            classes?.map((classItem: { id: string; name: string }) => (
              <div key={classItem.id} className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
                <h2 className="text-xl font-semibold">{classItem.name}</h2>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
