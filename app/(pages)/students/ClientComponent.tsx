"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

//types
import { Class, Program, Student } from "@/types";

//hooks
import { fetchClasses, fetchStudents, deleteStudent } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import AddStudentForm from "@/components/AddStudentForm";
import EditStudentForm from "@/components/EditStudentForm";
import Modal from "@/components/Modal";

export default function StudentsPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [classId, setClassId] = useState<number>(0);
  const [programId, setProgramId] = useState<number>(0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  //#endregion

  //#region useQuery
  const {
    data: classes = [],
    isLoading: classesLoading,
    error: classesError,
  } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
    enabled: isAdmin === "true",
  });

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["students", classId], // Re-fetch when classId changes
    queryFn: () => fetchStudents(classId),
    enabled: classId > 0, // Prevent fetch when classId is null
  });
  //#endregion

  //#region mutations
  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: (data) => {
      if (data.error) {
        showMessage(data.error, "error");
      } else {
        showMessage("Studenti u fshi me sukses!", "success");
        queryClient.invalidateQueries({ queryKey: ["students", classId] });
        setDeletingStudent(null);
      }
    },
    onError: () => {
      showMessage("Dështoi fshirja e studentit!", "error");
    },
  });
  //#endregion

  //#region functions
  const handleDeleteStudent = () => {
    if (deletingStudent) {
      deleteStudentMutation.mutate(deletingStudent.id);
    }
  };
  //#endregion

  if (classesLoading) return <Loader />;
  if (classesError) {
    showMessage("Error loading data.", "error");
    return null;
  }

  // Extract programs from classes data and sort alphabetically
  const programs = Array.from(
    new Map(
      classes
        .filter(c => c.program) // Filter out undefined
        .map(c => [c.program!.id, c.program!]) // Non-null assertion
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));
  
  const selectedProgramm = programs?.find(
    (prog: Program) => prog.id === programId
  );
  const filteredClasses = classes?.filter(
    (cls: Class) => cls.programId === programId
  ).sort((a, b) => a.name.localeCompare(b.name));
  const selectedClass = filteredClasses?.find(
    (cls: Class) => cls.id === classId
  );

  return (
    <div className="flex flex-col gap-4">
      <Card title="Filtrimi">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Program Selector */}
          <Listbox
            value={programId}
            onChange={(value) => {
              setProgramId(value);
              setClassId(0);
            }}
          >
            <div className="relative mt-2">
              <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                <span className="col-start-1 row-start-1 truncate pr-6">
                  {programs?.length === 0
                    ? "Nuk ka programe aktive"
                    : programId === 0
                    ? "Zgjidh një program"
                    : selectedProgramm?.name}
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
                {programs?.map((prog: Program) => (
                  <ListboxOption
                    key={prog.id}
                    value={prog.id}
                    className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                  >
                    <span className="block truncate font-normal group-data-selected:font-semibold">
                      {prog.name}
                    </span>

                    <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="size-5" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Class Selector */}
          <Listbox
            disabled={programId === 0}
            value={classId}
            onChange={setClassId}
          >
            <div className="relative mt-2">
              <ListboxButton
                className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left sm:text-sm/6 
  ${
    programId === 0
      ? "cursor-not-allowed bg-gray-200 text-gray-500"
      : "cursor-default bg-white text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
  }`}
              >
                <span className="col-start-1 row-start-1 truncate pr-6">
                  {programId === 0
                    ? "Zgjidh një program fillimisht"
                    : classes?.length === 0
                    ? "Nuk ka klasa aktive"
                    : classId === 0
                    ? "Zgjidh një klasë"
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
                {filteredClasses?.map((cls: Class) => (
                  <ListboxOption
                    key={cls.id}
                    value={cls.id}
                    className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
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
      </Card>

      {/* Add Student Form */}
      <Card title="Shto student">
        {!classId ? (
          <Alert title="Zgjidh një klasë për të shtuar studentë" />
        ) : (
          <AddStudentForm classId={classId} />
        )}
      </Card>

      {/* Students List */}
      <Card title="Lista e studentëve">
        {studentsLoading ? (
          <Loader />
        ) : studentsError ? (
          <Alert title="Zgjidh një klasë për të parë studentët" />
        ) : !classId ? (
          <Alert title="Zgjidh një klasë për të parë studentët" />
        ) : studentsData?.length === 0 ? (
          <Alert title="Nuk ka studentë në këtë klasë. Shtoni një student më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {studentsData?.map((student: Student) => (
              <div
                key={student.id}
                className="relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
              >
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold">
                    {student.firstName + " " + student.lastName}
                  </h2>
                  
                  {isAdmin === "true" && (
                    <div className="flex justify-center gap-2 mt-3">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Modifiko studentin"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingStudent(student)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Fshi studentin"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editingStudent !== null}
        onClose={() => setEditingStudent(null)}
        title="Modifiko studentin"
        maxWidth="max-w-lg"
      >
        {editingStudent && (
          <EditStudentForm
            student={editingStudent}
            classes={classes}
            onClose={() => setEditingStudent(null)}
          />
        )}
      </Modal>

      {/* Delete Student Modal */}
      <Modal
        isOpen={deletingStudent !== null}
        onClose={() => setDeletingStudent(null)}
        title="Fshi studentin"
        maxWidth="max-w-md"
      >
        {deletingStudent && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A jeni të sigurt që doni të fshini studentin <strong>{deletingStudent.firstName} {deletingStudent.lastName}</strong>?
            </p>
            <p className="text-sm text-red-600">
              Ky veprim nuk mund të kthehet prapa. Studenti do të fshihet përgjithmonë.
            </p>
            
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={deleteStudentMutation.isPending}
              >
                Anulo
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={deleteStudentMutation.isPending}
              >
                {deleteStudentMutation.isPending ? <Loader /> : "Fshi studentin"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
