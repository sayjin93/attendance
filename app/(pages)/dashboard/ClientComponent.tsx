"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UsersIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";

//components
import Card from "@/components/Card";

interface DashboardStats {
  classes: number;
  students: number;
  professors: number;
  subjects: number;
  assignments: number;
  lectures: number;
}

interface DashboardClientProps {
  fullName: string;
  isAdmin: boolean;
}

export default function DashboardClient({ fullName, isAdmin }: DashboardClientProps) {
  // Fetch dashboard statistics
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return response.json();
    },
  });

  const adminActions = [
    {
      name: "Klasat",
      description: "Menaxho klasat",
      href: "/classes",
      icon: FolderIcon,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Studentët",
      description: "Menaxho studentët",
      href: "/students",
      icon: UsersIcon,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Profesorët",
      description: "Menaxho profesorët",
      href: "/professors",
      icon: AcademicCapIcon,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      name: "Kurset",
      description: "Menaxho kurset",
      href: "/subjects",
      icon: BookOpenIcon,
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      name: "Caktimet",
      description: "Menaxho caktimet",
      href: "/assignments",
      icon: ClipboardDocumentListIcon,
      color: "bg-cyan-500 hover:bg-cyan-600",
    },
  ];

  const professorActions = [
    {
      name: "Leksionet",
      description: "Menaxho leksionet",
      href: "/lectures",
      icon: CalendarIcon,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      name: "Listëprezenca",
      description: "Shiko prezencën",
      href: "/attendance",
      icon: DocumentDuplicateIcon,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      name: "Raporte",
      description: "Gjenero raporte",
      href: "/reports",
      icon: ChartPieIcon,
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          🎓 Mirësevini, {fullName}!
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdmin
            ? "Menaxhoni të gjithë sistemin e prezencës"
            : "Menaxhoni klasat, studentët dhe leksionet tuaja"}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isAdmin && (
          <>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats ? (
                    <CountUp end={stats.classes} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Klasa Totale</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats ? (
                    <CountUp end={stats.students} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Studentë Totalë</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {stats ? (
                    <CountUp end={stats.professors} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Profesorë Totalë</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {stats ? (
                    <CountUp end={stats.subjects} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Kurse Totale</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">
                  {stats ? (
                    <CountUp end={stats.assignments} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Caktime Aktive</div>
              </div>
            </Card>
          </>
        )}
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats ? (
                <CountUp end={stats.lectures} duration={1.5} />
              ) : (
                0
              )}
            </div>
            <div className="text-sm text-gray-600">Leksione Totale</div>
          </div>
        </Card>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <Card title="Veprime Administruese">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={`${action.color} p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105`}
              >
                <div className="flex items-center gap-3 text-white">
                  <action.icon className="w-8 h-8" />
                  <div>
                    <div className="font-semibold text-lg">{action.name}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Professor Actions */}
      <Card title={isAdmin ? "Veprime Profesori" : "Veprimet Tuaja"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {professorActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`${action.color} p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105`}
            >
              <div className="flex items-center gap-3 text-white">
                <action.icon className="w-8 h-8" />
                <div>
                  <div className="font-semibold text-lg">{action.name}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
