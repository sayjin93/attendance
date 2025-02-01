"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import AddClassForm from "@/components/AddClassForm";

async function fetchClasses() {
  const res = await fetch("/api/classes");
  return res.json();
}

export default function ClassesPage() {
  const { data: classes, isLoading, error } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading classes</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📚 Klasat</h1>

      {/* Forma për shtimin e klasave */}
      <AddClassForm />

      {/* Lista e klasave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {classes.map((classItem: { id: string; name: string }) => (
          <div key={classItem.id} className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold">{classItem.name}</h2>
            <Link href={`/classes/${classItem.id}`} className="text-blue-500 mt-2 block">
              Shiko detajet →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
