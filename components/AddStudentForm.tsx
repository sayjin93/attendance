import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddStudentForm({ classId, professorId }: { classId: string; professorId: string | null }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/students", {
                method: "POST",
                body: JSON.stringify({ name, email, classId, professorId }),
                headers: { "Content-Type": "application/json" },
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students", classId] });
            setName("");
            setEmail("");
        },
    });

    return (
        <div className="p-4 bg-gray-200 rounded">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emri" className="p-2 border rounded w-full mb-2" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded w-full mb-2" />
            <button onClick={() => mutation.mutate()} className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full" disabled={!name || !email || !classId}>➕ Shto Student</button>
        </div>
    );
}
