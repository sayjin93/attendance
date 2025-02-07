"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

//types
import { Class, Lecture } from "@/types";

//hooks
import { useAuth } from "@/hooks/useAuth";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";

async function fetchClasses(professorId: string) {
  if (!professorId) return [];

  const res = await fetch(`/api/classes?professorId=${professorId}&includeLectures=true`);
  return res.json();
}

export default function LecturesPage() {
  //#region constants
  const router = useRouter();
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();

  const { isAuthenticated, professorId } = useAuth();

  const professorIdString = professorId ? professorId.toString() : "";

  const newDate = new Date();
  const today = newDate.toISOString().split("T")[0];
  //#endregion

  //#region states
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  //#endregion

  //#region useQuery
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classes", professorIdString],
    queryFn: () => fetchClasses(professorIdString),
    enabled: !!professorIdString,
  });

  const selectedClass = data?.find((cls: Class) => cls.id === classId);
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (!classId) {
        showMessage("Nuk jeni i kyçur si profesor!", "error");
        return null;
      }
      const res = await fetch("/api/lectures", {
        method: "POST",
        body: JSON.stringify({ date, classId, professorId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Dështoi krijimi i leksionit");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes", professorIdString],
      });
      showMessage("Leksioni u krijua me sukses!", "success");
    },
    onError: () => {
      showMessage("Dështoi krijimi i leksionit!", "error");
    },
  });
  //#endregion

  if (isLoading || isAuthenticated === null) return <Loader />;
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (error) {
    showMessage("Error loading lectures.", "error");
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Class Selector */}
      <Listbox value={classId} onChange={setClassId}>
        <div className="relative mt-2">
          <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
            <span className="col-start-1 row-start-1 truncate pr-6">
              {data?.length === 0
                ? "Nuk ka klasa aktive"
                : !classId
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
            {data?.map((cls: Class) => (
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

      {/* Add Lecture Form */}
      <Card title="Shto Leksion">
        {data?.length === 0 ? (
          <Alert title="Nuk ka klasa aktive. Shtoni një klasë në menuë Klasat." />
        ) : !classId ? (
          <Alert title="Zgjidh një klasë për të shtuar leksion" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
            <button
              onClick={() => mutation.mutate()}
              className="cursor-pointer items-center rounded-md bg-indigo-600 disabled:bg-gray-300 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              disabled={!date || !classId}
            >
              Shto Leksion
            </button>
          </div>
        )}
      </Card>

      {/* Lectures List */}
      <Card title="Lista e Leksioneve">
        {!classId ? (
          <Alert title="Zgjidh një klasë për të parë leksionet" />
        ) : selectedClass.lectures.length === 0 ? (
          <Alert title="Nuk ka leksione aktive. Shtoni një leksion më lartë." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {selectedClass.lectures.map(
              (lecture: Lecture) => (
                <div
                  key={lecture.id}
                  className="flex justify-center align-middle relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  <div className="p-4 text-center">
                    <h2 className="text-xl font-semibold">
                      {new Date(lecture.date).toLocaleDateString("fr-FR")}
                    </h2>
                    <p className="text-sm text-gray-700 mt-2">
                      📚 Klasa: {lecture.class?.name || "Pa klasë"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
