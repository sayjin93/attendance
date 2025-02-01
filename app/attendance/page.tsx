"use client";

import AttendanceForm from "@/components/AttendanceForm";

export default function AttendancePage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">✅ Lista e Prezencës</h1>

            {/* Forma për regjistrimin e prezencës */}
            <AttendanceForm />
        </div>
    );
}
