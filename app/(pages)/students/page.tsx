"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

//hooks
import { useAuth } from "@/hooks/useAuth";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import AddStudentForm from "@/components/AddStudentForm";
import { useState } from "react";
import Alert from "@/components/Alert";

async function fetchStudents(classId: string, professorId: string | null) {
    if (!classId || !professorId) return [];

    const res = await fetch(`/api/students?classId=${classId}&professorId=${professorId}`);
    return res.json();
}

async function fetchClasses(professorId: string | null) {
    if (!professorId) return [];

    const res = await fetch(`/api/classes?professorId=${professorId}`);
    return res.json();
}

export default function StudentsPage() {
    const router = useRouter();
    const { showMessage } = useNotify();
    const { isAuthenticated, professorId } = useAuth();

    // ✅ Prevent query if professorId is missing (empty string)
    const professorIdString = professorId ? professorId.toString() : "";
    //#endregion

    const [classId, setClassId] = useState("");

    const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
        queryKey: ["classes", professorIdString],
        queryFn: () => fetchClasses(professorIdString),
        enabled: !!professorIdString,
    });

    const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
        queryKey: ["students", classId, professorId],
        queryFn: () => fetchStudents(classId, professorIdString),
        enabled: !!classId && !!professorId,
    });

    // ✅ Handle loading state
    if (isAuthenticated === null) return <Loader />;

    // ✅ Redirect only after useQuery is executed
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    // ✅ Handle error messages
    if (classesError) {
        showMessage("Error loading classes.", "error");
        return null;
    }
    if (studentsError) {
        showMessage("Error loading students.", "error");
        return null;
    }

    // ✅ Handle loading state
    if (classesLoading) return <Loader />;

    return (
        <div className="flex flex-col gap-4">
            {/* ✅ Dropdown for selecting class */}
            <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="p-4 border rounded w-full"
            >
                <option value="">📚 Zgjidh Klasën</option>
                {classes?.map((cls: { id: string; name: string }) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name}
                    </option>
                ))}
            </select>

            {!classId && <Alert title="Zgjidh një klasë për të parë studentët" />}

            {classId && <AddStudentForm classId={classId} professorId={professorIdString} />}

            {studentsLoading && classId && <Loader />}

            {students?.length > 0 && classId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.map((student: { id: string; name: string; email: string; class: { name: string } }) => (
                        <div key={student.id} className="p-4 bg-white shadow-md rounded-lg">
                            <h2 className="text-xl font-semibold">{student.name}</h2>
                            <p className="text-gray-500">{student.email}</p>
                            <p className="text-sm text-gray-700 mt-2">📚 Klasë: {student.class?.name || "Pa klasë"}</p>
                        </div>
                    ))}
                </div>
            )}

            {students?.length === 0 && classId && <Alert title="Nuk ka studentë në këtë klasë" />}
        </div>
    );
}
