"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

//contexts
import { useNotify } from "@/contexts/NotifyContext";
import { AddClassFormProps, Program } from "@/types";

export default function AddClassForm({ isAdmin, programs }: AddClassFormProps) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState<number>(0);

  const selectedProgramm = programs?.find(
    (prog: Program) => prog.id === programId
  );
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (isAdmin === "false") {
        showMessage("Nuk jeni i kyçur si admin!", "error");
        return null;
      }

      const res = await fetch("/api/classes", {
        method: "POST",
        body: JSON.stringify({ name, programId }),
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
      setProgramId(0);
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
      <Listbox
        value={programId}
        onChange={(value) => setProgramId(Number(value))}
        name="program-select">
        <div className="relative">
          <ListboxButton 
            id="program-select-button"
            className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
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
            id="program-select-options"
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

      {/* Submit Button */}
      <button
        onClick={() => mutation.mutate()}
        className="cursor-pointer items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        disabled={!name || programId === 0}
      >
        Shto Klasë
      </button>
    </div>
  );
}
