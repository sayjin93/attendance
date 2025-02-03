"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

//hooks
import { useAuth } from "@/hooks/useAuth";

//components
import Loader from "@/components/Loader";
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📚 Klasat</h1>

      {/* Forma për shtimin e klasave */}
      <AddClassForm />

      {/* Lista e klasave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {classes.length === 0 ? (
          <p className="text-gray-500">🚀 Nuk keni ende klasa. Shtoni një klasë më sipër!</p>
        ) : (
          classes.map((classItem: { id: string; name: string }) => (
            <div key={classItem.id} className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="text-xl font-semibold">{classItem.name}</h2>
              <Link href={`/classes/${classItem.id}`} className="text-blue-500 mt-2 block">
                Shiko detajet →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
