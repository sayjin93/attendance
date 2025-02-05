"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

//hooks
import { useAuth } from "@/hooks/useAuth";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import AddStudentForm from "@/components/AddStudentForm";

async function fetchStudents(classId: string) {
  if (!classId) return [];

  const res = await fetch(`/api/students?classId=${classId}`);
  return res.json();
}

async function fetchClasses(professorId: string) {
  if (!professorId) return [];

  const res = await fetch(`/api/classes?professorId=${professorId}`);
  return res.json();
}

export default function StudentsPage() {
  //#region constants
  const router = useRouter();
  const { showMessage } = useNotify();
  const { isAuthenticated, professorId } = useAuth();

  const professorIdString = professorId ? professorId.toString() : "";
  //#endregion

  //#region states
  const [classId, setClassId] = useState("");
  //#endregion

  //#region useQuery
  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["classes", professorIdString],
    queryFn: () => fetchClasses(professorIdString),
    enabled: !!professorIdString,
  });

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["students", classId, professorIdString],
    queryFn: () => fetchStudents(classId),
    enabled: !!classId,
  });
  //#endregion

  if (classesLoading || isAuthenticated === null) return <Loader />;
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (classesError) {
    showMessage("Error loading classes.", "error");
    return null;
  }
  if (studentsError) {
    showMessage("Error loading students.", "error");
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Class Selector */}
      <Listbox value={classId} onChange={setClassId}>
        <div className="relative mt-2">
          <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
            <span className="col-start-1 row-start-1 truncate pr-6">
              {classes.length === 0
                ? "Nuk ka klasa aktive"
                : classId === ""
                ? "Zgjidh një klasë"
                : classes.find(
                    (cls: { id: string; name: string }) => cls.id === classId
                  ).name}
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
            {classes?.map((cls: { id: string; name: string }) => (
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

      {/* Add Class Form */}
      {classId ? (
        <Card title="Shto student">
          <AddStudentForm classId={classId} professorId={professorIdString} />
        </Card>
      ) : (
        <Alert title="Zgjidh një klasë për të shtuar studentë" />
      )}

      {/* Classes List */}
      <Card title="Lista e studentëve">
        {studentsLoading ? (
          <Loader />
        ) : students?.length === 0 ? (
          <Alert title="Nuk ka studentë në këtë klasë. Shtoni një student më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {students?.map(
              (studentItem: {
                id: string;
                name: string;
                email: string;
                class: { name: string };
              }) => (
                <div
                  key={studentItem.id}
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  <h2 className="text-xl font-semibold">{studentItem.name}</h2>

                  <p className="text-gray-500">{studentItem.email}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    📚 Klasa: {studentItem.class?.name || "Pa klasë"}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
