"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import AddStudentForm from "@/components/AddStudentForm";

async function fetchStudents(classId: string, professorId: string | null) {
    if (!classId || !professorId) return [];

    const res = await fetch(`/api/students?classId=${classId}&professorId=${professorId}`);
    return res.json();
}

async function fetchClasses() {
    const professorId = localStorage.getItem("professorId");
    if (!professorId) return [];

    const res = await fetch(`/api/classes?professorId=${professorId}`);
    return res.json();
}

export default function StudentsPage() {
    const [classId, setClassId] = useState("");
    const professorId = localStorage.getItem("professorId"); // ✅ Ensure professorId is available

    const { data: classes } = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });

    // ✅ Only fetch students when classId & professorId are set
    const { data: students, isLoading, error } = useQuery({
        queryKey: ["students", classId, professorId],
        queryFn: () => fetchStudents(classId, professorId),
        enabled: !!classId && !!professorId, // ✅ Prevents API requests when classId is empty or professorId is missing
    });

    const isAuthenticated = useAuth();
    if (!isAuthenticated) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🧑‍🎓 Studentët</h1>

            {/* ✅ Dropdown to dynamically load class IDs */}
            <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="p-2 border rounded w-full mb-4"
            >
                <option value="">📚 Zgjidh Klasën</option>
                {classes?.map((cls: { id: string; name: string }) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name}
                    </option>
                ))}
            </select>

            {/* Show message if no class is selected */}
            {!classId && (
                <p className="text-gray-500 text-center mt-4">⚠️ Zgjidh një klasë për të parë studentët.</p>
            )}

            {/* ✅ Pass correct classId to AddStudentForm */}
            {classId && <AddStudentForm classId={classId} />}

            {/* Show loading state */}
            {isLoading && classId && <p>Loading...</p>}

            {/* Show error state */}
            {error && classId && <p>Error loading students</p>}

            {/* Show student list when students exist */}
            {students?.length > 0 && classId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {students.map((student: { id: string; name: string; email: string; class: { name: string } }) => (
                        <div key={student.id} className="p-4 bg-white shadow-md rounded-lg">
                            <h2 className="text-xl font-semibold">{student.name}</h2>
                            <p className="text-gray-500">{student.email}</p>
                            <p className="text-sm text-gray-700 mt-2">📚 Klasë: {student.class?.name || "Pa klasë"}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Show message if no students are found */}
            {students?.length === 0 && classId && (
                <p className="text-gray-500 text-center mt-4">🚀 Nuk ka studentë në këtë klasë.</p>
            )}
        </div>
    );
}
