"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddClassForm() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const professorId = localStorage.getItem("professorId"); // ✅ Merr ID e profesorit
            if (!professorId) {
                setMessage({ text: "❌ Nuk jeni i kyçur si profesor!", type: "error" });
                return;
            }

            const res = await fetch("/api/classes", {
                method: "POST",
                body: JSON.stringify({ name, professorId }), // ✅ Shtojmë professorId në request
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Dështoi krijimi i klasës");

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            setMessage({ text: "✅ Klasa u krijua me sukses!", type: "success" });
            setName("");

            setTimeout(() => setMessage(null), 2000); // 🔥 Fshij mesazhin pas 2 sekondash
        },
        onError: () => {
            setMessage({ text: "❌ Dështoi krijimi i klasës!", type: "error" });
        },
    });

    return (
        <div className="p-4 bg-gray-200 rounded">
            {message && (
                <div className={`p-2 text-white text-center rounded mb-4 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emri i klasës"
                className="p-2 border rounded w-full mb-2"
            />

            <button
                onClick={() => mutation.mutate()}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
                disabled={!name} // ✅ Parandalojmë krijimin e klasës bosh
            >
                ➕ Shto Klasë
            </button>
        </div>
    );
}
