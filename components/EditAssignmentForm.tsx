"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useNotify } from "@/contexts/NotifyContext";
import { updateAssignment } from "@/hooks/functions";

import { Professor, Subject, Class, TeachingType, TeachingAssignment } from "@/types";

interface EditAssignmentFormProps {
  assignment: TeachingAssignment;
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  teachingTypes: TeachingType[];
  onClose: () => void;
}

export default function EditAssignmentForm({
  assignment,
  professors,
  subjects,
  classes,
  teachingTypes,
  onClose,
}: EditAssignmentFormProps) {
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    professorId: assignment.professorId,
    subjectId: assignment.subjectId,
    classId: assignment.classId,
    typeId: assignment.typeId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      updateAssignment(assignment.id, data),
    onSuccess: () => {
      showMessage("Caktimi u përditësua me sukses!", "success");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      onClose();
    },
    onError: (error: Error) => {
      showMessage(error.message || "Gabim gjatë përditësimit të caktimit!", "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.professorId || !formData.subjectId || !formData.classId || !formData.typeId) {
      showMessage("Ju lutem plotësoni të gjitha fushat!", "error");
      return;
    }

    updateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Professor Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profesori *
        </label>
        <select
          value={formData.professorId}
          onChange={(e) =>
            setFormData({ ...formData, professorId: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Zgjidh Profesorin</option>
          {professors.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.firstName} {prof.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lënda *
        </label>
        <select
          value={formData.subjectId}
          onChange={(e) =>
            setFormData({ ...formData, subjectId: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Zgjidh Lëndën</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name} ({subject.code})
            </option>
          ))}
        </select>
      </div>

      {/* Class Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Klasa *
        </label>
        <select
          value={formData.classId}
          onChange={(e) =>
            setFormData({ ...formData, classId: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Zgjidh Klasën</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipi *
        </label>
        <select
          value={formData.typeId}
          onChange={(e) =>
            setFormData({ ...formData, typeId: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Zgjidh Tipin</option>
          {teachingTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Anulo
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
        </button>
      </div>
    </form>
  );
}
