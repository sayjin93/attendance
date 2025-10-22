"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import {
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
      {/* Class and Lecture Selectors */}
      <Card title="Zgjidhni Klasën dhe Leksionin">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selector */}
          <div>
            <Listbox value={classId} onChange={setClassId}>
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
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
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
              <div className="relative">
                <ListboxButton className={`relative w-full cursor-pointer rounded-md py-2 pl-3 pr-10 text-left shadow-sm border sm:text-sm ${classId
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
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-700">
                        {students.filter(s => s.status === AttendanceStatus.PRESENT).length}
                      </div>
                      <div className="text-sm font-medium text-green-600 mt-1">Prezente</div>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-red-700">
                        {students.filter(s => s.status === AttendanceStatus.ABSENT).length}
                      </div>
                      <div className="text-sm font-medium text-red-600 mt-1">Mungesë</div>
                    </div>
                    <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-700">
                        {students.filter(s => s.status === AttendanceStatus.PARTICIPATED).length}
                      </div>
                      <div className="text-sm font-medium text-blue-600 mt-1">Aktivizuar</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Grid/Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-lg font-semibold text-white">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Student ID: #{student.id}
                          </div>
                        </div>
                      </div>
                      {student.status === AttendanceStatus.PARTICIPATED && (
                        <div className="shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ VIP
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Statusi i Prezencës
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${student.status === AttendanceStatus.PRESENT
                              ? 'border-green-500 bg-green-50 shadow-sm'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                        >
                          <svg className={`w-6 h-6 mb-1 ${student.status === AttendanceStatus.PRESENT ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={`text-xs font-medium ${student.status === AttendanceStatus.PRESENT ? 'text-green-700' : 'text-gray-600'}`}>
                            Prezente
                          </span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${student.status === AttendanceStatus.ABSENT
                              ? 'border-red-500 bg-red-50 shadow-sm'
                              : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                            }`}
                        >
                          <svg className={`w-6 h-6 mb-1 ${student.status === AttendanceStatus.ABSENT ? 'text-red-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={`text-xs font-medium ${student.status === AttendanceStatus.ABSENT ? 'text-red-700' : 'text-gray-600'}`}>
                            Mungesë
                          </span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.PARTICIPATED)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${student.status === AttendanceStatus.PARTICIPATED
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                        >
                          <svg className={`w-6 h-6 mb-1 ${student.status === AttendanceStatus.PARTICIPATED ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span className={`text-xs font-medium ${student.status === AttendanceStatus.PARTICIPATED ? 'text-blue-700' : 'text-gray-600'}`}>
                            Aktiv
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6">
                <button
                  onClick={() => mutation.mutate(students)}
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-x-2 px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {mutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Po ruhet...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Ruaj Prezencën
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
