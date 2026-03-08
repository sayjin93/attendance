"use client";
import Link from "next/link";
import { useState, useCallback } from "react";
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
  ChartPieIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";

//components
import Card from "@/components/ui/Card";

import { DashboardStats, DashboardClientProps } from "@/types";
import { dashboardService } from "@/services";
import { getLabelColor } from "@/lib/utils";

export default function DashboardClient({ fullName, isAdmin }: DashboardClientProps) {
  // Tooltip state
  const [tooltipData, setTooltipData] = useState<{
    show: boolean;
    content: string;
    position: { x: number; y: number };
  }>({
    show: false,
    content: "",
    position: { x: 0, y: 0 }
  });

  // Fetch dashboard statistics
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getStats(),
  });

  const formatTeachingTypes = useCallback((types: { id: number; name: string }[]) => {
    if (!types || types.length === 0) return "Nuk ka tip";
    return types.map(type => type.name).join(", ");
  }, []);

  // Tooltip handlers
  const handleTooltipShow = useCallback((event: React.MouseEvent, content: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      show: true,
      content,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  }, []);

  const handleTooltipHide = useCallback(() => {
    setTooltipData(prev => ({ ...prev, show: false }));
  }, []);

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
      name: "Regjistri",
      description: "Shiko regjistrin",
      href: "/registry",
      icon: TableCellsIcon,
      color: "bg-slate-500 hover:bg-slate-600",
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          🎓 Mirësevini, {fullName}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {isAdmin
            ? "Menaxhoni të gjithë sistemin e prezencës"
            : "Menaxhoni leksionet, listëprezencat dhe gjeneroni raporte"}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isAdmin && (
          <>
            <Card>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats ? (
                    <CountUp end={stats.classes} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Klasa Totale</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats ? (
                    <CountUp end={stats.students} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Studentë Totalë</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                  {stats ? (
                    <CountUp end={stats.professors} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Profesorë Totalë</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-teal-600">
                  {stats ? (
                    <CountUp end={stats.subjects} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Kurse Totale</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-cyan-600">
                  {stats ? (
                    <CountUp end={stats.assignments} duration={1.5} />
                  ) : (
                    0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Caktime Aktive</div>
              </div>
            </Card>
          </>
        )}
        
        {/* Professor Statistics - Show for non-admin users */}
        {!isAdmin && (
          <>
            {/* Row 1: Assignments and Subjects */}
            <div className="col-span-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* My Assignments Card - Shows Classes */}
                <Card>
                  <div className="p-1 sm:p-2">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-cyan-600">
                          {stats ? (
                            <CountUp end={stats.assignments || 0} duration={1.5} />
                          ) : (
                            0
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Caktimet e Mia</div>
                      </div>
                      <ClipboardDocumentListIcon className="w-7 h-7 sm:w-8 sm:h-8 min-w-7 sm:min-w-8 shrink-0 text-cyan-600" />
                    </div>
                    <div className="min-h-16">
                      {stats?.assignmentClasses && stats.assignmentClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {stats.assignmentClasses.map((cls) => {
                            const colors = getLabelColor(cls.id);
                            const typesText = formatTeachingTypes(cls.types);
                            return (
                              <span
                                key={cls.id}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border} cursor-help`}
                                onMouseEnter={(e) => handleTooltipShow(e, typesText)}
                                onMouseLeave={handleTooltipHide}
                              >
                                {cls.name}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-2">
                          <span className="text-xs text-gray-400 italic">Nuk ka caktime</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* My Subjects Card - Shows Subjects */}
                <Card>
                  <div className="p-1 sm:p-2">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-teal-600">
                          {stats ? (
                            <CountUp end={stats.subjects || 0} duration={1.5} />
                          ) : (
                            0
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Kurset e Mia</div>
                      </div>
                      <BookOpenIcon className="w-7 h-7 sm:w-8 sm:h-8 min-w-7 sm:min-w-8 shrink-0 text-teal-600" />
                    </div>
                    <div className="min-h-16">
                      {stats?.subjectList && stats.subjectList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {stats.subjectList.map((subject) => {
                            const colors = getLabelColor(subject.id);
                            const typesText = formatTeachingTypes(subject.types);
                            return (
                              <span
                                key={subject.id}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border} cursor-help`}
                                onMouseEnter={(e) => handleTooltipShow(e, typesText)}
                                onMouseLeave={handleTooltipHide}
                              >
                                {subject.name}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-2">
                          <span className="text-xs text-gray-400 italic">Nuk ka kurse</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Row 2: Lectures and Attendance */}
            <div className="col-span-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats ? (
                        <CountUp end={stats.lectures} duration={1.5} />
                      ) : (
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Leksione të mbajtura</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats ? (
                        <CountUp end={stats.attendance || 0} duration={1.5} />
                      ) : (
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Listëprezenca të mbajtura</div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
        
        {/* Lectures card for admin users */}
        {isAdmin && (
          <Card>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {stats ? (
                  <CountUp end={stats.lectures} duration={1.5} />
                ) : (
                  0
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Leksione Totale</div>
            </div>
          </Card>
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <Card title="Veprime Administruese">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {adminActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={`${action.color} p-4 sm:p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-white">
                  <action.icon className="w-8 h-8 sm:w-8 sm:h-8 min-w-8 shrink-0" />
                  <div className="text-center sm:text-left">
                    <div className="font-semibold text-sm sm:text-lg">{action.name}</div>
                    <div className="text-xs sm:text-sm opacity-90 hidden sm:block">{action.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Professor Actions */}
      <Card title={isAdmin ? "Veprime Profesori" : "Veprimet Tuaja"}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {professorActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`${action.color} p-4 sm:p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-white">
                <action.icon className="w-8 h-8 sm:w-8 sm:h-8 min-w-8 shrink-0" />
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-sm sm:text-lg">{action.name}</div>
                  <div className="text-xs sm:text-sm opacity-90 hidden sm:block">{action.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Fixed position tooltip */}
      {tooltipData.show && (
        <div 
          className="fixed pointer-events-none transition-opacity duration-200"
          style={{
            zIndex: 9999,
            left: tooltipData.position.x,
            top: tooltipData.position.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-xl border border-gray-600">
            {tooltipData.content}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
