import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-4xl font-bold">Menaxhimi i Klasave</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/classes" className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
          📚 Menaxho Klasat
        </Link>
        <Link href="/students" className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
          🧑‍🎓 Menaxho Studentët
        </Link>
        <Link href="/lectures" className="p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600">
          🎓 Menaxho Leksionet
        </Link>
        <Link href="/attendance" className="p-4 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600">
          ✅ Lista e Prezencës
        </Link>
        <Link href="/reports" className="p-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600">
          📊 Raportet e Studentëve
        </Link>
      </div>
    </div>
  );
}
