"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/16/solid";

//components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import AddLectureForm from "@/components/AddLectureForm";
import EditLectureForm from "@/components/EditLectureForm";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

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
  attendance: Array<{
    id: number;
    status: string;
  }>;
}

interface LecturesResponse {
  assignments: Assignment[];
  lectures: Lecture[];
  isAdmin: boolean;
  professorId: number;
}

export default function LecturesPageClient() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { showMessage } = useNotify();
  const queryClient = useQueryClient();

  // Fetch lectures and assignments
  const { data, isLoading, error } = useQuery<LecturesResponse>({
    queryKey: ["lectures"],
    queryFn: async () => {
      const response = await fetch("/api/lectures");
      if (!response.ok) {
        throw new Error("Failed to fetch lectures");
      }
      return response.json();
    },
  });

  // Delete lecture mutation (Admin only)
  const deleteLectureMutation = useMutation({
    mutationFn: async (lectureId: number) => {
      const response = await fetch(`/api/lectures?id=${lectureId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Dështoi fshirja e leksionit!");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      showMessage("Leksioni u fshi me sukses!", "success");
    },
    onError: (error: Error) => {
      showMessage(error.message, "error");
    },
  });

  const handleEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setIsEditModalOpen(true);
  };

  const handleDelete = (lecture: Lecture) => {
    if (
      window.confirm(
        `A jeni të sigurt që dëshironi të fshini leksionin për ${lecture.subject.name} në ${lecture.class.name}?`
      )
    ) {
      deleteLectureMutation.mutate(lecture.id);
    }
  };

  if (isLoading) return <Loader />;
  if (error) {
    return <Alert type="error" title="Dështoi ngarkimi i leksioneve!" />;
  }

  if (!data) {
    return <Alert type="warning" title="Nuk ka të dhëna të disponueshme." />;
  }

  const { assignments, lectures, isAdmin } = data;

  // Filter lectures based on search term
  const filteredLectures = lectures.filter((lecture) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lecture.subject.name.toLowerCase().includes(searchLower) ||
      lecture.subject.code.toLowerCase().includes(searchLower) ||
      lecture.class.name.toLowerCase().includes(searchLower) ||
      lecture.professor.firstName.toLowerCase().includes(searchLower) ||
      lecture.professor.lastName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leksionet</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Menaxhoni leksionet e të gjithë profesorëve"
              : "Menaxhoni leksionet tuaja"}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Shto Leksion
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Kërkoni sipas lëndës, klases ose profesorit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.length}
            </div>
            <div className="text-sm text-gray-600">Caktime Aktive</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {lectures.length}
            </div>
            <div className="text-sm text-gray-600">Leksione Totale</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {lectures.reduce((total, lecture) => total + lecture.attendance.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Regjistra Prezence</div>
          </div>
        </Card>
      </div>

      {/* Lectures List */}
      <Card title="Lista e Leksioneve">
        {filteredLectures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm
                ? "Nuk u gjetën leksione që përputhen me kërkimin."
                : "Nuk ka leksione të regjistruara."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lënda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klasa
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profesori
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prezenca
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(lecture.date).toLocaleDateString("sq-AL")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lecture.subject.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lecture.subject.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecture.class.name}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lecture.professor.firstName} {lecture.professor.lastName}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lecture.attendance.length} student
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(lecture)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Redakto"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lecture)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Fshi"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Lecture Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Shto Leksion të Ri"
      >
        <AddLectureForm
          assignments={assignments}
          isAdmin={isAdmin}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Lecture Modal */}
      {editingLecture && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLecture(null);
          }}
          title="Redakto Leksionin"
        >
          <EditLectureForm
            lecture={editingLecture}
            assignments={assignments}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingLecture(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}