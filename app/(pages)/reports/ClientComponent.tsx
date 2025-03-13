// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

//chart.js
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

//jspdf
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

//types
import { Class, StudentReport } from "@/types";

// contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import { fetchClassesByProfessor, fetchReports } from "@/hooks/fetchFunctions";

export default function ReportsPageClient({
  professorId,
}: {
  professorId: string;
}) {
  return <p>reports</p>;
  //#region constants
  const { showMessage } = useNotify();
  //#endregion

  //#region states
  const [classId, setClassId] = useState("");
  //#endregion

  //#region useQuery
  const {
    data: classes,
    isLoading: loadingClasses,
    error: errorClasses,
  } = useQuery({
    queryKey: ["classes", professorId],
    queryFn: () => fetchClassesByProfessor(professorId),
    enabled: !!professorId,
  });

  const {
    data: students = [],
    isLoading: loadingStudents,
    error: errorStudents,
  } = useQuery<StudentReport[]>({
    queryKey: ["reports", classId, professorId],
    queryFn: () => fetchReports(classId, professorId),
    enabled: !!classId && !!professorId,
  });
  //#endregion

  //#region functions
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Raporti i Studentëve - ${selectedClass}`, 20, 10);

    autoTable(doc, {
      head: [["Studenti", "Prezencë", "Mungesë", "Aktivizim"]],
      body: students.map((s: StudentReport) => [
        s.firstName + " " + s.lastName,
        s.presence,
        s.absence,
        s.participation,
      ]),
    });

    doc.save(`Raporti_${selectedClass}.pdf`);
  };
  //#endregion

  if (loadingClasses) return <Loader />;
  if (errorClasses) {
    showMessage("Error loading classes.", "error");
    return null;
  }

  const selectedClass = classes?.find((cls: Class) => cls.id === classId);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Class Selector */}
      <Listbox value={classId} onChange={setClassId}>
        <div className="relative mt-2">
          <ListboxButton className="grid w-full cursor-pointer grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
            <span className="col-start-1 row-start-1 truncate pr-6">
              {classes?.length === 0
                ? "Nuk ka klasa aktive"
                : !classId
                ? "Zgjidh klasën"
                : selectedClass?.name}
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
            {classes?.map((cls: Class) => (
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
        </div>
      </Listbox>

      {/* Student Report Table */}
      <Card title="Tabela e studentëve">
        {!classId ? (
          <Alert title="Zgjidh një klasë për të parë raportet" />
        ) : loadingStudents ? (
          <Loader />
        ) : errorStudents ? (
          <Alert type="error" title="Ka ndodhur një gabim me raportet." />
        ) : students.length === 0 ? (
          <Alert title="Nuk ka të listëprezenca të ruajtura për këtë klasë." />
        ) : (
          <div className="flex flex-1 flex-col gap-6">
            <table className="w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">👤 Student</th>
                  <th className="p-3 text-center">✅ Prezencë</th>
                  <th className="p-3 text-center">❌ Mungesë</th>
                  <th className="p-3 text-center">🙋 Aktivizim</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: StudentReport) => (
                  <tr key={student.id} className="border-b">
                    <td className="p-3">
                      {student.firstName + " " + student.lastName}
                    </td>
                    <td className="p-3 text-center">{student.presence}</td>
                    <td className="p-3 text-center">{student.absence}</td>
                    <td className="p-3 text-center">{student.participation}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Download Report Button */}
          </div>
        )}
      </Card>

      {/* Attendance Analysis Chart */}
      {classId && students && (
        <Card title="Analiza e prezencës">
          <div className="flex flex-col gap-4" style={{ height: "500px" }}>
            <div className="flex justify-end gap-4">
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
            <div className="flex flex-1">
              <Bar
                data={{
                  labels: students.map((s) => s.firstName + " " + s.lastName),
                  datasets: [
                    {
                      label: "Prezencë",
                      data: students.map((s) => s.presence),
                      backgroundColor: "#81c784",
                    },
                    {
                      label: "Mungesë",
                      data: students.map((s) => s.absence),
                      backgroundColor: "#e57373",
                    },
                    {
                      label: "Aktivizim ",
                      data: students.map((s) => s.participation),
                      backgroundColor: "#ffcc80",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      type: "category",
                      title: { display: true, text: "Studentët" },
                    },
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Numri" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
