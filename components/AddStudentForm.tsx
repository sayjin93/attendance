import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

export default function AddStudentForm({
  classId,
}: {
  classId: number;
}) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailPrefix, setEmailPrefix] = useState("");

  // Generate email prefix automatically based on first name and last name
  const generateEmailPrefix = (firstName: string, lastName: string) => {
    if (firstName && lastName) {
      const firstLetter = firstName.charAt(0).toLowerCase();
      const lastNameFormatted = lastName.toLowerCase().replace(/\s+/g, '');
      return `${firstLetter}${lastNameFormatted}`;
    }
    return "";
  };

  // Update email prefix whenever firstName or lastName changes
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (!emailPrefix || emailPrefix === generateEmailPrefix(firstName, lastName)) {
      setEmailPrefix(generateEmailPrefix(value, lastName));
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (!emailPrefix || emailPrefix === generateEmailPrefix(firstName, lastName)) {
      setEmailPrefix(generateEmailPrefix(firstName, value));
    }
  };

  const handleEmailPrefixChange = (value: string) => {
    // Only allow alphanumeric characters and some special characters for email
    const cleanValue = value.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    setEmailPrefix(cleanValue);
  };

  // Get full email
  const getFullEmail = () => `${emailPrefix}@uet.edu.al`;
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
        body: JSON.stringify({ firstName, lastName, email: getFullEmail(), classId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Dështoi krijimi i studentit");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      showMessage("Studenti u krijua me sukses!", "success");
      setFirstName("");
      setLastName("");
      setEmailPrefix("");
    },
    onError: () => {
      showMessage("Dështoi krijimi i studentit!", "error");
    },
  });
  //#endregion

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        name="student_firstName"
        type="text"
        placeholder="Emri"
        value={firstName}
        onChange={(e) => handleFirstNameChange(e.target.value)}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      />

      <input
        name="student_lastName"
        type="text"
        placeholder="Mbiemri"
        value={lastName}
        onChange={(e) => handleLastNameChange(e.target.value)}
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      />

      <div className="col-span-1 sm:col-span-2 flex items-center">
        <div className="flex w-full rounded-md bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
            name="student_email_prefix"
            type="text"
            placeholder="emaili"
            value={emailPrefix}
            onChange={(e) => handleEmailPrefixChange(e.target.value)}
            className="flex-1 border-0 bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
          />
          <span className="flex select-none items-center px-3 text-gray-500 sm:text-sm">
            @uet.edu.al
          </span>
        </div>
      </div>

      <button
        onClick={() => mutation.mutate()}
        className="cursor-pointer disabled:cursor-not-allowed col-span-1 sm:col-span-2 items-center rounded-md bg-indigo-600 disabled:bg-gray-300  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        disabled={!firstName || !lastName || !emailPrefix || !classId}
      >
        Shto Student
      </button>
    </div>
  );
}
