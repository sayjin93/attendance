"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import AddLectureForm from "@/components/AddLectureForm";

async function fetchLectures(professorId: string) {
    const res = await fetch(`/api/lectures?professorId=${professorId}`);

    if (!res.ok) {
        console.error("Failed to fetch lectures:", await res.text());
        return [];
    }

    return res.json();
}

export default function LecturesPage() {
    const [professorId, setProfessorId] = useState<string | null>(null);

    // ✅ Ensure `professorId` is loaded correctly from `localStorage`
    useEffect(() => {
        const storedProfessorId = localStorage.getItem("professorId");
        if (storedProfessorId) {
            setProfessorId(storedProfessorId);
        }
    }, []);

    // ✅ Only fetch lectures when `professorId` is available
    const { data: lectures = [], isLoading, error } = useQuery({
        queryKey: ["lectures", professorId],
        queryFn: () => fetchLectures(professorId!),
        enabled: !!professorId, // ✅ Prevent API calls if `professorId` is missing
    });

    const isAuthenticated = useAuth();
    if (!isAuthenticated) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🎓 Leksionet</h1>

            {/* ✅ Only allow adding lectures if professor is authenticated */}
            <AddLectureForm />

            {/* Show loading state */}
            {isLoading && <p>Loading...</p>}

            {/* Show error state */}
            {error && <p className="text-red-500">⚠️ Error loading lectures. Try again later.</p>}

            {/* Show message if no lectures are found */}
            {lectures.length === 0 && !isLoading && (
                <p className="text-gray-500 text-center mt-4">🚀 Nuk ka leksione për këtë profesor.</p>
            )}

            {/* ✅ Show list of lectures if available */}
            {lectures.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {lectures.map((lecture: { id: string; date: string; class?: { name?: string } }) => (
                        <div key={lecture.id} className="p-4 bg-white shadow-md rounded-lg">
                            <h2 className="text-xl font-semibold">{new Date(lecture.date).toLocaleDateString()}</h2>
                            <p className="text-sm text-gray-700 mt-2">
                                📚 Klasë: {lecture.class?.name || "Pa klasë"}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
