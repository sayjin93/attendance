import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotify } from "@/contexts/NotifyContext";
import { getTodayDate } from "@/hooks/functions";

//components
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
    program: {
      id: number;
      name: string;
    };
  };
  type: {
    id: number;
    name: string;
  };
}

interface AddLectureFormProps {
  assignments: Assignment[];
  isAdmin: boolean;
  onClose: () => void;
}

const AddLectureForm: React.FC<AddLectureFormProps> = ({
  assignments,
  isAdmin,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    assignmentId: "",
    date: getTodayDate(),
  });

  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const notify = useNotify();

  const createLectureMutation = useMutation({
    mutationFn: async (data: { assignmentId: number; date: string }) => {
      const response = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Dështoi krijimi i leksionit!");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      notify.showMessage("Leksioni u krijua me sukses!", "success");
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

    createLectureMutation.mutate({
      assignmentId: parseInt(formData.assignmentId),
      date: formData.date,
    });
  };

  // Group assignments by program
  const bachelorAssignments = assignments.filter(assignment => 
    assignment.class.program.name === "Bachelor"
  );
  const masterAssignments = assignments.filter(assignment => 
    assignment.class.program.name === "Master"
  );

  const selectedAssignment = assignments.find(
    (a) => a.id === parseInt(formData.assignmentId)
  );

  return (
    <div className="max-w-md mx-auto">

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
            
            {bachelorAssignments.length > 0 && (
              <optgroup label="Bachelor">
                {bachelorAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.subject.name} ({assignment.subject.code}) -{" "}
                    {assignment.class.name} - {assignment.type.name}
                    {isAdmin &&
                      ` - ${assignment.professor.firstName} ${assignment.professor.lastName}`}
                  </option>
                ))}
              </optgroup>
            )}
            
            {masterAssignments.length > 0 && (
              <optgroup label="Master">
                {masterAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.subject.name} ({assignment.subject.code}) -{" "}
                    {assignment.class.name} - {assignment.type.name}
                    {isAdmin &&
                      ` - ${assignment.professor.firstName} ${assignment.professor.lastName}`}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data *
          </label>
          <input
            type="date"
            value={formData.date}
            min="2025-10-06"
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
            {isAdmin && (
              <p className="text-sm text-gray-600">
                <strong>Profesori:</strong>{" "}
                {selectedAssignment.professor.firstName}{" "}
                {selectedAssignment.professor.lastName}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createLectureMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createLectureMutation.isPending ? <Loader size="sm" /> : "Krijo"}
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

export default AddLectureForm;