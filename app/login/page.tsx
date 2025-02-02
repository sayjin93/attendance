"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        const res = await fetch("/api/auth", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("professorId", data.professorId);
            router.push("/");
        } else {
            setError(data.error);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">🔐 Login Profesor</h1>
            {error && <p className="text-red-500">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-2" />
            <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
        </div>
    );
}
