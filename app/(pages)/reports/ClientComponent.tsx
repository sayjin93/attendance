"use client";

import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useMemo, useCallback } from "react";
import { Column } from "devextreme-react/data-grid";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import CommonDataGrid from "../../../components/ui/CommonDataGrid";
import Skeleton from "../../../components/ui/Skeleton";
import { useNotify } from "../../../contexts/NotifyContext";
import { fetchReportData, fetchClassesByProfessor } from "../../../hooks/fetchFunctions";
import {
  RegistryClass as Class,
  RegistrySubject as Subject,
  StudentReport,
  ReportData
} from "@/types";

export default function ReportsPageClient({
  professorId,
}: {
  professorId: string;
}) {
  const { showMessage } = useNotify();

  //#region states
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  //#endregion

  //#region useQuery
  // Fetch classes first (includes program info)
  const {
    data: classes,
    isLoading: loadingClasses,
    error: errorClasses,
  } = useQuery<Class[]>({
    queryKey: ["classes-for-reports", professorId],
    queryFn: () => fetchClassesByProfessor(professorId),
    enabled: !!professorId,
  });

  // Find selected class first (needed for other queries)
  const selectedClass = classes?.find(c => c.id === selectedClassId) || null;

  // Fetch subjects when class is selected
  const {
    data: subjectsData,
    isLoading: loadingSubjects,
  } = useQuery<{ subjects: Subject[] }>({
    queryKey: ["report-subjects", professorId, selectedClassId],
    queryFn: () => fetchReportData(professorId, selectedClass?.programId || "", selectedClassId, ""),
    enabled: !!professorId && !!selectedClassId,
    select: (data) => ({
      subjects: data.subjects || []
    })
  });

  // Fetch full report data when all filters are selected
  const {
    data: reportData,
    isLoading: loadingReports,
    error: errorReports,
  } = useQuery<ReportData>({
    queryKey: ["reports", professorId, selectedClass?.programId, selectedClassId, selectedSubjectId],
    queryFn: () => fetchReportData(professorId, selectedClass?.programId || "", selectedClassId, selectedSubjectId),
    enabled: !!professorId && !!selectedClassId && !!selectedSubjectId,
  });
  //#endregion

  //#region computed values
  // Extract data from queries
  const subjects = subjectsData?.subjects || [];
  const students = reportData?.students || [];

  // Group classes by program for the dropdown - memoized
  const groupedClasses = useMemo(() => {
    return classes?.reduce((acc, cls) => {
      const programName = cls.program?.name || 'Other';
      if (!acc[programName]) {
        acc[programName] = [];
      }
      acc[programName].push(cls);
      return acc;
    }, {} as Record<string, Class[]>) || {};
  }, [classes]);

  // Reset functions - memoized to prevent re-renders
  const resetSelections = useCallback((from: 'class') => {
    if (from === 'class') {
      setSelectedSubjectId("");
    }
  }, []);
  //#endregion

  //#region functions - memoized
  const downloadPDF = useCallback(() => {
    if (!reportData?.students || !reportData?.metadata) return;

    const doc = new jsPDF();
    const { program, class: className, subject } = reportData.metadata;

    // Title
    doc.setFontSize(16);
    doc.text(`Raporti i Prezencës`, 20, 20);

    // Metadata
    doc.setFontSize(12);
    doc.text(`Program: ${program || 'Të gjitha'}`, 20, 35);
    doc.text(`Klasa: ${className || 'Të gjitha'}`, 20, 45);
    doc.text(`Lënda: ${subject || 'Të gjitha'}`, 20, 55);

    // Summary
    if (reportData.summary) {
      doc.text(`Total Studentë: ${reportData.summary.totalStudents}`, 20, 70);
      doc.text(`Studentë të Kaluar: ${reportData.summary.passedStudents}`, 20, 80);
      doc.text(`Studentë NK: ${reportData.summary.failedStudents}`, 20, 90);
      doc.text(`Prezenca Mesatare: ${reportData.summary.averageAttendance.toFixed(1)}%`, 20, 100);
    }

    // Table
    autoTable(doc, {
      startY: 110,
      head: [["Studenti", "Leksione (%)", "Aktiv.(L)", "Seminare (%)", "Aktiv.(S)", "Statusi"]],
      body: reportData.students.map((s: StudentReport) => [
        `${s.firstName} ${s.lastName}`,
        `${s.attendancePercentage.toFixed(1)}%`,
        s.participatedLectures.toString(),
        `${s.seminarPercentage.toFixed(1)}%`,
        s.participatedSeminars.toString(),
        s.overallPassed ? "KALOI" : "NK"
      ]),
    });

    const fileName = `Raporti_${program || 'TeGjitha'}_${className || 'TeGjitha'}_${subject || 'TeGjitha'}.pdf`;
    doc.save(fileName);
  }, [reportData]);
  //#endregion

  if (errorClasses) {
    showMessage("Gabim gjatë ngarkimit të klasave.", "error");
    return <Alert type="error" title="Ka ndodhur një gabim gjatë ngarkimit të të dhënave." />;
  }

  if (errorReports) {
    showMessage("Gabim gjatë ngarkimit të raporteve.", "error");
    return <Alert type="error" title="Ka ndodhur një gabim gjatë ngarkimit të raporteve." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card title="Zgjidhni Klasën dhe Lëndën">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klasa *
            </label>
            <select
              value={selectedClassId || ""}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                resetSelections('class');
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">
                {loadingClasses
                  ? "Duke ngarkuar..."
                  : classes?.length === 0
                    ? "Nuk ka klasa"
                    : "Zgjidhni një klasë..."}
              </option>

              {Object.entries(groupedClasses).map(([programName, programClasses]) => (
                <optgroup key={programName} label={programName}>
                  {programClasses.map((cls: Class) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </optgroup>
              ))}

              {/* Fallback: show all classes without grouping if grouping fails */}
              {Object.entries(groupedClasses).length === 0 && classes?.map((cls: Class) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lënda *
            </label>
            <select
              disabled={!selectedClassId}
              value={selectedSubjectId || ""}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedClassId
                ? "border-gray-300 bg-white"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              required
            >
              <option value="">
                {!selectedClassId
                  ? "Zgjidhni një klasë fillimisht"
                  : loadingSubjects
                    ? "Duke ngarkuar..."
                    : subjects?.length === 0
                      ? "Nuk ka lëndë për këtë klasë"
                      : "Zgjidhni një lëndë..."}
              </option>
              {selectedClassId && subjects && subjects.length > 0 &&
                subjects.map((subject: Subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      {loadingReports ? (
        <Card title="Përmbledhja">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg text-center">
                <Skeleton times={1} rootCls="h-8 w-16 mx-auto mb-2" />
                <Skeleton times={1} rootCls="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : reportData?.summary && students?.length > 0 ? (
        <Card title="Përmbledhja">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Studentë</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.summary.passedStudents}</div>
              <div className="text-sm text-gray-600">Kaluan</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{reportData.summary.failedStudents}</div>
              <div className="text-sm text-gray-600">NK</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{reportData.summary.averageAttendance.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Prezencë Mesatare</div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Student Report Table */}
      <Card title="Raporti i studentëve">
        {loadingReports ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Skeleton times={1} rootCls="h-9 w-48" />
            </div>
            <Skeleton times={1} rootCls="h-8 w-16 mx-auto mb-2" />

          </div>
        ) : students.length === 0 ? (
          <Alert title="Zgjidh programin, klasën dhe lëndën për të parë raportin e studentëve." />
        ) : (
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex justify-end">
              <button
                onClick={downloadPDF}
                className="cursor-pointer inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="-ml-0.5 size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
                Shkarko raportin në PDF
              </button>
            </div>

            <CommonDataGrid
              dataSource={students}
              storageKey="reports-students-grid"
              keyExpr="id"
            >
              <Column
                dataField="firstName"
                caption="👤 Student"
                width={200}
                cellRender={(data) => (
                  <div className="flex items-center gap-2">
                    <span>{data.data.firstName} {data.data.lastName}</span>
                    {data.data.memo && (
                      <div className="group relative inline-block">
                        <svg
                          className="w-4 h-4 text-indigo-500 cursor-help"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none print:hidden">
                          {data.data.memo}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />
              <Column
                dataField="attendancePercentage"
                caption="📚 Leksione"
                width={150}
                alignment="center"
                cellRender={(data) => (
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded text-sm ${data.data.attendancePercentage >= 50
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {data.data.attendancePercentage.toFixed(1)}%
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {data.data.attendedLectures}/{data.data.totalLectures}
                    </div>
                  </div>
                )}
              />
              <Column
                dataField="participatedLectures"
                caption="⭐ Aktivizime (L)"
                width={150}
                alignment="center"
                cellRender={(data) => (
                  <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                    {data.data.participatedLectures}
                  </span>
                )}
              />
              <Column
                dataField="seminarPercentage"
                caption="🎓 Seminare"
                width={150}
                alignment="center"
                cellRender={(data) => (
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded text-sm ${data.data.seminarPercentage >= 75
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {data.data.seminarPercentage.toFixed(1)}%
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {data.data.attendedSeminars}/{data.data.totalSeminars}
                    </div>
                  </div>
                )}
              />
              <Column
                dataField="participatedSeminars"
                caption="⭐ Aktivizime (S)"
                width={150}
                alignment="center"
                cellRender={(data) => (
                  <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                    {data.data.participatedSeminars}
                  </span>
                )}
              />
              <Column
                dataField="overallPassed"
                caption="🏆 Statusi"
                width={120}
                alignment="center"
                cellRender={(data) => (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${data.data.overallPassed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {data.data.overallPassed ? 'KALOI' : 'NK'}
                  </span>
                )}
              />
            </CommonDataGrid>
          </div>
        )}
      </Card>
    </div>
  );
}
