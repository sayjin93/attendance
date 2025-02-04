"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// hooks
import { useAuth } from "@/hooks/useAuth";

// components
import AddLectureForm from "@/components/AddLectureForm";
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import { useNotify } from "@/contexts/NotifyContext";

async function fetchLectures(professorId: string) {
    if (!professorId) return [];

    const res = await fetch(`/api/lectures?professorId=${professorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        console.error("Failed to fetch lectures:", await res.text());
        return [];
    }

    return res.json();
}

export default function LecturesPage() {
    //#region constants
    const router = useRouter();
    const { showMessage } = useNotify();
    const { isAuthenticated, professorId } = useAuth();

    // ✅ Prevent query if professorId is missing (empty string)
    const professorIdString = professorId ? professorId.toString() : "";
    //#endregion

    // ✅ Fetch all lectures for the professor (no class selection needed)
    const { data: lectures = [], isLoading, error } = useQuery({
        queryKey: ["lectures", professorIdString],
        queryFn: () => fetchLectures(professorIdString),
        enabled: !!professorIdString, // ✅ Fetch only when professorId exists
    });

    // ✅ Handle loading state
    if (isLoading || isAuthenticated === null) return <Loader />;

    // ✅ Redirect only after useQuery is executed
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    // ✅ Handle error messages
    if (error) {
        showMessage("Error loading lectures.", "error");
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* ✅ Add Lecture Form */}
            <Card title="Shto Leksion">
                <AddLectureForm />
            </Card>

            {/* ✅ Lecture List */}
            <Card title="Lista e Leksioneve">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {lectures.length === 0 ? (
                        <Alert title="Informacion" desc="🚀 Nuk ka leksione të regjistruara për profesorin tuaj." />
                    ) : (
                        lectures.map((lecture: { id: string; date: string; class?: { name?: string } }) => (
                            <div
                                key={lecture.id}
                                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                            >
                                <h2 className="text-xl font-semibold">
                                    {new Date(lecture.date).toLocaleDateString("fr-FR")}
                                </h2>
                                <p className="text-sm text-gray-700 mt-2">
                                    📚 Klasë: {lecture.class?.name || "Pa klasë"}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
