"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

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
      const sortedStudents = attendance
        .map((student) => ({
          ...student,
          status: student.status || AttendanceStatus.PRESENT, // Default status
        }))
        .sort((a, b) => {
          const surnameComparison = a.lastName.localeCompare(b.lastName);
          return surnameComparison === 0 ? a.firstName.localeCompare(b.firstName) : surnameComparison;
        });
      
      setStudents(sortedStudents);
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

  // Group classes by program
  const bachelorClasses = classes?.filter(cls => cls.program?.name === "Bachelor") || [];
  const masterClasses = classes?.filter(cls => cls.program?.name === "Master") || [];

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klasa *
            </label>
            <select
              value={classId || ""}
              onChange={(e) => setClassId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Zgjidhni një klasë...</option>
              
              {bachelorClasses.length > 0 && (
                <optgroup label="Bachelor">
                  {bachelorClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {masterClasses.length > 0 && (
                <optgroup label="Master">
                  {masterClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Lecture Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leksioni *
            </label>
            <select
              disabled={!classId}
              value={lectureId || ""}
              onChange={(e) => setLectureId(e.target.value ? parseInt(e.target.value) : null)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                classId
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-100 cursor-not-allowed"
              }`}
              required
            >
              <option value="">
                {!classId
                  ? "Zgjidhni një klasë fillimisht"
                  : !selectedClass?.lectures?.length
                  ? "Nuk ka leksione për këtë klasë"
                  : "Zgjidhni një leksion..."}
              </option>
              {classId && selectedClass?.lectures && selectedClass.lectures.length > 0 && 
                selectedClass.lectures.map((lecture) => (
                  <option key={lecture.id} value={lecture.id}>
                    {formatDate(lecture.date.toString())}
                  </option>
                ))
              }
            </select>
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
              {/* Statistics - Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Prezente */}
                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200 shadow-sm flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                  <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-center sm:gap-2 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-200 rounded-full flex items-center justify-center mr-2 sm:mr-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start sm:items-center">
                      <div className="text-2xl sm:text-3xl font-bold text-green-700">{students.filter(s => s.status === AttendanceStatus.PRESENT).length}</div>
                      <div className="text-xs sm:text-sm font-medium text-green-600 mt-1">Prezente</div>
                    </div>
                  </div>
                </div>
                {/* Mungesë */}
                <div className="bg-linear-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl border border-red-200 shadow-sm flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                  <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-center sm:gap-2 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-200 rounded-full flex items-center justify-center mr-2 sm:mr-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start sm:items-center">
                      <div className="text-2xl sm:text-3xl font-bold text-red-700">{students.filter(s => s.status === AttendanceStatus.ABSENT).length}</div>
                      <div className="text-xs sm:text-sm font-medium text-red-600 mt-1">Mungesë</div>
                    </div>
                  </div>
                </div>
                {/* Aktivizuar */}
                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200 shadow-sm flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                  <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-center sm:gap-2 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 rounded-full flex items-center justify-center mr-2 sm:mr-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start sm:items-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-700">{students.filter(s => s.status === AttendanceStatus.PARTICIPATED).length}</div>
                      <div className="text-xs sm:text-sm font-medium text-blue-600 mt-1">Aktivizuar</div>
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
                            <div className="flex items-center gap-2">
                              <span>{student.firstName} {student.lastName}</span>
                              {student.memo && (
                                <div className="group relative inline-block">
                                  <svg 
                                    className="w-4 h-4 text-indigo-500 cursor-help" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
                                    {student.memo}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                </div>
                              )}
                            </div>
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
