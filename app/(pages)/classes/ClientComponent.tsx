"use client";
import { useQuery } from "@tanstack/react-query";

//types
import { Class } from "@/types";

//hooks
import { fetchClasses } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddClassForm from "@/components/AddClassForm";

export default function ClassesPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  //#endregion

  //#region useQuery
  const { data: classes = [], isLoading, error } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
    enabled: isAdmin === "true",
  });
  //#endregion

  if (isLoading) return <Loader />;
  if (error) {
    showMessage("Error loading classes.", "error");
    return null;
  }

  // Filter programs from classes
  const programs = Array.from(
    new Map(
      classes
        .filter(c => c.program) // Filter out undefined
        .map(c => [c.program!.id, c.program!]) // Non-null assertion
    ).values()
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e klasave */}
      <Card title="Shto klasë">
        <AddClassForm isAdmin={isAdmin} programs={programs} />
      </Card>

      {/* Lista e klasave */}
      <Card title="Lista e klasave">
        {classes?.length === 0 ? (
          <Alert title="Nuk keni ende klasa. Shtoni një klasë më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {classes?.map((classItem: Class) => (
              <div
                key={classItem.id}
                className="flex justify-center align-middle relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
              >
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold">{classItem.name}</h2>
                  <p className="text-gray-600 text-sm">
                    {classItem.program?.name || "No Program"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
