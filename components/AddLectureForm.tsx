"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddLectureForm() {
    const [date, setDate] = useState("");
    const [classId, setClassId] = useState("");
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Fetch klasat për dropdown
        fetch("/api/classes")
            .then((res) => res.json())
            .then((data) => setClasses(data));
    }, []);

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
            queryClient.invalidateQueries({ queryKey: ["lectures"] }); // Rifreskon listën e leksioneve
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
            >
                <option value="">Zgjidh klasën</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name}
                    </option>
                ))}
            </select>
            <button type="submit" className="mt-2 bg-purple-500 text-white px-4 py-2 rounded">
                ➕ Shto Leksion
            </button>
        </form>
    );
}
