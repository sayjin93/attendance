"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddClassForm() {
    const [name, setName] = useState("");
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) return;

        const res = await fetch("/api/classes", {
            method: "POST",
            body: JSON.stringify({ name }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setName("");
            queryClient.invalidateQueries({ queryKey: ["classes"] }); // Rifreskon listën e klasave
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-200 rounded">
            <input
                type="text"
                placeholder="Emri i klasës"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded w-full"
            />
            <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                ➕ Shto Klasë
            </button>
        </form>
    );
}
