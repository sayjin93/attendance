"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";
import { Program } from "@/types";

interface AddSubjectFormProps {
  isAdmin: string;
  programs: Program[];
}

export default function AddSubjectForm({
  isAdmin,
  programs,
}: AddSubjectFormProps) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState<number>(0);
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (isAdmin === "false") {
        showMessage("Nuk jeni i kyçur si admin!", "error");
        return null;
      }

      const res = await fetch("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ code, name, programId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      showMessage("Lënda u krijua me sukses!", "success");
      setName("");
      setProgramId(0);
    },
    onError: (error) => {
      showMessage(error.message, "error");
    },
  });
  //#endregion

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Input for Subject Code*/}
      <input
        type="text"
        placeholder="Code i lëndës"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      />

      {/* Input for Subject Name */}
      <input
        type="text"
        placeholder="Emri i lëndës"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      />

      {/* Dropdown for Program Selection */}
      <select
        value={programId}
        onChange={(e) => setProgramId(Number(e.target.value))}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      >
        <option value={0} disabled>
          Zgjidh programin
        </option>
        {programs.map((program) => (
          <option key={program.id} value={program.id}>
            {program.name}
          </option>
        ))}
      </select>

      {/* Submit Button */}
      <button
        onClick={() => mutation.mutate()}
        className="cursor-pointer items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        disabled={!name || programId === 0}
      >
        Shto Kurs
      </button>
    </div>
  );
}
