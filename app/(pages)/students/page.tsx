"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import AddStudentForm from "@/components/AddStudentForm";
import Loader from "@/components/Loader";

async function fetchStudents(classId: string, professorId: string | null) {
    if (!classId || !professorId) return [];

    const res = await fetch(`/api/students?classId=${classId}&professorId=${professorId}`);
    return res.json();
}

async function fetchClasses(professorId: string | null) {
    if (!professorId) return [];

    const res = await fetch(`/api/classes?professorId=${professorId}`);
    return res.json();
}

export default function StudentsPage() {
    const [classId, setClassId] = useState("");
    const [professorId, setProfessorId] = useState<string | null>(null);

    // ✅ Fetch professorId on client-side safely
    useEffect(() => {
        if (typeof window !== "undefined") {
            setProfessorId(localStorage.getItem("professorId"));
        }
    }, []);

    const { data: classes, isLoading: classesLoading } = useQuery({
        queryKey: ["classes", professorId],
        queryFn: () => fetchClasses(professorId),
        enabled: !!professorId,
    });

    const { data: students, isLoading, error } = useQuery({
        queryKey: ["students", classId, professorId],
        queryFn: () => fetchStudents(classId, professorId),
        enabled: !!classId && !!professorId,
    });

    const isAuthenticated = useAuth();
    if (!isAuthenticated || classesLoading) return <Loader />;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🧑‍🎓 Studentët</h1>

            {/* ✅ Dropdown for selecting class */}
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

            {!classId && (
                <p className="text-gray-500 text-center mt-4">⚠️ Zgjidh një klasë për të parë studentët.</p>
            )}

            {classId && <AddStudentForm classId={classId} professorId={professorId} />}

            {isLoading && classId && <Loader />}
            {error && classId && <p className="text-red-500 text-center mt-4">Error loading students</p>}

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

            {students?.length === 0 && classId && (
                <p className="text-gray-500 text-center mt-4">🚀 Nuk ka studentë në këtë klasë.</p>
            )}
        </div>
    );
}
