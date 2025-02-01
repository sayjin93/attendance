"use client";

import { useQuery } from "@tanstack/react-query";
import AddLectureForm from "@/components/AddLectureForm";

async function fetchLectures() {
    const res = await fetch("/api/lectures");
    return res.json();
}

export default function LecturesPage() {
    const { data: lectures, isLoading, error } = useQuery({
        queryKey: ["lectures"],
        queryFn: fetchLectures,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading lectures</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🎓 Leksionet</h1>

            {/* Forma për shtimin e leksioneve */}
            <AddLectureForm />

            {/* Lista e leksioneve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {lectures.map((lecture: { id: string; date: string; class: { name: string } }) => (
                    <div key={lecture.id} className="p-4 bg-white shadow-md rounded-lg">
                        <h2 className="text-xl font-semibold">{new Date(lecture.date).toLocaleDateString()}</h2>
                        <p className="text-sm text-gray-700 mt-2">📚 Klasë: {lecture.class?.name || "Pa klasë"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
