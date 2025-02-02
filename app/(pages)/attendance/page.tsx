"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AttendanceForm from "@/components/AttendanceForm";
import { useQuery } from "@tanstack/react-query";

async function fetchAttendance(professorId: string | null) {
    if (!professorId) return [];

    const res = await fetch(`/api/attendance?professorId=${professorId}`);
    return res.json();
}

export default function AttendancePage() {
    const [professorId, setProfessorId] = useState<string | null>(null);

    // ✅ Fetch professorId only on the client
    useEffect(() => {
        setProfessorId(localStorage.getItem("professorId"));
    }, []);

    const { data: attendanceRecords, isLoading, error } = useQuery({
        queryKey: ["attendance", professorId],
        queryFn: () => fetchAttendance(professorId),
        enabled: !!professorId, // ✅ Prevent API requests if professorId is missing
    });

    const isAuthenticated = useAuth();
    if (!isAuthenticated) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">✅ Lista e Prezencës</h1>

            {/* Forma për regjistrimin e prezencës */}
            <AttendanceForm />

            {/* Show loading state */}
            {isLoading && <p>Loading...</p>}

            {/* Show error state */}
            {error && <p>Error loading attendance</p>}

            {/* Show message if no attendance records exist */}
            {attendanceRecords?.length === 0 && (
                <p className="text-gray-500 text-center mt-4">🚀 Nuk ka të dhëna të prezencës për këtë profesor.</p>
            )}
        </div>
    );
}
