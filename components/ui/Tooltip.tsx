"use client";

import React, { useState, useRef } from "react";

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 8
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className={`relative inline-block ${className}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <svg
                    className="w-4 h-4 text-indigo-500 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {children}
            </div>

            {isVisible && (
                <div
                    className="fixed px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none print:hidden max-w-xs shadow-lg -translate-x-1/2 -translate-y-full"
                    style={{
                        left: position.x,
                        top: position.y,
                        zIndex: 9999
                    }}
                >
                    {content}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            )}
        </>
    );
};

export default Tooltip;