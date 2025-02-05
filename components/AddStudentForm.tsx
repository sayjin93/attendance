import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

export default function AddStudentForm({
  classId,
  professorId,
}: {
  classId: string;
  professorId: string;
}) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  //#endregion

  //#region mutations
  const mutation = useMutation({
    mutationFn: async () => {
      if (!classId) {
        showMessage("Nuk jeni i kyçur si profesor!", "error");
        return null;
      }

      const res = await fetch("/api/students", {
        method: "POST",
        body: JSON.stringify({ name, email, classId, professorId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Dështoi krijimi i studentit");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", professorId] });
      showMessage("Studenti u krijua me sukses!", "success");
      setName("");
      setEmail("");
    },
    onError: () => {
      showMessage("Dështoi krijimi i studentit!", "error");
    },
  });
  //#endregion

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        name="student_name"
        type="text"
        placeholder="Emri studentit"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      />

      <input
        name="student_email"
        type="email"
        placeholder="Emaili studentit"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      />

      <button
        onClick={() => mutation.mutate()}
        className="cursor-pointer disabled:cursor-not-allowed col-span-1 sm:col-span-2 items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        disabled={!name || !classId}
      >
        Shto Student
      </button>
    </div>
  );
}
