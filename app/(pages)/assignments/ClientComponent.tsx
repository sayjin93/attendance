"use client";

import { useQuery } from "@tanstack/react-query";

//hooks
import { fetchAssignments } from "@/hooks/fetchFunctions";

//components
import Loader from "@/components/ui/Loader";
import Alert from "@/components/ui/Alert";
import AddAssignmentCard from "@/components/assignments/AddAssignmentCard";
import AssignmentsDataGrid from "@/components/assignments/AssignmentsDataGrid";

export default function AssignmentsPageClient({
  isAdmin,
}: {
  isAdmin: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => fetchAssignments(),
    enabled: isAdmin === "true",
  });

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Alert
        type="error"
        title="Gabim"
        message={error instanceof Error ? error.message : "Gabim gjatë ngarkimit të të dhënave"}
        onClose={() => {}}
      />
    );
  }

  if (!data) return null;

  const { assignments, professors, subjects, classes, programs, teachingTypes } = data;

  return (
    <div className="space-y-6">
      <AddAssignmentCard
        professors={professors}
        subjects={subjects}
        classes={classes}
        programs={programs}
        teachingTypes={teachingTypes}
        isAdmin={isAdmin}
      />

      <AssignmentsDataGrid
        assignments={assignments}
        professors={professors}
        subjects={subjects}
        classes={classes}
        teachingTypes={teachingTypes}
        isAdmin={isAdmin}
      />
    </div>
  );
}
