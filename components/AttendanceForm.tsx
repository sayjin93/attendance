"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AttendanceForm() {
    const [professorId, setProfessorId] = useState<string | null>(null);
    const [classId, setClassId] = useState("");
    const [lectureId, setLectureId] = useState("");
    const [students, setStudents] = useState<{ id: string; name: string; status: string }[]>([]);
    const [lectures, setLectures] = useState<{ id: string; date: string }[]>([]);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const queryClient = useQueryClient();
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

    // ✅ Load professorId from localStorage on mount
    useEffect(() => {
        const storedProfessorId = localStorage.getItem("professorId");
        if (storedProfessorId) {
            setProfessorId(storedProfessorId);
        } else {
            console.error("❌ Professor ID not found in localStorage!");
        }
    }, []);

    // ✅ Fetch classes for the professor
    useEffect(() => {
        if (!professorId) return;

        fetch(`/api/classes?professorId=${professorId}`)
            .then((res) => res.json())
            .then((data) => setClasses(data))
            .catch(() => setClasses([]));
    }, [professorId]);

    // ✅ Fetch lectures for selected class
    useEffect(() => {
        if (!classId) {
            setLectures([]);
            return;
        }

        fetch(`/api/lectures?classId=${classId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setLectures(data);
                } else {
                    console.error("Invalid data received for lectures:", data);
                    setLectures([]);
                }
            })
            .catch(() => setLectures([]));
    }, [classId]);

    // ✅ Fetch students & attendance records for selected class & lecture
    useEffect(() => {
        if (!classId || !lectureId || !professorId) {
            setStudents([]);
            return;
        }

        const apiUrl = `/api/attendance?classId=${classId}&lectureId=${lectureId}&professorId=${professorId}`;
        console.log("Fetching students from API:", apiUrl); // Debugging Log

        fetch(apiUrl)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setStudents(data);
                } else {
                    console.error("Invalid data received for students:", data);
                    setStudents([]);
                }
            })
            .catch(() => setStudents([]));
    }, [classId, lectureId, professorId]);

    // ✅ Submit attendance
    const handleSubmit = async () => {
        if (!classId || !lectureId) {
            setMessage({ text: "⚠️ Zgjidh një klasë dhe një leksion!", type: "error" });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            await Promise.all(students.map((student) =>
                fetch("/api/attendance", {
                    method: "PUT",
                    body: JSON.stringify({ studentId: student.id, lectureId, status: student.status }),
                    headers: { "Content-Type": "application/json" },
                })
            ));

            queryClient.invalidateQueries({ queryKey: ["attendance"] });

            setMessage({ text: "✅ Prezenca u regjistrua me sukses!", type: "success" });
            setTimeout(() => setMessage(null), 3000);
        } catch {
            setMessage({ text: "❌ Gabim gjatë regjistrimit të prezencës!", type: "error" });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="p-4 bg-gray-200 rounded relative">
            {/* ✅ Notification Message */}
            {message && (
                <div className={`fixed top-5 right-5 px-4 py-2 text-white rounded shadow-lg transition-all ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            {/* ✅ Class Selection */}
            <select
                value={classId}
                onChange={(e) => {
                    setClassId(e.target.value);
                    setLectureId(""); // Reset lecture when class changes
                    setStudents([]); // Clear students when changing class
                }}
                className="p-2 border rounded w-full mb-2"
                disabled={!professorId}
            >
                <option value="">📚 Zgjidh Klasën</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
            </select>

            {/* ✅ Lecture Selection */}
            <select
                value={lectureId}
                onChange={(e) => setLectureId(e.target.value)}
                className="p-2 border rounded w-full mb-2"
                disabled={!classId}
            >
                <option value="">📅 Zgjidh Datën e Leksionit</option>
                {lectures.length > 0 ? (
                    lectures.map((lec) => (
                        <option key={lec.id} value={lec.id}>
                            {new Date(lec.date).toLocaleDateString("fr-FR")}
                        </option>
                    ))
                ) : (
                    <option disabled>⚠️ Nuk ka leksione të disponueshme</option>
                )}
            </select>

            {/* ✅ Student List Table */}
            {students.length > 0 && lectureId && (
                <table className="w-full bg-white shadow-md rounded-lg mt-4">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 text-left">👤 Student</th>
                            <th className="p-3 text-center">📌 Prezencë</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="border-b">
                                <td className="p-3">{student.name}</td>
                                <td className="p-3 text-center">
                                    <select
                                        value={student.status}
                                        onChange={(e) => {
                                            setStudents(prev =>
                                                prev.map(s =>
                                                    s.id === student.id ? { ...s, status: e.target.value } : s
                                                )
                                            );
                                        }}
                                        className="p-2 border rounded"
                                    >
                                        <option value="PRESENT">✅ Prezente</option>
                                        <option value="ABSENT">❌ Mungesë</option>
                                        <option value="PARTICIPATED">🙋 Aktivizuar</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* ✅ Register Attendance Button */}
            <button
                onClick={handleSubmit}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded w-full"
                disabled={!lectureId}
            >
                ➕ Regjistro Prezencën për të Gjithë
            </button>
        </div>
    );
}
