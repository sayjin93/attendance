"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddStudentForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
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

        if (!name || !email || !classId) return;

        const res = await fetch("/api/students", {
            method: "POST",
            body: JSON.stringify({ name, email, classId }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setName("");
            setEmail("");
            setClassId("");
            queryClient.invalidateQueries({ queryKey: ["students"] }); // Rifreskon listën e studentëve
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-200 rounded">
            <input
                type="text"
                placeholder="Emri i studentit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded w-full mb-2"
            />
            <input
                type="email"
                placeholder="Email i studentit"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <button type="submit" className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
                ➕ Shto Student
            </button>
        </form>
    );
}
