"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

import { useAuth } from "@/hooks/useAuth";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

async function fetchClasses(professorId: string | null) {
    if (!professorId) return [];

    const res = await fetch(`/api/classes?professorId=${professorId}`);
    return res.json();
}

async function fetchReports(classId: string, professorId: string | null) {
    if (!classId || !professorId) return [];

    const res = await fetch(`/api/reports?classId=${classId}&professorId=${professorId}`);
    return res.json();
}

export default function ReportsPage() {
    const [classId, setClassId] = useState("");
    const [students, setStudents] = useState<{ id: string; name: string; presence: number; absence: number; participation: number }[]>([]);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const professorId = localStorage.getItem("professorId"); // ✅ Get professorId

    useEffect(() => {
        if (professorId) {
            fetchClasses(professorId).then(setClasses);
        }
    }, [professorId]);

    useEffect(() => {
        if (classId && professorId) {
            fetchReports(classId, professorId).then(setStudents);
        } else {
            setStudents([]);
        }
    }, [classId, professorId]);

    const selectedClass = classes.find((cls) => cls.id === classId)?.name || "Zgjidh një klasë";

    // ✅ Function to download PDF report
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text(`Raporti i Studentëve - ${selectedClass}`, 20, 10);

        autoTable(doc, {
            head: [["Studenti", "Prezencë", "Mungesë", "Aktivizim"]],
            body: students.map((s) => [s.name, s.presence, s.absence, s.participation]),
        });

        doc.save(`Raporti_${selectedClass}.pdf`);
    };

    const isAuthenticated = useAuth();
    if (!isAuthenticated) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">📊 Raporti i Studentëve - {selectedClass}</h1>

            {/* Dropdown for selecting class */}
            <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="p-2 border rounded w-full mb-4"
            >
                <option value="">📚 Zgjidh Klasën</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name}
                    </option>
                ))}
            </select>

            {/* Show message if no class is selected */}
            {!classId && (
                <p className="text-gray-500 text-center mt-4">⚠️ Zgjidh një klasë për të parë raportin.</p>
            )}

            {/* Student Report Table */}
            {students.length > 0 && classId && (
                <>
                    <table className="w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 text-left">👤 Student</th>
                                <th className="p-3 text-center">✅ Prezencë</th>
                                <th className="p-3 text-center">❌ Mungesë</th>
                                <th className="p-3 text-center">🙋 Aktivizim</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="border-b">
                                    <td className="p-3">{student.name}</td>
                                    <td className="p-3 text-center">{student.presence}</td>
                                    <td className="p-3 text-center">{student.absence}</td>
                                    <td className="p-3 text-center">{student.participation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Download Report Button */}
                    <button onClick={downloadPDF} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                        📥 Shkarko Raportin në PDF
                    </button>

                    {/* Attendance Analysis Chart */}
                    <div className="mt-6" style={{ height: "400px" }}>
                        <h2 className="text-2xl font-bold mb-2">📊 Analiza e Prezencës</h2>
                        <Bar
                            data={{
                                labels: students.map((s) => s.name),
                                datasets: [
                                    { label: "Prezencë ✅", data: students.map((s) => s.presence), backgroundColor: "#81c784" },
                                    { label: "Mungesë ❌", data: students.map((s) => s.absence), backgroundColor: "#e57373" },
                                    { label: "Aktivizim 🙋", data: students.map((s) => s.participation), backgroundColor: "#ffcc80" },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: { type: "category", title: { display: true, text: "Studentët" } },
                                    y: { beginAtZero: true, title: { display: true, text: "Numri" } },
                                },
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
