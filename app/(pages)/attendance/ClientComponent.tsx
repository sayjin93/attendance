"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/16/solid";

//types
import { AttendanceRecord, AttendanceStatus, Class, Lecture } from "@/types";

// hooks
import { formatDate } from "@/hooks/functions";
import {
  fetchAttendance,
  fetchClassesIncludesLecturesAndStudents,
  updateAttendanceBatch,
} from "@/hooks/fetchFunctions";

// contexts
import { useNotify } from "@/contexts/NotifyContext";

// components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";

interface ClassWithLectures extends Class {
  lectures: Lecture[];
}

export default function AttendancePageClient({
  professorId,
}: {
  professorId: string;
}) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  //#endregion

  //#region states
  const [classId, setClassId] = useState<number | null>(null);
  const [lectureId, setLectureId] = useState<number | null>(null);
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  //#endregion

  //#region useQuery
  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery<ClassWithLectures[]>({
    queryKey: ["classes", professorId],
    queryFn: async () => {
      const result = await fetchClassesIncludesLecturesAndStudents(professorId);
      console.log("Classes data for attendance:", result);
      return result;
    },
    enabled: !!professorId,
  });

  const {
    data: attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", classId, lectureId],
    queryFn: () => fetchAttendance(professorId, classId?.toString() || "", lectureId?.toString() || ""),
    enabled: !!professorId && !!classId && !!lectureId,
  });
  //#endregion

  //#region useEffect
  useEffect(() => {
    if (attendance) {
      setStudents(
        attendance.map((student) => ({
          ...student,
          status: student.status || AttendanceStatus.PRESENT, // Default status
        }))
      );
    }
  }, [attendance]);

  // Reset lecture when class changes
  useEffect(() => {
    setLectureId(null);
    setStudents([]);
  }, [classId]);

  // Initialize from URL parameters
  useEffect(() => {
    const urlClassId = searchParams.get("classId");
    const urlLectureId = searchParams.get("lectureId");
    
    if (urlClassId && !classId) {
      setClassId(parseInt(urlClassId, 10));
    }
    if (urlLectureId && !lectureId) {
      setLectureId(parseInt(urlLectureId, 10));
    }
  }, [searchParams, classId, lectureId]);

  // Ensure selections are valid when classes load
  useEffect(() => {
    if (classes && classes.length > 0) {
      const urlClassId = searchParams.get("classId");
      const urlLectureId = searchParams.get("lectureId");
      
      if (urlClassId) {
        const parsedClassId = parseInt(urlClassId, 10);
        const classExists = classes.find(c => c.id === parsedClassId);
        if (classExists && classId !== parsedClassId) {
          setClassId(parsedClassId);
          
          if (urlLectureId) {
            const parsedLectureId = parseInt(urlLectureId, 10);
            const lectureExists = classExists.lectures?.find(l => l.id === parsedLectureId);
            if (lectureExists && lectureId !== parsedLectureId) {
              setLectureId(parsedLectureId);
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, searchParams]);
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async (studentsData: AttendanceRecord[]) => {
      // Use batch update - single API call for all students
      const attendanceUpdates = studentsData.map((student) => ({
        studentId: student.id,
        lectureId: lectureId?.toString() || "",
        status: student.status as "PRESENT" | "ABSENT" | "PARTICIPATED",
      }));
      
      return await updateAttendanceBatch(attendanceUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", classId, lectureId],
      });
      showMessage("Prezenca u regjistrua me sukses!", "success");
    },
    onError: () => {
      showMessage("Gabim gjatë regjistrimit të prezencës!", "error");
    },
  });
  //#endregion

  if (classesLoading) return <Loader />;
  if (classesError) {
    return <Alert type="error" title="Gabim në ngarkimin e klasave" />;
  }

  const selectedClass = classes?.find((cls: ClassWithLectures) => cls.id === classId);
  const selectedLecture = selectedClass?.lectures?.find(
    (lecture: Lecture) => lecture.id === lectureId
  );

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, status } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lista e Prezencës</h1>
        <p className="text-gray-600 mt-1">
          Regjistroni prezencën e studentëve për leksionet tuaja
        </p>
      </div>

      {/* Class and Lecture Selectors */}
      <Card title="Zgjidhni Klasën dhe Leksionin">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selector */}
          <div>
            <Listbox value={classId} onChange={setClassId}>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Klasa
              </Label>
              <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <span className="block truncate">
                    {!classId
                      ? "Zgjidhni një klasë"
                      : selectedClass?.name || "Klasa e zgjedhur"}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {classes?.map((cls) => (
                    <ListboxOption
                      key={cls.id}
                      value={cls.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {cls.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {/* Lecture Selector */}
          <div>
            <Listbox
              disabled={!classId}
              value={lectureId}
              onChange={setLectureId}
            >
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Leksioni
              </Label>
              <div className="relative">
                <ListboxButton className={`relative w-full cursor-pointer rounded-md py-2 pl-3 pr-10 text-left shadow-sm border sm:text-sm ${
                  classId
                    ? "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-gray-100 border-gray-200 cursor-not-allowed"
                }`}>
                  <span className={`block truncate ${!classId ? "text-gray-400" : ""}`}>
                    {!classId
                      ? "Zgjidhni një klasë fillimisht"
                      : !selectedClass?.lectures?.length
                      ? "Nuk ka leksione për këtë klasë"
                      : !lectureId
                      ? "Zgjidhni një leksion"
                      : selectedLecture?.date ? formatDate(selectedLecture.date.toString()) : "Zgjedhni një leksion"}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className={`h-5 w-5 ${!classId ? "text-gray-300" : "text-gray-400"}`} aria-hidden="true" />
                  </span>
                </ListboxButton>

                {classId && selectedClass?.lectures && selectedClass.lectures.length > 0 && (
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {selectedClass.lectures.map((lecture) => (
                      <ListboxOption
                        key={lecture.id}
                        value={lecture.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                              {formatDate(lecture.date.toString())}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                )}
              </div>
            </Listbox>
          </div>
        </div>
      </Card>

      {/* Attendance List */}
      {!classId || !lectureId ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Zgjidhni Klasën dhe Leksionin
            </h3>
            <p className="text-gray-500">
              Për të regjistruar prezencën, fillimisht zgjidhni klasën dhe leksionin përkatës.
            </p>
          </div>
        </Card>
      ) : attendanceError ? (
        <Alert type="error" title="Gabim në ngarkimin e listës së studentëve" />
      ) : attendanceLoading ? (
        <Card>
          <Loader />
        </Card>
      ) : (
        <Card title={`Prezenca - ${selectedClass?.name} (${selectedLecture?.date ? formatDate(selectedLecture.date.toString()) : ""})`}>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nuk ka studentë të regjistruar në këtë klasë.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.status === AttendanceStatus.PRESENT).length}
                  </div>
                  <div className="text-sm text-gray-600">Prezente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {students.filter(s => s.status === AttendanceStatus.ABSENT).length}
                  </div>
                  <div className="text-sm text-gray-600">Mungesë</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {students.filter(s => s.status === AttendanceStatus.PARTICIPATED).length}
                  </div>
                  <div className="text-sm text-gray-600">Aktivizuar</div>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statusi i Prezencës
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <select
                            value={student.status}
                            onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceStatus)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          >
                            <option value={AttendanceStatus.PRESENT}>✅ Prezente</option>
                            <option value={AttendanceStatus.ABSENT}>❌ Mungesë</option>
                            <option value={AttendanceStatus.PARTICIPATED}>🙋 Aktivizuar</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => mutation.mutate(students)}
                  disabled={mutation.isPending}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Po ruhet..." : "Ruaj Prezencën"}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
