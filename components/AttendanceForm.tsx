"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AttendanceForm() {
    const [classId, setClassId] = useState("");
    const [lectureId, setLectureId] = useState("");
    const [students, setStudents] = useState<{ id: string; name: string; status: string }[]>([]);
    const [lectures, setLectures] = useState<{ id: string; date: string }[]>([]);
    const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
    const queryClient = useQueryClient();
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

    // ✅ Fetch classes
    useEffect(() => {
        fetch("/api/classes")
            .then((res) => res.json())
            .then((data) => setClasses(data));
    }, []);

    // ✅ Fetch lectures when class is selected
    useEffect(() => {
        if (classId) {
            fetch(`/api/lectures?classId=${classId}`)
                .then((res) => res.json())
                .then((data) => setLectures(data));
        } else {
            setLectures([]);
        }
    }, [classId]);

    // ✅ Fetch students only if both class & lecture are selected
    useEffect(() => {
        if (!classId || !lectureId) {
            setStudents([]); // Hide students list when missing class/lecture selection
            return;
        }

        Promise.all([
            fetch(`/api/students?classId=${classId}`).then((res) => res.json()),
            fetch(`/api/attendance?classId=${classId}&lectureId=${lectureId}`).then((res) => res.json())
        ]).then(([studentsData, attendanceData]) => {
            const updatedStudents = studentsData.map((student: { id: string; name: string }) => {
                const attendanceRecord = attendanceData.find((att: { student: { id: string } }) => att.student.id === student.id);
                return {
                    id: student.id,
                    name: student.name,
                    status: attendanceRecord ? attendanceRecord.status : "PRESENT",
                };
            });

            setStudents(updatedStudents);
        });
    }, [classId, lectureId]);

    // ✅ Function to change attendance status
    const handleStatusChange = (studentId: string, newStatus: string) => {
        setStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
        );
    };

    // ✅ Function to submit attendance
    const handleSubmit = async () => {
        if (!classId || !lectureId) {
            setMessage({ text: "❌ Zgjidhni një klasë dhe një datë leksioni!", type: "error" });
            return;
        }

        try {
            const promises = students.map((student) =>
                fetch("/api/attendance", {
                    method: "PUT",
                    body: JSON.stringify({
                        studentId: student.id,
                        lectureId,
                        status: student.status,
                    }),
                    headers: { "Content-Type": "application/json" },
                })
            );

            await Promise.all(promises);
            queryClient.invalidateQueries({ queryKey: ["attendance"] });

            setMessage({ text: "✅ Prezenca u regjistrua me sukses!", type: "success" });

            setTimeout(() => {
                setMessage(null);
            }, 2000);
        } catch {
            setMessage({ text: "❌ Gabim gjatë regjistrimit të prezencës!", type: "error" });

            setTimeout(() => {
                setMessage(null);
            }, 2000);
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-200 rounded">
            {message && (
                <div
                    className={`p-2 text-white text-center rounded mb-4 ${message.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Class selection */}
            <select
                value={classId}
                onChange={(e) => {
                    setClassId(e.target.value);
                    setLectureId(""); // Reset lecture when class changes
                    setStudents([]); // Clear students when changing class
                }}
                className="p-2 border rounded w-full mb-2"
            >
                <option value="">📚 Zgjidh Klasën</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name}
                    </option>
                ))}
            </select>

            {/* Lecture selection */}
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
                            {new Date(lec.date).toLocaleDateString()}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>⚠️ Nuk ka leksione</option>
                )}
            </select>

            {/* Students table (Hidden if no lecture is selected) */}
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
                                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
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

            {/* Register attendance button (Hidden if no lecture is selected) */}
            {students.length > 0 && lectureId && (
                <button onClick={handleSubmit} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded w-full">
                    ➕ Regjistro Prezencën për të Gjithë
                </button>
            )}
        </div>
    );
}
