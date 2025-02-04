"use client";
import { useState, MouseEvent } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

//hooks
import { useAuth } from "@/hooks/useAuth";

//context
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";

export default function LoginPage() {
    //#region constants
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { showMessage } = useNotify();
    //#endregion

    //#region states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    //#endregion

    //#region functions
    const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!email || !password) {
            showMessage("Please enter both email and password.", "warning");
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
                credentials: "include", // ✅ Siguro që cookie të dërgohet
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                showMessage(data.error, "error");
            }
        } catch {
            showMessage("Something went wrong. Please try again.", "error");
        }
    };
    //#endregion

    if (isAuthenticated === null) return <Loader />;
    if (isAuthenticated) return router.push("/dashboard");

    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Image alt="JK" src="/logo.webp" width={163} height={80} priority className="mx-auto h-20 w-auto" />
                <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                    Sign in to your account
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
                                required
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
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
                                required
                                type="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-white shadow-xs hover:bg-indigo-500 focus:outline-none"
                        >
                            🔐 Sign in
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
