"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useMemo } from "react";
import Alert from "../../../components/Alert";
import Card from "../../../components/Card";
import Skeleton from "../../../components/Skeleton";
import { useNotify } from "../../../contexts/NotifyContext";
import { fetchReportData } from "../../../hooks/fetchFunctions";

// New interfaces for the reports module
interface Program {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  programId: string;
}

interface Subject {
  id: string;
  name: string;
}

interface StudentReport {
  id: string;
  firstName: string;
  lastName: string;
  totalLectures: number;
  attendedLectures: number;
  participatedLectures: number;
  attendancePercentage: number;
  passedLectures: boolean;
  totalSeminars: number;
  attendedSeminars: number;
  participatedSeminars: number;
  seminarPercentage: number;
  passedSeminars: boolean;
  overallPassed: boolean;
}

interface ReportData {
  students: StudentReport[];
  summary: {
    totalStudents: number;
    passedStudents: number;
    failedStudents: number;
    averageAttendance: number;
  };
  metadata: {
    program: string;
    class: string;
    subject: string;
  };
  programs: Program[];
  classes: Class[];
  subjects: Subject[];
}

export default function ReportsPageClient({
  professorId,
}: {
  professorId: string;
}) {
  const { showMessage } = useNotify();

  //#region states
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentReport | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  //#endregion

  //#region useQuery
  // Fetch programs initially
  const {
    data: reportData,
    isLoading: loadingReports,
    error: errorReports,
  } = useQuery<ReportData>({
    queryKey: ["reports", professorId, selectedProgramId, selectedClassId, selectedSubjectId],
    queryFn: () => fetchReportData(professorId, selectedProgramId, selectedClassId, selectedSubjectId),
    enabled: !!professorId,
  });
  //#endregion

  //#region functions
  const handleSort = (key: keyof StudentReport) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: keyof StudentReport) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUpDownIcon className="w-4 h-4 inline ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-4 h-4 inline ml-1 text-indigo-600" />
      : <ChevronDownIcon className="w-4 h-4 inline ml-1 text-indigo-600" />;
  };

  const downloadPDF = () => {
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
      head: [["Studenti", "Leksione (%)", "Aktiv.(L)", "Kaloi Leks.", "Seminare (%)", "Aktiv.(S)", "Kaloi Sem.", "Statusi"]],
      body: reportData.students.map((s: StudentReport) => [
        `${s.firstName} ${s.lastName}`,
        `${s.attendancePercentage.toFixed(1)}%`,
        s.participatedLectures.toString(),
        s.passedLectures ? "Po" : "Jo",
        `${s.seminarPercentage.toFixed(1)}%`,
        s.participatedSeminars.toString(),
        s.passedSeminars ? "Po" : "Jo",
        s.overallPassed ? "KALOI" : "NK"
      ]),
    });

    const fileName = `Raporti_${program || 'TeGjitha'}_${className || 'TeGjitha'}_${subject || 'TeGjitha'}.pdf`;
    doc.save(fileName);
  };

  const resetSelections = (fromLevel: 'program' | 'class') => {
    if (fromLevel === 'program') {
      setSelectedClassId("");
      setSelectedSubjectId("");
    } else if (fromLevel === 'class') {
      setSelectedSubjectId("");
    }
  };
  //#endregion

  const programs = reportData?.programs || [];
  const classes = reportData?.classes || [];
  const subjects = reportData?.subjects || [];

  // Sort students based on sortConfig
  const students = useMemo(() => {
    const studentsRaw = reportData?.students || [];
    if (!sortConfig.key) return studentsRaw;

    const sorted = [...studentsRaw].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof StudentReport];
      const bValue = b[sortConfig.key as keyof StudentReport];

      // Handle string values (firstName, lastName)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Handle numeric and boolean values
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [reportData?.students, sortConfig]);

  if (errorReports) {
    showMessage("Gabim gjatë ngarkimit të raporteve.", "error");
    return <Alert type="error" title="Ka ndodhur një gabim gjatë ngarkimit të raporteve." />;
  }

  // Filter classes based on selected program
  const filteredClasses = selectedProgramId
    ? classes.filter((c: Class) => c.programId === selectedProgramId)
    : [];

  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  const selectedClass = filteredClasses.find(c => c.id === selectedClassId);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Filters in one row */}
      <Card title="Filtrat">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Program Selector */}
          <div>
            <Listbox value={selectedProgramId} onChange={(value) => {
              setSelectedProgramId(value);
              resetSelections('program');
            }}>
              <div className="relative">
                <ListboxButton className="grid w-full cursor-pointer grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                  <span className="col-start-1 row-start-1 truncate pr-6">
                    {programs?.length === 0
                      ? "Nuk ka programe"
                      : !selectedProgramId
                        ? "Zgjidh programin"
                        : selectedProgram?.name}
                  </span>
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </ListboxButton>

                <ListboxOptions
                  transition
                  className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                >
                  {programs?.map((program: Program) => (
                    <ListboxOption
                      key={program.id}
                      value={program.id}
                      className="group relative cursor-pointer py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                    >
                      <span className="block truncate font-normal group-data-selected:font-semibold">
                        {program.name}
                      </span>

                      <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                        <CheckIcon aria-hidden="true" className="size-5" />
                      </span>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {/* Class Selector */}
          <div>
            <Listbox
              value={selectedClassId}
              onChange={(value) => {
                setSelectedClassId(value);
                resetSelections('class');
              }}
              disabled={!selectedProgramId}
            >
              <div className="relative">
                <ListboxButton
                  className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6 ${!selectedProgramId
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-900 cursor-pointer focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600'
                    }`}
                >
                  <span className="col-start-1 row-start-1 truncate pr-6">
                    {!selectedProgramId
                      ? "Zgjidhni programin më parë"
                      : filteredClasses?.length === 0
                        ? "Nuk ka klasa për këtë program"
                        : !selectedClassId
                          ? "Zgjidh klasën"
                          : selectedClass?.name}
                  </span>
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </ListboxButton>

                {selectedProgramId && (
                  <ListboxOptions
                    transition
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                  >
                    {filteredClasses?.map((cls: Class) => (
                      <ListboxOption
                        key={cls.id}
                        value={cls.id}
                        className="group relative cursor-pointer py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                      >
                        <span className="block truncate font-normal group-data-selected:font-semibold">
                          {cls.name}
                        </span>

                        <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                          <CheckIcon aria-hidden="true" className="size-5" />
                        </span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                )}
              </div>
            </Listbox>
          </div>

          {/* Subject Selector */}
          <div>
            <Listbox
              value={selectedSubjectId}
              onChange={setSelectedSubjectId}
              disabled={!selectedClassId}
            >
              <div className="relative">
                <ListboxButton
                  className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6 ${!selectedClassId
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-900 cursor-pointer focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600'
                    }`}
                >
                  <span className="col-start-1 row-start-1 truncate pr-6">
                    {!selectedClassId
                      ? "Zgjidhni klasën më parë"
                      : subjects?.length === 0
                        ? "Nuk ka lëndë për këtë klasë"
                        : !selectedSubjectId
                          ? "Zgjidh lëndën"
                          : selectedSubject?.name}
                  </span>
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </ListboxButton>

                {selectedClassId && (
                  <ListboxOptions
                    transition
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                  >
                    {subjects?.map((subject: Subject) => (
                      <ListboxOption
                        key={subject.id}
                        value={subject.id}
                        className="group relative cursor-pointer py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                      >
                        <span className="block truncate font-normal group-data-selected:font-semibold">
                          {subject.name}
                        </span>

                        <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                          <CheckIcon aria-hidden="true" className="size-5" />
                        </span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                )}
              </div>
            </Listbox>
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
      ) : reportData?.summary && students.length > 0 ? (
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
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">👤 Student</th>
                    <th className="p-3 text-center">📚 Leksione</th>
                    <th className="p-3 text-center">⭐ Aktivizime (L)</th>
                    <th className="p-3 text-center">✅ Kaloi Leksionet</th>
                    <th className="p-3 text-center">🎓 Seminare</th>
                    <th className="p-3 text-center">⭐ Aktivizime (S)</th>
                    <th className="p-3 text-center">✅ Kaloi Seminaret</th>
                    <th className="p-3 text-center">🏆 Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3"><Skeleton times={1} rootCls="h-5 w-32" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-16 mx-auto" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-10 mx-auto" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-12 mx-auto" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-16 mx-auto" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-10 mx-auto" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-12 mx-auto" /></td>
                      <td className="p-3"><Skeleton times={1} rootCls="h-8 w-16 mx-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th
                      className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('firstName')}
                    >
                      👤 Student{getSortIcon('firstName')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('attendancePercentage')}
                    >
                      📚 Leksione{getSortIcon('attendancePercentage')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('participatedLectures')}
                    >
                      ⭐ Aktivizime (L){getSortIcon('participatedLectures')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('passedLectures')}
                    >
                      ✅ Kaloi Leksionet{getSortIcon('passedLectures')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('seminarPercentage')}
                    >
                      🎓 Seminare{getSortIcon('seminarPercentage')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('participatedSeminars')}
                    >
                      ⭐ Aktivizime (S){getSortIcon('participatedSeminars')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('passedSeminars')}
                    >
                      ✅ Kaloi Seminaret{getSortIcon('passedSeminars')}
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer hover:bg-gray-300 transition-colors select-none"
                      onClick={() => handleSort('overallPassed')}
                    >
                      🏆 Statusi{getSortIcon('overallPassed')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: StudentReport) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${student.attendancePercentage >= 50
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {student.attendancePercentage.toFixed(1)}%
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.attendedLectures}/{student.totalLectures}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                          {student.participatedLectures}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${student.passedLectures
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {student.passedLectures ? 'PO' : 'JO'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${student.seminarPercentage >= 50
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {student.seminarPercentage.toFixed(1)}%
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.attendedSeminars}/{student.totalSeminars}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                          {student.participatedSeminars}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${student.passedSeminars
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {student.passedSeminars ? 'PO' : 'JO'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${student.overallPassed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {student.overallPassed ? 'KALOI' : 'NK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
