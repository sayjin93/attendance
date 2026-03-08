"use client";
import { useQuery } from "@tanstack/react-query";

//components
import Loader from "@/components/ui/Loader";
import Alert from "@/components/ui/Alert";
import AddLectureCard from "@/components/lectures/AddLectureCard";
import LecturesDataGrid from "@/components/lectures/LecturesDataGrid";
import { LecturesResponse } from "@/types";
import { lectureService } from "@/services";

export default function LecturesPageClient() {
  // Fetch lectures and assignments
  const { data, isLoading, error } = useQuery<LecturesResponse>({
    queryKey: ["lectures"],
    queryFn: () => lectureService.getAll(),
  });

  if (isLoading) return <Loader />;
  if (error) {
    return <Alert type="error" title="Dështoi ngarkimi i leksioneve!" />;
  }

  if (!data) {
    return <Alert type="warning" title="Nuk ka të dhëna të disponueshme." />;
  }

  return (
    <div className="space-y-6">
      {/* Add Lecture Section */}
      <AddLectureCard assignments={data.assignments} isAdmin={data.isAdmin} />
      
      {/* Lectures DataGrid */}
      <LecturesDataGrid assignments={data.assignments} />
    </div>
  );
}
