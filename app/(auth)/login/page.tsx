"use client";

import { useState, MouseEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
    const router = useRouter();
    const isAuthenticated = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("professorId", data.professorId);
                router.push("/dashboard");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img
                    alt="Your Company"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                    🔐 Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-white shadow-xs hover:bg-indigo-500 focus:outline-none"
                        >
                            Sign in
                        </button>

                        {error && <p className="mt-4 text-red-500">{error}</p>}
                    </form>
                </div>
            </div>
        </>
    );
}
