"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import AddLectureForm from "@/components/AddLectureForm";
import Loader from "@/components/Loader";

async function fetchLectures(classId: string | null) {
    if (!classId) return [];

    const res = await fetch(`/api/lectures?classId=${classId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
        console.error("Failed to fetch lectures:", await res.text());
        return [];
    }

    return res.json();
}

export default function LecturesPage() {
    const [professorId, setProfessorId] = useState<string | null>(null);
    const [classId, setClassId] = useState("");
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

    // ✅ Fetch professorId safely from localStorage
    useEffect(() => {
        const storedProfessorId = localStorage.getItem("professorId");
        if (storedProfessorId) {
            setProfessorId(storedProfessorId);
        }
    }, []);

    // ✅ Fetch classes associated with the professor
    useEffect(() => {
        if (!professorId) return;

        fetch(`/api/classes?professorId=${professorId}`)
            .then((res) => res.json())
            .then((data) => setClasses(data))
            .catch(() => setClasses([]));
    }, [professorId]);

    const { data: lectures = [], isLoading, error } = useQuery({
        queryKey: ["lectures", classId],
        queryFn: () => fetchLectures(classId),
        enabled: !!classId, // ✅ Prevent API call if no class is selected
    });

    const isAuthenticated = useAuth();
    if (!isAuthenticated || isLoading) return <Loader />;
    if (error) return <p className="text-red-500">⚠️ Error loading lectures. Try again later.</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🎓 Leksionet</h1>

            {/* ✅ Class selection dropdown */}
            <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="p-2 border rounded w-full mb-4"
                disabled={!professorId || classes.length === 0}
            >
                <option value="">📚 Zgjidh Klasën</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name}
                    </option>
                ))}
            </select>

            {/* ✅ Only allow adding lectures if professor is authenticated */}
            <AddLectureForm professorId={professorId} classId={classId} />

            {lectures.length === 0 && classId && (
                <p className="text-gray-500 text-center mt-4">🚀 Nuk ka leksione për këtë klasë.</p>
            )}

            {lectures.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {lectures.map((lecture: { id: string; date: string; class?: { name?: string } }) => (
                        <div key={lecture.id} className="p-4 bg-white shadow-md rounded-lg">
                            <h2 className="text-xl font-semibold">
                                {new Date(lecture.date).toLocaleDateString("fr-FR")} {/* 🔥 Change date format */}
                            </h2>
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
