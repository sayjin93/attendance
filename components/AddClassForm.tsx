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
        <>
            {message && (
                <div className={`p-2 text-white text-center rounded mb-4 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <div className="mt-2">
                        <input
                            name="shtoklase"
                            type="text"
                            placeholder="Emri klasës"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>
                <div className="sm:col-span-3">
                    <div className="mt-2">
                        <button
                            onClick={() => mutation.mutate()}
                            className="w-full inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            disabled={!name} // ✅ Parandalojmë krijimin e klasës bosh
                        >
                            Shto Klasë
                        </button>
                    </div>
                </div>
            </div>



        </>
    );
}
