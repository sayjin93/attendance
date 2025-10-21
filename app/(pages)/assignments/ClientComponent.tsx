"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";

//types
import { TeachingAssignment, Program } from "@/types";

//hooks
import { fetchAssignments } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddAssignmentForm from "@/components/AddAssignmentForm";

export default function AssignmentsPageClient({
  isAdmin,
}: {
  isAdmin: string;
}) {
  //#region constants
  const { showMessage } = useNotify();
  //#endregion

  //#region states
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState<number>(0);
  const [deletingAssignment, setDeletingAssignment] = useState<TeachingAssignment | null>(null);
  //#endregion

  //#region useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => fetchAssignments(),
    enabled: isAdmin === "true",
  });
  //#endregion

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

  // Filter assignments based on search and program filter
  const filteredAssignments = assignments.filter((assignment: TeachingAssignment) => {
    const matchesSearch = searchTerm === "" ||
      assignment.professor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.professor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram = programFilter === 0 ||
      assignment.subject?.programId === programFilter ||
      assignment.class?.programId === programFilter;

    return matchesSearch && matchesProgram;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Caktimet</h1>
      </div>

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

      {/* Filters and Search */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Filtro Caktimet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Kërko profesor, lëndë, kod, klasë..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Program Filter */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(Number(e.target.value))}
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            >
              <option value={0}>Të gjitha programet</option>
              {programs.map((program: Program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Assignments List */}
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Lista e Caktimeve ({filteredAssignments.length})
          </h2>
        </div>

        {filteredAssignments.length === 0 ? (
          <Alert
            type="default"
            title={searchTerm || programFilter ? "Nuk u gjetën caktime që përputhen me filtrat." : "Nuk ka caktime ende. Caktoni një profesor më sipër!"}
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
                  {isAdmin === "true" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veprime
                    </th>
                  )}
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
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {assignment.type?.name}
                      </span>
                    </td>
                    {isAdmin === "true" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {/* TODO: Edit functionality */ }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Modifiko caktim"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAssignment(assignment)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Fshi caktim"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal - TODO: Implement delete functionality */}
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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Anulo
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement delete functionality
                    setDeletingAssignment(null);
                    showMessage("Funksionaliteti i fshirjes do të implementohet së shpejti!", "default");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
