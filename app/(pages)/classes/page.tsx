"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

//hooks
import { useAuth } from "@/hooks/useAuth";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddClassForm from "@/components/AddClassForm";

async function fetchClasses(professorId: string | null) {
  if (!professorId) return [];

  const res = await fetch(`/api/classes?professorId=${professorId}`);
  return res.json();
}

export default function ClassesPage() {
  const [professorId, setProfessorId] = useState<string | null>(null);

  // ✅ Fetch professorId on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfessorId(localStorage.getItem("professorId"));
    }
  }, []);

  const { data: classes, isLoading, error } = useQuery({
    queryKey: ["classes", professorId], // 🔥 Add professorId as a dependency
    queryFn: () => fetchClasses(professorId),
    enabled: !!professorId, // ✅ Prevent API requests if professorId is missing
  });

  const isAuthenticated = useAuth();
  if (isLoading || !isAuthenticated) return <Loader />;
  if (error) return <p className="text-red-500">Error loading classes</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e klasave */}
      <Card title="Shto klasë">
        <AddClassForm />
      </Card>

      {/* Lista e klasave */}
      <Card title="Lista e klasave">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {classes.length === 0 ? (
            <Alert
              title="Information"
              desc="Nuk keni ende klasa. Shtoni një klasë më sipër!"
            />
          ) : (
            classes.map((classItem: { id: string; name: string }) => (
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
