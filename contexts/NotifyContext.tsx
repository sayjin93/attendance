"use client";

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";
import type { NotificationType } from "@/types";

// Define context type
type NotifyContextType = {
    showMessage: (text: string, type: NotificationType, duration?: number) => void;
};

// Create context
const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

// Message Provider
export default function NotifyProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<{ text: string; type: NotificationType } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showMessage = useCallback((text: string, type: NotificationType, duration = 3000) => {
        // Clear any existing timer to prevent stale dismissals
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setMessage({ text, type });
        timerRef.current = setTimeout(() => {
            setMessage(null);
            timerRef.current = null;
        }, duration);
    }, []);

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
