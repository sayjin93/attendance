import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotify } from "@/contexts/NotifyContext";
import { getTodayDate } from "@/hooks/functions";

//devextreme
import DateBox from "devextreme-react/date-box";
import { locale } from "devextreme/localization";

//types
import { AddLectureFormProps } from "@/types";

//components
import Alert from "@/components/ui/Alert";
import Loader from "@/components/ui/Loader";

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

  // Configure locale for DateBox
  useEffect(() => {
    locale("sq");
  }, []);

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
      // Reset form instead of closing
      setFormData({
        assignmentId: "",
        date: getTodayDate(),
      });
      setError(null);
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
  const bachelorAssignments = assignments.filter(assignment => assignment.class.program.name === "Bachelor");
  const masterAssignments = assignments.filter(assignment => assignment.class.program.name === "Master");
  const selectedAssignment = assignments.find(a => a.id === parseInt(formData.assignmentId));

  return (
    <div className="w-full max-w-none">
      {error && <Alert type="error" title={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid layout for larger screens, single column for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
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

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <DateBox
              value={formData.date ? new Date(formData.date) : new Date()}
              min={new Date("2025-10-06")}
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} // 1 year from now
              type="date"
              displayFormat="dd/MM/yyyy"
              placeholder="Zgjidhni datën..."
              onValueChanged={(e) => {
                if (e.value) {
                  // Ensure e.value is a Date object
                  const date = e.value instanceof Date ? e.value : new Date(e.value);
                  if (!isNaN(date.getTime())) {
                    const dateString = date.toISOString().split('T')[0];
                    setFormData({ ...formData, date: dateString });
                  }
                }
              }}
              stylingMode="outlined"
              width="100%"
              height={40}
              showClearButton={false}
              pickerType="calendar"
              openOnFieldClick={true}
              showDropDownButton={true}
              acceptCustomValue={false}
              dateSerializationFormat="yyyy-MM-dd"
            />
          </div>
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

        <div className="flex flex-col sm:flex-row gap-3">
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