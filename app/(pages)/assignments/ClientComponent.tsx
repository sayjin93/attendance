"use client";

import { useQuery } from "@tanstack/react-query";

//types
import { TeachingAssignment } from "@/types";

//hooks
import { fetchAssignments } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddAssignmentForm from "@/components/AddAssignmentForm";

export default function AssignmentsPageClient({
  isAdmin,
}: {
  isAdmin: string;
}) {
  //#region constants
  const { showMessage } = useNotify();
  //#endregion

  //#region useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => fetchAssignments(),
    enabled: isAdmin === "true",
  });
  //#endregion

  if (isLoading) return <Loader />;
  if (error) {
    showMessage("Error loading assignments.", "error");
    return null;
  }
  const {
    assignments = [],
    professors = [],
    subjects = [],
    teachingTypes = [],
  } = data || {}; // ✅ Extract assignments

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për caktimin e lëndëve për profesorët */}
      <Card title="Cakto Profesor në Lëndë">
        <AddAssignmentForm
          isAdmin={isAdmin}
          professors={professors}
          subjects={subjects}
          teachingTypes={teachingTypes}
        />
      </Card>

      {/* Lista e Assignments */}
      <Card title="Lista e Assignments">
        {assignments?.length === 0 ? (
          <Alert title="Nuk keni ende assignments. Caktoni një profesor më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {assignments?.map((assignment: TeachingAssignment) => (
              <div
                key={assignment.id}
                className="flex justify-center align-middle relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
              >
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold">
                    {assignment.professor?.firstName}{" "}
                    {assignment.professor?.lastName}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {assignment.subject?.name} - {assignment.type?.name}
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
