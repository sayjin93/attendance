"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AttendanceForm from "@/components/AttendanceForm";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

async function fetchAttendance(professorId: string | null) {
    if (!professorId) return [];

    const res = await fetch(`/api/attendance?professorId=${professorId}`);

    if (!res.ok) {
        console.error("❌ Error fetching attendance:", await res.text());
        return [];
    }

    return res.json();
}

export default function AttendancePage() {
    const [professorId, setProfessorId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setProfessorId(localStorage.getItem("professorId"));
        }
    }, []);

    const { data: attendanceRecords, isLoading, error } = useQuery({
        queryKey: ["attendance", professorId],
        queryFn: () => fetchAttendance(professorId),
        enabled: !!professorId,
    });

    const isAuthenticated = useAuth();
    if (!isAuthenticated) return <Loader />;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">✅ Lista e Prezencës</h1>

            {/* Attendance Form */}
            <AttendanceForm professorId={professorId} />

            {/* Show loading state */}
            {isLoading && <Loader />}

            {/* Show error state */}
            {error && <p className="text-red-500">⚠️ Error loading attendance</p>}

            {/* Show message if no attendance records exist */}
            {attendanceRecords?.length === 0 && (
                <p className="text-gray-500 text-center mt-4">
                    🚀 Nuk ka të dhëna të prezencës për këtë profesor.
                </p>
            )}
        </div>
    );
}
