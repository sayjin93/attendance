"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

//types
import { Class } from "@/types";

//hooks
import { fetchClasses, deleteClass } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddClassForm from "@/components/AddClassForm";
import EditClassForm from "@/components/EditClassForm";
import Modal from "@/components/Modal";

export default function ClassesPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();

  // Color palette for courses - consistent colors based on course ID
  const courseColors = [
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
    { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  ];

  // Function to get consistent color for a course based on its ID
  const getCourseColor = (courseId: number) => {
    return courseColors[courseId % courseColors.length];
  };
  //#endregion

  //#region state
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  //#endregion

  //#region useQuery
  const { data: classes = [], isLoading, error } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
    enabled: isAdmin === "true",
  });
  //#endregion

  //#region mutations
  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => deleteClass(id),
    onSuccess: (data) => {
      if (data.error) {
        showMessage(data.error, "error");
      } else {
        showMessage("Klasa u fshi me sukses!", "success");
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        setDeletingClass(null);
      }
    },
    onError: () => {
      showMessage("Dështoi fshirja e klasës!", "error");
    },
  });
  //#endregion

  //#region functions
  const handleDeleteClass = () => {
    if (deletingClass) {
      deleteClassMutation.mutate(deletingClass.id);
    }
  };
  //#endregion

  if (isLoading) return <Loader />;
  if (error) {
    showMessage("Error loading classes.", "error");
    return null;
  }

  // Filter programs from classes
  const programs = Array.from(
    new Map(
      classes
        .filter(c => c.program) // Filter out undefined
        .map(c => [c.program!.id, c.program!]) // Non-null assertion
    ).values()
  );

  // Separate classes by program type and sort alphabetically by name
  const bachelorClasses = (classes?.filter(c => c.program?.name === "Bachelor") || [])
    .sort((a, b) => a.name.localeCompare(b.name));
  const masterClasses = (classes?.filter(c => c.program?.name === "Master") || [])
    .sort((a, b) => a.name.localeCompare(b.name));

  // Function to render class cards
  const renderClassCard = (classItem: Class) => {
    // Extract unique subjects from teaching assignments
    const uniqueSubjects = classItem.teachingAssignments
      ? Array.from(
        new Map(
          classItem.teachingAssignments
            .filter((ta) => ta.subject)
            .map((ta) => [ta.subject!.id, ta.subject!])
        ).values()
      )
      : [];

    return (
      <div
        key={classItem.id}
        className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-300 hover:-translate-y-0.5"
      >
        {/* Header gradient */}
        <div className="h-1 w-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-t-xl"></div>

        <div className="p-4">
          {/* Class name */}
          <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-1">
            {classItem.name}
          </h3>

          {/* Subjects */}
          <div className="mb-4 min-h-8">
            {uniqueSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {uniqueSubjects.slice(0, 3).map((subject) => {
                  const colors = getCourseColor(subject.id);
                  return (
                    <span
                      key={subject.id}
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {subject.name}
                    </span>
                  );
                })}
                {uniqueSubjects.length > 3 && (
                  <div className="relative group">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 cursor-help">
                      +{uniqueSubjects.length - 3} më shumë
                    </span>
                    {/* Tooltip with remaining subjects */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {uniqueSubjects.slice(3).map((subject) => {
                            const colors = getCourseColor(subject.id);
                            return (
                              <span
                                key={subject.id}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                              >
                                {subject.name}
                              </span>
                            );
                          })}
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-2">
                <span className="text-xs text-gray-400 italic">Nuk ka kurse</span>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{uniqueSubjects.length} kurse</span>
            </div>
          </div>

          {/* Action buttons */}
          {isAdmin === "true" && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setEditingClass(classItem)}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors duration-150"
                title="Modifiko klasën"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ndrysho
              </button>
              <button
                onClick={() => setDeletingClass(classItem)}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-150"
                title="Fshi klasën"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }; return (
    <div className="flex flex-col gap-6">
      {/* Forma për shtimin e klasave */}
      <Card title="Shto klasë të re">
        <AddClassForm isAdmin={isAdmin} programs={programs} />
      </Card>

      {/* Bachelor Classes */}
      <Card title="Klasat e Bachelorit">
        {bachelorClasses.length === 0 ? (
          <Alert title="Nuk ka klasa të Bachelor. Shtoni një klasë Bachelor më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-6">
            {bachelorClasses.map((classItem: Class) => renderClassCard(classItem))}
          </div>
        )}
      </Card>

      {/* Master Classes */}
      <Card title="Klasat e Masterit">
        {masterClasses.length === 0 ? (
          <Alert title="Nuk ka klasa të Master. Shtoni një klasë Master më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-6">
            {masterClasses.map((classItem: Class) => renderClassCard(classItem))}
          </div>
        )}
      </Card>

      {/* Show message when no classes exist at all */}
      {classes?.length === 0 && (
        <Card title="Lista e klasave">
          <Alert title="Nuk keni ende klasa. Shtoni një klasë më sipër!" />
        </Card>
      )}



      {/* Edit Class Modal */}
      <Modal
        isOpen={editingClass !== null}
        onClose={() => setEditingClass(null)}
        title="Modifiko klasën"
        maxWidth="max-w-lg"
      >
        {editingClass && (
          <EditClassForm
            classItem={editingClass}
            programs={programs}
            onClose={() => setEditingClass(null)}
          />
        )}
      </Modal>

      {/* Delete Class Modal */}
      <Modal
        isOpen={deletingClass !== null}
        onClose={() => setDeletingClass(null)}
        title="Fshi klasën"
        maxWidth="max-w-md"
      >
        {deletingClass && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A jeni të sigurt që doni të fshini klasën <strong>{deletingClass.name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              Ky veprim nuk mund të kthehet prapa. Klasa do të fshihet përgjithmonë.
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={deleteClassMutation.isPending}
              >
                Anulo
              </button>
              <button
                onClick={handleDeleteClass}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={deleteClassMutation.isPending}
              >
                {deleteClassMutation.isPending ? <Loader /> : "Fshi klasën"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
