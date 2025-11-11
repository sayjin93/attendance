"use client";
import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

//types
import { EditClassFormProps } from "@/types";

//hooks
import { updateClass } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "../ui/Loader";

export default function EditClassForm({ classItem, programs, onClose }: EditClassFormProps) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region state
  const [name, setName] = useState(classItem.name);
  const [programId, setProgramId] = useState(classItem.programId);
  //#endregion

  //#region mutations
  const updateClassMutation = useMutation({
    mutationFn: () => updateClass(classItem.id, name, programId),
    onSuccess: (data) => {
      if (data.error) {
        showMessage(data.error, "error");
      } else {
        showMessage("Klasa u modifikua me sukses!", "success");
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        onClose();
      }
    },
    onError: () => {
      showMessage("Dështoi modifikimi i klasës!", "error");
    },
  });
  //#endregion

  //#region functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showMessage("Emri i klasës është i detyrueshëm!", "error");
      return;
    }

    if (!programId) {
      showMessage("Zgjidhni një program!", "error");
      return;
    }

    updateClassMutation.mutate();
  };
  //#endregion

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Emri i klasës
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani emrin e klasës..."
          required
        />
      </div>

      <div>
        <label htmlFor="program" className="block text-sm font-medium text-gray-700">
          Programi
        </label>
        <select
          id="program"
          value={programId}
          onChange={(e) => setProgramId(Number(e.target.value))}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Zgjidhni programin</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={updateClassMutation.isPending}
        >
          Anulo
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={updateClassMutation.isPending}
        >
          {updateClassMutation.isPending ? <Loader size="w-4 h-4" /> : "Ruaj ndryshimet"}
        </button>
      </div>
    </form>
  );
}