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

// hooks
import { useAuth } from "@/hooks/useAuth";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

// components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";

async function fetchLectures(professorId: string, classId: string) {
  if (!professorId || !classId) return [];

  const res = await fetch(
    `/api/lectures?professorId=${professorId}&classId=${classId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch lectures:", await res.text());
    return [];
  }

  return res.json();
}

async function fetchClasses(professorId: string) {
  if (!professorId) return [];

  const res = await fetch(`/api/classes?professorId=${professorId}`);
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
    data: classes,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["classes", professorIdString],
    queryFn: () => fetchClasses(professorIdString),
    enabled: !!professorIdString,
  });

  const {
    data: lectures,
    isLoading: lecturesLoading,
    error: lecturesError,
  } = useQuery({
    queryKey: ["lectures", professorIdString, classId],
    queryFn: () => fetchLectures(professorIdString, classId),
    enabled: !!professorIdString,
  });
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (!classId) {
        showMessage("Nuk jeni i kyçur si profesor!", "error");
        return null;
      }

      console.log("Sending Data:", { date, classId, professorId });

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
        queryKey: ["lectures", professorIdString, classId],
      });
      showMessage("Leksioni u krijua me sukses!", "success");
    },
    onError: () => {
      showMessage("Dështoi krijimi i leksionit!", "error");
    },
  });
  //#endregion

  if (classesLoading || isAuthenticated === null) return <Loader />;
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (classesError) {
    showMessage("Error loading lectures.", "error");
    return null;
  }
  if (lecturesError) {
    showMessage("Error loading students.", "error");
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add Lecture Form */}
      <Card title="Shto Leksion">
        <div className="grid grid-cols-2 gap-4">
          {classesLoading ? (
            <Loader />
          ) : classes?.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
              <Alert title="Nuk ka klasa aktive. Shtoni një klasë në menuë Klasat." />
            </div>
          ) : (
            <Listbox value={classId} onChange={setClassId}>
              <div className="relative">
                <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                  <span className="col-start-1 row-start-1 truncate pr-6">
                    {classes.length === 0
                      ? "Nuk ka klasa aktive"
                      : classId === ""
                      ? "Zgjidh një klasë"
                      : classes.find(
                          (cls: { id: string; name: string }) =>
                            cls.id === classId
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
          )}

          {/* 📅 Date Input */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />

          {/* ✅ Submit Button - Disabled if no class is selected */}
          <button
            onClick={() => mutation.mutate()}
            className="cursor-pointer col-span-2 md:col-span-1 items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            disabled={!classId || !date || !professorId}
          >
            Shto Leksion
          </button>
        </div>
      </Card>

      {/* Lectures List */}
      <Card title="Lista e Leksioneve">
        {lecturesLoading ? (
          <Loader />
        ) : lectures?.length === 0 ? (
          <Alert
            title={
              classId
                ? "Nuk ka leksione të regjistruara për klasën e zgjedhur."
                : "Zgjidh një klasë."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {lectures.map(
              (lecture: {
                id: string;
                date: string;
                class?: { name?: string };
              }) => (
                <div
                  key={lecture.id}
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  <h2 className="text-xl font-semibold">
                    {new Date(lecture.date).toLocaleDateString("fr-FR")}
                  </h2>
                  <p className="text-sm text-gray-700 mt-2">
                    📚 Klasa: {lecture.class?.name || "Pa klasë"}
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
