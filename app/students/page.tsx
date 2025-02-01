"use client";

import { useQuery } from "@tanstack/react-query";
import AddStudentForm from "@/components/AddStudentForm";

async function fetchStudents() {
    const res = await fetch("/api/students");
    return res.json();
}

export default function StudentsPage() {
    const { data: students, isLoading, error } = useQuery({
        queryKey: ["students"],
        queryFn: fetchStudents,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading students</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🧑‍🎓 Studentët</h1>

            {/* Forma për shtimin e studentëve */}
            <AddStudentForm />

            {/* Lista e studentëve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {students.map((student: { id: string; name: string; email: string; class: { name: string } }) => (
                    <div key={student.id} className="p-4 bg-white shadow-md rounded-lg">
                        <h2 className="text-xl font-semibold">{student.name}</h2>
                        <p className="text-gray-500">{student.email}</p>
                        <p className="text-sm text-gray-700 mt-2">📚 Klasë: {student.class?.name || "Pa klasë"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
