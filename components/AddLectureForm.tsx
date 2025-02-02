"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddLectureForm() {
    const [date, setDate] = useState("");
    const [classId, setClassId] = useState("");
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [professorId, setProfessorId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // ✅ Fetch professorId from localStorage
    useEffect(() => {
        const storedProfessorId = localStorage.getItem("professorId");
        if (storedProfessorId) {
            setProfessorId(storedProfessorId);
        }
    }, []);

    // ✅ Fetch classes only when professorId is available
    useEffect(() => {
        if (!professorId) return;

        fetch(`/api/classes?professorId=${professorId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch classes");
                return res.json();
            })
            .then((data) => setClasses(data))
            .catch((error) => {
                console.error("❌ Error fetching classes:", error);
                setClasses([]);
            });
    }, [professorId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !classId) return;

        const res = await fetch("/api/lectures", {
            method: "POST",
            body: JSON.stringify({ date, classId }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setDate("");
            setClassId("");
            queryClient.invalidateQueries({ queryKey: ["lectures"] }); // 🔄 Refresh lectures list
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-200 rounded">
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded w-full mb-2"
            />

            <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="p-2 border rounded w-full mb-2"
                disabled={!professorId || classes.length === 0}
            >
                <option value="">📚 Zgjidh Klasën</option>
                {Array.isArray(classes) && classes.length > 0 ? (
                    classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))
                ) : (
                    <option disabled>⚠️ Nuk ka klasa të disponueshme</option>
                )}
            </select>

            <button type="submit" className="mt-2 bg-purple-500 text-white px-4 py-2 rounded" disabled={!classId || !date}>
                ➕ Shto Leksion
            </button>
        </form>
    );
}
