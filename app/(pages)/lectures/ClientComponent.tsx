"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ClipboardDocumentCheckIcon,
  Squares2X2Icon 
} from "@heroicons/react/16/solid";

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
  type?: {
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
  const [groupBy, setGroupBy] = useState<'none' | 'subject' | 'class' | 'professor' | 'type'>('none');

  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Get filter parameters from URL
  const urlProfessorId = searchParams.get("professorId");
  const urlSubjectId = searchParams.get("subjectId");
  const urlClassId = searchParams.get("classId");

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

  // Set initial search term from URL parameters
  useEffect(() => {
    if (urlProfessorId || urlSubjectId || urlClassId) {
      // Build search term from URL parameters
      const searchParts: string[] = [];
      
      if (data?.lectures) {
        const matchingLecture = data.lectures.find(lecture => 
          (!urlProfessorId || lecture.professor.id === parseInt(urlProfessorId)) &&
          (!urlSubjectId || lecture.subject.id === parseInt(urlSubjectId)) &&
          (!urlClassId || lecture.class.id === parseInt(urlClassId))
        );
        
        if (matchingLecture) {
          // Use subject code or class name as search term
          if (urlSubjectId) searchParts.push(matchingLecture.subject.code);
          else if (urlClassId) searchParts.push(matchingLecture.class.name);
          
          if (searchParts.length > 0) {
            setSearchTerm(searchParts.join(" "));
          }
        }
      }
    }
  }, [urlProfessorId, urlSubjectId, urlClassId, data]);

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

  // Memoized group calculation
  const groupedLectures: Record<string, Lecture[]> = useMemo(() => {
    if (!data?.lectures) return {};
    
    const lectures = data.lectures;
    
    const filteredLectures = lectures.filter((lecture) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lecture.subject.name.toLowerCase().includes(searchLower) ||
        lecture.subject.code.toLowerCase().includes(searchLower) ||
        lecture.class.name.toLowerCase().includes(searchLower) ||
        lecture.professor.firstName.toLowerCase().includes(searchLower) ||
        lecture.professor.lastName.toLowerCase().includes(searchLower) ||
        (lecture.type?.name.toLowerCase().includes(searchLower) || false)
      );
    });

    if (groupBy === 'none') {
      return { 'Të gjitha': filteredLectures };
    }

    const groups: Record<string, Lecture[]> = {};

    filteredLectures.forEach((lecture) => {
      let key = '';
      
      switch (groupBy) {
        case 'subject':
          key = `${lecture.subject.name} (${lecture.subject.code})`;
          break;
        case 'class':
          key = lecture.class.name;
          break;
        case 'professor':
          key = `${lecture.professor.firstName} ${lecture.professor.lastName}`;
          break;
        case 'type':
          key = lecture.type?.name || 'Pa tip';
          break;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(lecture);
    });

    return groups;
  }, [data, searchTerm, groupBy]);

  if (isLoading) return <Loader />;
  if (error) {
    return <Alert type="error" title="Dështoi ngarkimi i leksioneve!" />;
  }

  if (!data) {
    return <Alert type="warning" title="Nuk ka të dhëna të disponueshme." />;
  }

  const { assignments, isAdmin } = data;

  const totalLectures = Object.values(groupedLectures).flat().length;
  const lecturesWithAttendance = Object.values(groupedLectures).flat().filter(lecture => lecture.attendance.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Kërkoni sipas lëndës, klases, profesorit ose tipit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Group By Dropdown */}
      <div className="flex gap-2 items-center">
        <Squares2X2Icon className="w-5 h-5 text-gray-500" />
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="none">Pa grupim</option>
          <option value="subject">Grupo sipas Lëndës</option>
          <option value="class">Grupo sipas Klasës</option>
          {isAdmin && <option value="professor">Grupo sipas Profesorit</option>}
          <option value="type">Grupo sipas Tipit</option>
        </select>
      </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <PlusIcon className="w-4 h-4" />
          Shto Leksion
        </button>
      </div>



      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalLectures}
            </div>
            <div className="text-sm text-gray-600">Leksione {searchTerm ? 'të Filtruara' : 'Totale'}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {lecturesWithAttendance}
            </div>
            <div className="text-sm text-gray-600">Regjistra Prezence</div>
          </div>
        </Card>
      </div>

      {/* Lectures List */}
      <Card title="Lista e Leksioneve">
        {totalLectures === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipi
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
                {Object.entries(groupedLectures).map(([groupKey, lectures]) => (
                  <React.Fragment key={groupKey}>
                    {groupBy !== 'none' && (
                      <tr className="bg-gray-100">
                        <td 
                          colSpan={isAdmin ? 7 : 6} 
                          className="px-6 py-3 text-sm font-semibold text-gray-700"
                        >
                          {groupKey}
                        </td>
                      </tr>
                    )}
                    {lectures.map((lecture: Lecture) => (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lecture.type ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              lecture.type.name === 'Leksion' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {lecture.type.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lecture.professor.firstName} {lecture.professor.lastName}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lecture.attendance.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-2 items-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ✓ {lecture.attendance.filter((a: {status: string}) => a.status === "PRESENT").length}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  ⭐ {lecture.attendance.filter((a: {status: string}) => a.status === "PARTICIPATED").length}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  ✗ {lecture.attendance.filter((a: {status: string}) => a.status === "ABSENT").length}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Total: {lecture.attendance.length} studentë
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pa prezencë
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`/attendance?classId=${lecture.class.id}&lectureId=${lecture.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Menaxho Prezencën"
                            >
                              <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            </a>
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
                  </React.Fragment>
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