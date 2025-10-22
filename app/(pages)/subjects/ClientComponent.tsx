"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

//types
import { Subject } from "@/types";

//hooks
import { fetchSubjects, deleteSubject } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import AddSubjectForm from "@/components/AddSubjectForm";
import EditSubjectForm from "@/components/EditSubjectForm";
import Modal from "@/components/Modal";

export default function SubjectsPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  //#endregion

  //#region useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => fetchSubjects(),
    enabled: isAdmin === "true",
  });
  //#endregion

  //#region mutations
  const deleteSubjectMutation = useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: (data) => {
      if (data.error) {
        showMessage(data.error, "error");
      } else {
        showMessage("Lënda u fshi me sukses!", "success");
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        setDeletingSubject(null);
      }
    },
    onError: () => {
      showMessage("Dështoi fshirja e lëndës!", "error");
    },
  });
  //#endregion

  //#region functions
  const handleDeleteSubject = () => {
    if (deletingSubject) {
      deleteSubjectMutation.mutate(deletingSubject.id);
    }
  };

  // Function to render subject cards
  const renderSubjectCard = (subjectItem: Subject) => {
    // Extract unique classes from teaching assignments
    const uniqueClasses = subjectItem.teachingAssignments
      ? Array.from(
          new Map(
            subjectItem.teachingAssignments
              .filter(ta => ta.class)
              .map(ta => [ta.class!.id, ta.class!])
          ).values()
        )
      : [];

    return (
      <div
        key={subjectItem.id}
        className="relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
      >
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold">
            {subjectItem.name} {subjectItem.code ? `[${subjectItem.code}]` : ''}
          </h2>
          
          {/* Display classes instead of program */}
          <div className="mt-2 mb-3">
            {uniqueClasses.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-center">
                {uniqueClasses.map((cls) => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {cls.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs italic">Nuk ka klasa</p>
            )}
          </div>
        
          {isAdmin === "true" && (
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setEditingSubject(subjectItem)}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Modifiko lëndën"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingSubject(subjectItem)}
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Fshi lëndën"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <Loader />;
  if (error) {
    showMessage("Error loading subjects.", "error");
    return null;
  }

  const { subjects = [], programs = [] } = data || {}; // ✅ Extract subjects & programs

  // Separate subjects by program type and sort alphabetically by name
  const bachelorSubjects = (subjects?.filter((s: Subject) => s.program?.name === "Bachelor") || [])
    .sort((a: Subject, b: Subject) => a.name.localeCompare(b.name));
  const masterSubjects = (subjects?.filter((s: Subject) => s.program?.name === "Master") || [])
    .sort((a: Subject, b: Subject) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e lëndëve */}
      <Card title="Shto lëndë">
        <AddSubjectForm isAdmin={isAdmin} programs={programs} />
      </Card>

      {/* Bachelor Subjects */}
      <Card title="Lëndët e Bachelorit">
        {bachelorSubjects.length === 0 ? (
          <Alert title="Nuk ka lëndë të Bachelor. Shtoni një lëndë Bachelor më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {bachelorSubjects.map((subjectItem: Subject) => renderSubjectCard(subjectItem))}
          </div>
        )}
      </Card>

      {/* Master Subjects */}
      <Card title="Lëndët e Masterit">
        {masterSubjects.length === 0 ? (
          <Alert title="Nuk ka lëndë të Master. Shtoni një lëndë Master më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {masterSubjects.map((subjectItem: Subject) => renderSubjectCard(subjectItem))}
          </div>
        )}
      </Card>

      {/* Show message when no subjects exist at all */}
      {subjects?.length === 0 && (
        <Card title="Lista e lëndëve">
          <Alert title="Nuk keni ende lëndë. Shtoni një lëndë më sipër!" />
        </Card>
      )}

      {/* Edit Subject Modal */}
      <Modal
        isOpen={editingSubject !== null}
        onClose={() => setEditingSubject(null)}
        title="Modifiko lëndën"
        maxWidth="max-w-lg"
      >
        {editingSubject && (
          <EditSubjectForm
            subject={editingSubject}
            programs={programs}
            onClose={() => setEditingSubject(null)}
          />
        )}
      </Modal>

      {/* Delete Subject Modal */}
      <Modal
        isOpen={deletingSubject !== null}
        onClose={() => setDeletingSubject(null)}
        title="Fshi lëndën"
        maxWidth="max-w-md"
      >
        {deletingSubject && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A jeni të sigurt që doni të fshini lëndën <strong>{deletingSubject.name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              Ky veprim nuk mund të kthehet prapa. Lënda do të fshihet përgjithmonë.
            </p>
            
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={deleteSubjectMutation.isPending}
              >
                Anulo
              </button>
              <button
                onClick={handleDeleteSubject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={deleteSubjectMutation.isPending}
              >
                {deleteSubjectMutation.isPending ? <Loader /> : "Fshi lëndën"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
