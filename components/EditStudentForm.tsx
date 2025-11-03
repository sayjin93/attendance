"use client";
import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

//types
import { Student, Class } from "@/types";

//hooks
import { updateStudent } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "./Loader";

interface EditStudentFormProps {
  student: Student;
  classes: Class[];
  onClose: () => void;
}

export default function EditStudentForm({ student, classes, onClose }: EditStudentFormProps) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region state
  const [firstName, setFirstName] = useState(student.firstName);
  const [lastName, setLastName] = useState(student.lastName);
  const [classId, setClassId] = useState(student.classId);
  const [memo, setMemo] = useState(student.memo || "");
  const [father, setFather] = useState(student.father || "");
  const [personalEmail, setPersonalEmail] = useState(student.personalEmail || "");
  const [phone, setPhone] = useState(student.phone || "");
  const [orderId, setOrderId] = useState(student.orderId?.toString() || "");
  //#endregion

  //#region mutations
  const updateStudentMutation = useMutation({
    mutationFn: () => updateStudent(
      student.id, 
      firstName, 
      lastName, 
      classId, 
      memo.trim() || null,
      father.trim() || null,
      personalEmail.trim() || null,
      phone.trim() || null,
      orderId.trim() ? parseInt(orderId.trim()) : null
    ),
    onSuccess: (data) => {
      if (data.error) {
        showMessage(data.error, "error");
      } else {
        showMessage("Studenti u modifikua me sukses!", "success");
        queryClient.invalidateQueries({ queryKey: ["students"] });
        onClose();
      }
    },
    onError: () => {
      showMessage("Dështoi modifikimi i studentit!", "error");
    },
  });
  //#endregion

  //#region functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      showMessage("Emri i studentit është i detyrueshëm!", "error");
      return;
    }

    if (!lastName.trim()) {
      showMessage("Mbiemri i studentit është i detyrueshëm!", "error");
      return;
    }

    if (!classId) {
      showMessage("Zgjidhni një klasë!", "error");
      return;
    }

    updateStudentMutation.mutate();
  };
  //#endregion

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          Emri
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani emrin e studentit..."
          required
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Mbiemri
        </label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani mbiemrin e studentit..."
          required
        />
      </div>

      <div>
        <label htmlFor="class" className="block text-sm font-medium text-gray-700">
          Klasa
        </label>
        <select
          id="class"
          value={classId}
          onChange={(e) => setClassId(Number(e.target.value))}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Zgjidhni klasën</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - {cls.program?.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
          Memo (opsionale)
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Shënim i shkurtër për studentin..."
        />
      </div>

      <div>
        <label htmlFor="father" className="block text-sm font-medium text-gray-700">
          Atësia (opsionale)
        </label>
        <input
          type="text"
          id="father"
          value={father}
          onChange={(e) => setFather(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani emrin e babait..."
        />
      </div>

      <div>
        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
          Numri i rendit (opsionale)
        </label>
        <input
          type="number"
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani numrin e rendit..."
        />
      </div>

      <div>
        <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700">
          Emaili personal (opsionale)
        </label>
        <input
          type="email"
          id="personalEmail"
          value={personalEmail}
          onChange={(e) => setPersonalEmail(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani emailin personal..."
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Numri i telefonit (opsionale)
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Shkruani numrin e telefonit..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={updateStudentMutation.isPending}
        >
          Anulo
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={updateStudentMutation.isPending}
        >
          {updateStudentMutation.isPending ? <Loader /> : "Ruaj ndryshimet"}
        </button>
      </div>
    </form>
  );
}