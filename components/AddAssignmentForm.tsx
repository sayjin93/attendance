"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";
import { Professor, Subject, TeachingType, Program, Class } from "@/types";

export default function AddAssignmentForm({
  isAdmin,
  professors,
  subjects,
  classes,
  programs,
  teachingTypes,
}: {
  isAdmin: string;
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  programs: Program[];
  teachingTypes: TeachingType[];
}) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [programId, setProgramId] = useState<number>(0);
  const [professorId, setProfessorId] = useState<number>(0);
  const [subjectId, setSubjectId] = useState<number>(0);
  const [classId, setClassId] = useState<number>(0);
  const [typeId, setTypeId] = useState<number>(0);
  //#endregion

  //#region computed values
  // Filter subjects by selected program
  const filteredSubjects = subjects.filter(subject => 
    programId === 0 || subject.programId === programId
  );

  // Filter classes by selected program
  const filteredClasses = classes.filter(classItem => 
    programId === 0 || classItem.programId === programId
  );
  //#endregion

  //#region effects
  // Reset subject and class when program changes
  useEffect(() => {
    setSubjectId(0);
    setClassId(0);
  }, [programId]);
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
        body: JSON.stringify({ professorId, subjectId, classId, typeId }),
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
      setProgramId(0);
      setProfessorId(0);
      setSubjectId(0);
      setClassId(0);
      setTypeId(0);
    },
    onError: (error) => {
      showMessage(error.message, "error");
    },
  });
  //#endregion

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Cakto Profesor në Lëndë për Klasë</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Dropdown për zgjedhjen e programit */}
        <select
          value={programId}
          onChange={(e) => setProgramId(Number(e.target.value))}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        >
          <option value={0} disabled>
            Zgjidh Programin
          </option>
          {programs.map((program: Program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>

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
          disabled={programId === 0}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value={0} disabled>
            {programId === 0 ? "Zgjidhni programin së pari" : "Zgjidh Lëndën"}
          </option>
          {filteredSubjects.map((subj: Subject) => (
            <option key={subj.id} value={subj.id}>
              {subj.code} - {subj.name}
            </option>
          ))}
        </select>

        {/* Dropdown për zgjedhjen e klasës */}
        <select
          value={classId}
          onChange={(e) => setClassId(Number(e.target.value))}
          disabled={programId === 0}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value={0} disabled>
            {programId === 0 ? "Zgjidhni programin së pari" : "Zgjidh Klasën"}
          </option>
          {filteredClasses.map((cls: Class) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={() => mutation.mutate()}
          disabled={programId === 0 || professorId === 0 || subjectId === 0 || classId === 0 || typeId === 0}
          className="cursor-pointer items-center rounded-md bg-indigo-600 disabled:bg-gray-300 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Duke caktuar..." : "Cakto Profesorin"}
        </button>
      </div>
    </div>
  );
}
