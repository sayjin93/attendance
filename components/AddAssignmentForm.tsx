"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";
import { Professor, Subject, TeachingType } from "@/types";

export default function AddAssignmentForm({
  isAdmin,
  professors,
  subjects,
  teachingTypes,
}: {
  isAdmin: string;
  professors: Professor[];
  subjects: Subject[];
  teachingTypes: TeachingType[];
}) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [professorId, setProfessorId] = useState<number>(0);
  const [subjectId, setSubjectId] = useState<number>(0);
  const [typeId, setTypeId] = useState<number>(0);
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (isAdmin === "false") {
        showMessage("Nuk jeni i kyçur si admin!", "error");
        return null;
      }

      const res = await fetch("/api/assignments", {
        method: "POST",
        body: JSON.stringify({ professorId, subjectId, typeId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      showMessage("Caktimi u krye me sukses!", "success");
      setProfessorId(0);
      setSubjectId(0);
      setTypeId(0);
    },
    onError: (error) => {
      showMessage(error.message, "error");
    },
  });
  //#endregion

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {/* Dropdown për zgjedhjen e profesorëve */}
      <select
        value={professorId}
        onChange={(e) => setProfessorId(Number(e.target.value))}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      >
        <option value={0} disabled>
          Zgjidh Profesorin
        </option>
        {professors.map((prof: Professor) => (
          <option key={prof.id} value={prof.id}>
            {prof.firstName} {prof.lastName}
          </option>
        ))}
      </select>

      {/* Dropdown për zgjedhjen e lëndëve */}
      <select
        value={subjectId}
        onChange={(e) => setSubjectId(Number(e.target.value))}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      >
        <option value={0} disabled>
          Zgjidh Lëndën
        </option>
        {subjects.map((subj: Subject) => (
          <option key={subj.id} value={subj.id}>
            {subj.name}
          </option>
        ))}
      </select>

      {/* Dropdown për zgjedhjen e llojit të mësimit */}
      <select
        value={typeId}
        onChange={(e) => setTypeId(Number(e.target.value))}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      >
        <option value={0} disabled>
          Zgjidh Tipin
        </option>
        {teachingTypes.map((t: TeachingType) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Submit Button */}
      <button
        onClick={() => mutation.mutate()}
        disabled={professorId === 0 || subjectId === 0 || typeId === 0}
        className="cursor-pointer items-center rounded-md bg-indigo-600 disabled:bg-gray-300 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
      >
        Cakto Profesorin
      </button>
    </div>
  );
}
