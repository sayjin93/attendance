"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";

//types
import { TeachingAssignment, Professor, Subject, Class, TeachingType } from "@/types";

//hooks
import { fetchAssignments } from "@/hooks/fetchFunctions";
import { deleteAssignment } from "@/hooks/functions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import AddAssignmentForm from "@/components/AddAssignmentForm";
import EditAssignmentForm from "@/components/EditAssignmentForm";

export default function AssignmentsPageClient({
  isAdmin,
}: {
  isAdmin: string;
}) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [professorFilter, setProfessorFilter] = useState<number>(0);
  const [subjectFilter, setSubjectFilter] = useState<number>(0);
  const [classFilter, setClassFilter] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<number>(0);
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<TeachingAssignment | null>(null);
  //#endregion

  //#region useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => fetchAssignments(),
    enabled: isAdmin === "true",
  });
  //#endregion

  //#region mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAssignment(id),
    onSuccess: () => {
      showMessage("Caktimi u fshi me sukses!", "success");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setDeletingAssignment(null);
    },
    onError: (error: Error) => {
      showMessage(error.message || "Gabim gjatë fshirjes së caktimit!", "error");
    },
  });
  //#endregion

  const handleDelete = () => {
    if (deletingAssignment) {
      deleteMutation.mutate(deletingAssignment.id);
    }
  };

  if (isLoading) return <Loader />;
  if (error) {
    showMessage("Error loading assignments.", "error");
    return null;
  }
  const {
    assignments = [],
    professors = [],
    subjects = [],
    classes = [],
    programs = [],
    teachingTypes = [],
  } = data || {}; // ✅ Extract assignments

  // Filter assignments based on filters
  const filteredAssignments = assignments.filter((assignment: TeachingAssignment) => {
    const matchesProfessor = professorFilter === 0 || assignment.professorId === professorFilter;
    const matchesSubject = subjectFilter === 0 || assignment.subjectId === subjectFilter;
    const matchesClass = classFilter === 0 || assignment.classId === classFilter;
    const matchesType = typeFilter === 0 || assignment.typeId === typeFilter;

    return matchesProfessor && matchesSubject && matchesClass && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Add Assignment Form */}
      <Card>
        <AddAssignmentForm
          isAdmin={isAdmin}
          professors={professors}
          subjects={subjects}
          classes={classes}
          programs={programs}
          teachingTypes={teachingTypes}
        />
      </Card>

      {/* Assignments List */}
      <Card>
        <div className="mb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            Lista e Caktimeve ({filteredAssignments.length})
          </h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:max-w-3xl">
            {/* Professor Filter */}
            <select
              value={professorFilter}
              onChange={(e) => setProfessorFilter(Number(e.target.value))}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
              <option value={0}>Të gjithë profesorët</option>
              {professors.map((professor: Professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.firstName} {professor.lastName}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(Number(e.target.value))}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
              <option value={0}>Të gjitha lëndët</option>
              {subjects.map((subject: Subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(Number(e.target.value))}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
              <option value={0}>Të gjitha klasat</option>
              {classes.map((cls: Class) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(Number(e.target.value))}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
              <option value={0}>Të gjitha tipet</option>
              {teachingTypes.map((type: TeachingType) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <Alert
            type="default"
            title={professorFilter || subjectFilter || classFilter || typeFilter ? "Nuk u gjetën caktime që përputhen me filtrat." : "Nuk ka caktime ende. Caktoni një profesor më sipër!"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lënda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klasa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment: TeachingAssignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.professor?.firstName} {assignment.professor?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{assignment.subject?.name}</div>
                        <div className="text-gray-500">{assignment.subject?.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.class?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.subject?.program?.name || assignment.class?.program?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.type?.name === 'Leksion'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {assignment.type?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/lectures?professorId=${assignment.professor?.id}&subjectId=${assignment.subject?.id}&classId=${assignment.class?.id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Menaxho Leksionet"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>
                        </a>
                        {isAdmin === "true" && (
                          <>
                            <button
                              onClick={() => setEditingAssignment(assignment)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
                              title="Modifiko caktim"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingAssignment(assignment)}
                              className="text-red-600 hover:text-red-900 p-1 rounded cursor-pointer"
                              title="Fshi caktim"
                            >
                              <TrashIcon className="h-4 w-4" />
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

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <Modal
          isOpen={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          title="Modifiko Caktimin"
        >
          <EditAssignmentForm
            assignment={editingAssignment}
            professors={professors}
            subjects={subjects}
            classes={classes}
            teachingTypes={teachingTypes}
            onClose={() => setEditingAssignment(null)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Konfirmo fshirjen
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Jeni të sigurt që dëshironi të fshini caktimin e{" "}
                <span className="font-medium">
                  {deletingAssignment.professor?.firstName} {deletingAssignment.professor?.lastName}
                </span>{" "}
                për lëndën{" "}
                <span className="font-medium">
                  {deletingAssignment.subject?.name}
                </span>{" "}
                në klasën{" "}
                <span className="font-medium">
                  {deletingAssignment.class?.name}
                </span>
                ? Ky veprim nuk mund të zhbëhet.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingAssignment(null)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Anulo
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Duke fshirë..." : "Fshi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
