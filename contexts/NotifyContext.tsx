"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define context type
type NotifyContextType = {
    showMessage: (text: string, type: "default" | "success" | "error" | "warning", duration?: number) => void;
};

// Create context
const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

// Message Provider
export default function NotifyProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<{ text: string; type: "default" | "success" | "error" | "warning" } | null>(null);

    const showMessage = (text: string, type: "default" | "success" | "error" | "warning", duration = 3000) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), duration);
    };

    return (
        <NotifyContext.Provider value={{ showMessage }}>
            {children}
            {message && (
                <div className={`fixed top-5 right-5 px-4 py-2 text-white rounded shadow-lg transition-all 
                    ${message.type === "success" ? "bg-green-500" :
                        message.type === "error" ? "bg-red-500" :
                            message.type === "warning" ? "bg-orange-500" :
                                "bg-blue-500"}`}>
                    {message.text}
                </div>
            )}
        </NotifyContext.Provider>
    );
};

// Hook to use message
export const useNotify = () => {
    const context = useContext(NotifyContext);
    if (!context) {
        throw new Error("useNotify must be used within a NotifyProvider");
    }
    return context;
};
