"use client";
import { useState, MouseEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotify } from "@/contexts/NotifyContext";

export default function LoginPage() {
    //#region constants
    const router = useRouter();
    const isAuthenticated = useAuth();
    const { showMessage } = useNotify(); // ✅ Use the hook

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
                showMessage(data.error, "error");
            }
        } catch {
            showMessage("Something went wrong. Please try again.", "error");
        }
    };
    //#endregion

    //#region states

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);
    //#endregion

    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Image
                    alt="JK"
                    src="/logo.webp"
                    width={163} // ✅ Set width
                    height={80} // ✅ Set height
                    priority
                    className="mx-auto h-20 w-auto"
                />
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
