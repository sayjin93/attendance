import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotify } from "@/contexts/NotifyContext";
import Alert from "./Alert";
import Loader from "./Loader";

interface Assignment {
  id: number;
  professor: {
    id: number;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  class: {
    id: number;
    name: string;
  };
  type: {
    id: number;
    name: string;
  };
}

interface Lecture {
  id: number;
  date: string;
  professor: {
    id: number;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  class: {
    id: number;
    name: string;
  };
}

interface EditLectureFormProps {
  lecture: Lecture;
  assignments: Assignment[];
  onClose: () => void;
}

const EditLectureForm: React.FC<EditLectureFormProps> = ({
  lecture,
  assignments,
  onClose,
}) => {
  // Find the current assignment that matches this lecture
  const currentAssignment = assignments.find(
    (a) =>
      a.professor.id === lecture.professor.id &&
      a.subject.id === lecture.subject.id &&
      a.class.id === lecture.class.id
  );

  const [formData, setFormData] = useState({
    assignmentId: currentAssignment?.id?.toString() || "",
    date: lecture.date.split("T")[0], // Extract date part
  });

  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const notify = useNotify();

  const updateLectureMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      assignmentId: number;
      date: string;
    }) => {
      const response = await fetch("/api/lectures", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Dështoi përditësimi i leksionit!");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      notify.showMessage("Leksioni u përditësua me sukses!", "success");
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.assignmentId || !formData.date) {
      setError("Të gjitha fushat janë të detyrueshme!");
      return;
    }

    updateLectureMutation.mutate({
      id: lecture.id,
      assignmentId: parseInt(formData.assignmentId),
      date: formData.date,
    });
  };

  const selectedAssignment = assignments.find(
    (a) => a.id === parseInt(formData.assignmentId)
  );

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Redakto Leksionin
      </h3>

      {error && <Alert type="error" title={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caktimi *
          </label>
          <select
            value={formData.assignmentId}
            onChange={(e) =>
              setFormData({ ...formData, assignmentId: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Zgjidhni caktimin...</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.subject.name} ({assignment.subject.code}) -{" "}
                {assignment.class.name} - {assignment.type.name} -{" "}
                {assignment.professor.firstName} {assignment.professor.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {selectedAssignment && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">
              Detajet e Caktimit:
            </h4>
            <p className="text-sm text-gray-600">
              <strong>Lënda:</strong> {selectedAssignment.subject.name} (
              {selectedAssignment.subject.code})
            </p>
            <p className="text-sm text-gray-600">
              <strong>Klasa:</strong> {selectedAssignment.class.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tipi:</strong> {selectedAssignment.type.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Profesori:</strong>{" "}
              {selectedAssignment.professor.firstName}{" "}
              {selectedAssignment.professor.lastName}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={updateLectureMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateLectureMutation.isPending ? (
              <Loader size="sm" />
            ) : (
              "Përditëso"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Anulo
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLectureForm;