"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
import { Class, Lecture } from "@/types";

// hooks
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/hooks/functions";

// contexts
import { useNotify } from "@/contexts/NotifyContext";

// components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";

async function fetchClasses(professorId: string) {
    if (!professorId) return [];

    const res = await fetch(`/api/classes?professorId=${professorId}&includeLectures=true&includeStudents=true`);
    return res.json();
}

// async function fetchAttendance(professorId: string, classId: string) {
//     if (!professorId || !classId) return [];

//     const res = await fetch(`/api/classes?professorId=${professorId}&includeLectures=true&includeStudents=true`);

//     if (!res.ok) {
//         console.error("❌ Error fetching attendance:", await res.text());
//         return [];
//     }

//     return res.json();
// }

export default function AttendancePage() {
    //#region constants
    const router = useRouter();
    const { showMessage } = useNotify();

    const { isAuthenticated, professorId } = useAuth();

    const professorIdString = professorId ? professorId.toString() : "";
    //#endregion

    //#region states
    const [classId, setClassId] = useState("");
    const [lectureId, setLectureId] = useState("");
    //#endregion

    //#region useQuery
    const { data, isLoading, error } = useQuery({
        queryKey: ["classes", professorId],
        queryFn: () => fetchClasses(professorIdString),
        enabled: !!professorId,
    });

    const selectedClass = data?.find((cls: Class) => cls.id === classId);
    const selectedLecture = selectedClass?.lectures.find((lecture: Lecture) => lecture.id === lectureId);
    //#endregion

    if (isLoading || isAuthenticated === null) return <Loader />;
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    if (error) {
        showMessage("Error loading attendances.", "error");
        return null;
    }

    return (
        <div className="flex flex-col gap-4 h-full">

            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Class Selector */}
                    <div>
                        <Listbox value={classId} onChange={setClassId}>
                            <Label className="block text-sm/6 font-medium text-gray-700">Klasa</Label>
                            <div className="relative mt-2">
                                <ListboxButton className="grid w-full cursor-pointer grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                    <span className="col-start-1 row-start-1 truncate pr-6">
                                        {data?.length === 0
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
                                    {data?.map((cls: { id: string; name: string }) => (
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
                        <Listbox disabled={!classId} value={lectureId} onChange={setLectureId}>
                            <Label className="block text-sm/6 font-medium text-gray-700">Leksioni</Label>
                            <div className="relative mt-2">
                                <ListboxButton
                                    className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 sm:text-sm/6 ${classId ? "cursor-pointer bg-white text-gray-900 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600" : "cursor-not-allowed bg-gray-200 text-gray-400 outline-gray-200"}`}
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
                                        className={`col-start-1 row-start-1 size-5 self-center justify-self-end sm:size-4 ${classId ? "text-gray-500" : "text-gray-300"}`}
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
                ) : <Alert type="warning" title="Komponentja në zhvillim!" />}
            </div>

            <button
                // onClick={handleSubmit}
                className="w-full cursor-pointer disabled:cursor-not-allowed items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                disabled={!classId || !lectureId}
            >
                Regjistro Listëprezencën
            </button>
        </div>
    );
}
