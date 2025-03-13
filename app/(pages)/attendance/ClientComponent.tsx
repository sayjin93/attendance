// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

//types
import { AttendanceRecord, Class, Lecture } from "@/types";

// hooks
import { formatDate } from "@/hooks/functions";
import {
  fetchAttendance,
  fetchClassesIncludesLecturesAndStudents,
  updateAttendance,
} from "@/hooks/fetchFunctions";

// contexts
import { useNotify } from "@/contexts/NotifyContext";

// components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";

export default function AttendancePagClient({
  professorId,
}: {
  professorId: string;
}) {
  return <p>attendance</p>;

  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [classId, setClassId] = useState(null);
  const [lectureId, setLectureId] = useState(null);
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  //#endregion

  //#region useQuery
  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["classes", professorId],
    queryFn: () => fetchClassesIncludesLecturesAndStudents(professorId),
    enabled: !!professorId,
  });

  const {
    data: attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useQuery({
    queryKey: ["attendance", classId, lectureId],
    queryFn: () => fetchAttendance(professorId, classId, lectureId),
    enabled: !!professorId && !!classId && !!lectureId,
  });
  //#endregion

  //#region useEffect
  useEffect(() => {
    if (attendance) {
      setStudents(
        attendance.map((student) => ({
          ...student,
          status: student.status || "PRESENT", // Default status
        }))
      );
    }
  }, [attendance]);
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: (students: AttendanceRecord[]) => {
      return Promise.all(
        students.map((student) =>
          updateAttendance({
            studentId: student.id, // Changed from student.studentId to student.id
            lectureId,
            status: student.status,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", classId, lectureId],
      });
      showMessage("Prezenca u shtua me sukses!", "success");
    },
    onError: () => {
      showMessage("Gabim gjatë regjistrimit të prezencës!", "error");
    },
  });
  //#endregion

  if (classesLoading) return <Loader />;
  if (classesError) {
    showMessage("classesError loading attendances.", "error");
    return null;
  }

  const selectedClass = classes?.find((cls: Class) => cls.id === classId);
  const selectedLecture = selectedClass?.lectures.find(
    (lecture: Lecture) => lecture.id === lectureId
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class Selector */}
          <div>
            <Listbox value={classId} onChange={setClassId}>
              <Label className="block text-sm/6 font-medium text-gray-700">
                Klasa
              </Label>
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
          </div>

          {/* Lecture Selector */}
          <div>
            <Listbox
              disabled={!classId}
              value={lectureId}
              onChange={setLectureId}
            >
              <Label className="block text-sm/6 font-medium text-gray-700">
                Leksioni
              </Label>
              <div className="relative mt-2">
                <ListboxButton
                  className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 sm:text-sm/6 ${
                    classId
                      ? "cursor-pointer bg-white text-gray-900 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                      : "cursor-not-allowed bg-gray-200 text-gray-400 outline-gray-200"
                  }`}
                >
                  <span className="col-start-1 row-start-1 truncate pr-6">
                    {selectedClass?.lectures.length === 0
                      ? "Nuk ka leksione aktive"
                      : !classId
                      ? "Zgjidh një klasë fillimisht"
                      : !lectureId
                      ? "Zgjidh leksionin"
                      : formatDate(selectedLecture?.date)}
                  </span>
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className={`col-start-1 row-start-1 size-5 self-center justify-self-end sm:size-4 ${
                      classId ? "text-gray-500" : "text-gray-300"
                    }`}
                  />
                </ListboxButton>

                <ListboxOptions
                  transition
                  className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                >
                  {selectedClass?.lectures.map((lecture: Lecture) => (
                    <ListboxOption
                      key={lecture.id}
                      value={lecture.id}
                      className="group relative cursor-pointer py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                    >
                      <span className="block truncate font-normal group-data-selected:font-semibold">
                        {formatDate(lecture.date)}
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
        </div>
      </Card>

      <div className="flex-1">
        {!classId ? (
          <Alert title="Zgjidhni një klasë" />
        ) : !lectureId ? (
          <Alert title="Zgjidhni një leksion" />
        ) : attendanceError ? (
          <Alert type="error" title="Problem me marrjen e listës." />
        ) : attendanceLoading ? (
          <Loader />
        ) : (
          <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 uppercase"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 uppercase"
                  >
                    Prezencë
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="even:bg-gray-50">
                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                      {student.firstName + " " + student.lastName}
                    </td>
                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 text-center">
                      <select
                        value={student.status}
                        onChange={(e) => {
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? {
                                    ...s,
                                    status: e.target.value as
                                      | "PRESENT"
                                      | "ABSENT"
                                      | "PARTICIPATED",
                                  }
                                : s
                            )
                          );
                        }}
                        className="col-start-1 row-start-1 cursor-pointer appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      >
                        <option value="PRESENT">✅ Prezente</option>
                        <option value="ABSENT">❌ Mungesë</option>
                        <option value="PARTICIPATED">🙋 Aktivizuar</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={() => mutation.mutate(students)}
        className="w-full cursor-pointer disabled:cursor-not-allowed items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        disabled={!classId || !lectureId || mutation.isPending}
      >
        {mutation.isPending ? "Po regjistrohet..." : "Regjistro Listëprezencën"}
      </button>
    </div>
  );
}
