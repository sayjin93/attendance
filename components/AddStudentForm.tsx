"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddStudentForm({ classId }: { classId: string }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/students", {
                method: "POST",
                body: JSON.stringify({ name, email, classId }),
                headers: { "Content-Type": "application/json" },
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students", classId] });
            setMessage({ text: "✅ Studenti u shtua me sukses!", type: "success" });

            setTimeout(() => {
                setMessage(null);
            }, 2000);

            setName("");
            setEmail("");
        },
        onError: () => {
            setMessage({ text: "❌ Gabim gjatë shtimit të studentit!", type: "error" });

            setTimeout(() => {
                setMessage(null);
            }, 2000);
        },
    });

    return (
        <div className="p-4 bg-gray-200 rounded">
            {message && (
                <div className={`p-2 text-white text-center rounded mb-4 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            {/* Input fields for student */}
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emri i studentit"
                className="p-2 border rounded w-full mb-2"
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email i studentit"
                className="p-2 border rounded w-full mb-2"
            />

            {/* ✅ Removed extra "Select Class" dropdown */}
            <button
                onClick={() => mutation.mutate()}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full"
                disabled={!name || !email || !classId} // Prevent submission if no class is selected
            >
                ➕ Shto Student
            </button>
        </div>
    );
}
