"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddLectureForm({ professorId, classId }: { professorId: string | null, classId: string }) {
    const [date, setDate] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // ✅ Set today's date as default (formatted to yyyy-MM-dd for input)
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        setDate(formattedDate);
    }, []);

    // ✅ Prevent adding duplicate lectures on the same date
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !classId) {
            setError("⚠️ Ju lutem zgjidhni një klasë!");
            setTimeout(() => setError(null), 3000);
            return;
        }

        const res = await fetch("/api/lectures", {
            method: "POST",
            body: JSON.stringify({ date, classId, professorId }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setSuccess("✅ Leksioni u shtua me sukses!");
            setTimeout(() => setSuccess(null), 3000);
            setDate(new Date().toISOString().split("T")[0]); // Reset to today's date
            queryClient.invalidateQueries({ queryKey: ["lectures", classId] });
        } else {
            setError("❌ Dështoi shtimi i leksionit!");
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-100 shadow-md rounded-lg relative">
            {/* ✅ Success Message */}
            {success && (
                <div className="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-green-500 text-white text-sm rounded shadow-lg">
                    {success}
                </div>
            )}

            {/* ❌ Error Message */}
            {error && (
                <div className="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-red-500 text-white text-sm rounded shadow-lg">
                    {error}
                </div>
            )}

            {/* 📅 Date Input */}
            <label className="block text-sm font-medium text-gray-700">📅 Data e Leksionit</label>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border rounded w-full mb-2"
            />

            {/* ✅ Submit Button - Disabled if no class is selected */}
            <button
                type="submit"
                className="mt-2 bg-purple-500 text-white px-4 py-2 rounded w-full"
                disabled={!classId || !date}
            >
                ➕ Shto Leksion
            </button>
        </form>
    );
}
