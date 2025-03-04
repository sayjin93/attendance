"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";
import { Program } from "@/types";

interface AddClassFormProps {
  professorId: string;
  isAdmin: boolean;
  programs: Program[];
}

export default function AddClassForm({ professorId, isAdmin, programs }: AddClassFormProps) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState<number | "">(""); // Holds selected program ID
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (!isAdmin) {
        showMessage("Nuk jeni i kyçur si admin!", "error");
        return null;
      }

      const res = await fetch("/api/classes", {
        method: "POST",
        body: JSON.stringify({ name, programId, professorId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      showMessage("Klasa u krijua me sukses!", "success");
      setName("");
      setProgramId(""); // Reset program selection
    },
    onError: (error) => {
      showMessage(error.message, "error");
    },
  });
  //#endregion

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {/* Input for Class Name */}
      <input
        name="shtoklase"
        type="text"
        placeholder="Emri klasës"
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
        <option value="" disabled>-- Zgjidh programin --</option>
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
        disabled={!name} // ✅ Parandalojmë krijimin e klasës bosh
      >
        Shto Klasë
      </button>
    </div>
  );
}
