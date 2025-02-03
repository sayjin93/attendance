"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function Dashboard() {
  const [professor, setProfessor] = useState<{ name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const professorId = localStorage.getItem("professorId");

    if (!token || !professorId) {
      router.push("/login"); // 🚀 Ridrejto në login nëse s'ka autentifikim
      return;
    }

    // ✅ Kontrollojmë nëse professorId është i vlefshëm para se të bëjmë fetch
    if (professorId) {
      fetch(`/api/professors/${professorId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Profesori nuk u gjet");
          return res.json();
        })
        .then((data) => setProfessor(data))
        .catch(() => {
          localStorage.removeItem("token"); // Nëse profesori nuk gjendet, fshij tokenin
          localStorage.removeItem("professorId");
          router.push("/login");
        });
    }
  }, [router]);

  if (!professor) return <Loader />;

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance text-gray-900">🎓 Mirësevini, {professor.name}!</h2>

        <p className="text-lg text-gray-600">
          Menaxhoni klasat, studentët dhe leksionet tuaja.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/classes"
            className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            📚 Menaxho Klasat
          </Link>
          <Link
            href="/students"
            className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            🧑‍🎓 Menaxho Studentët
          </Link>
          <Link
            href="/lectures"
            className="p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600"
          >
            🎓 Menaxho Leksionet
          </Link>
          <Link
            href="/attendance"
            className="p-4 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600"
          >
            ✅ Lista e Prezencës
          </Link>
          <Link
            href="/reports"
            className="p-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
          >
            📊 Raportet e Studentëve
          </Link>
        </div>
      </div>
    </div>
  );
}
