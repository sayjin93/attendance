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
        className="relative w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
      >
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold">{classItem.name}</h2>
          
          {/* Display subjects instead of program */}
          <div className="mt-2 mb-3">
            {uniqueSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-center">
                {uniqueSubjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs italic">Nuk ka kurse</p>
            )}
          </div>
        
        
          {isAdmin === "true" && (
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setEditingClass(classItem)}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Modifiko klasën"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingClass(classItem)}
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Fshi klasën"
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
  };  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e klasave */}
      <Card title="Shto klasë">
        <AddClassForm isAdmin={isAdmin} programs={programs} />
      </Card>

      {/* Bachelor Classes */}
      <Card title="Klasat e Bachelorit">
        {bachelorClasses.length === 0 ? (
          <Alert title="Nuk ka klasa të Bachelor. Shtoni një klasë Bachelor më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {bachelorClasses.map((classItem: Class) => renderClassCard(classItem))}
          </div>
        )}
      </Card>

      {/* Master Classes */}
      <Card title="Klasat e Masterit">
        {masterClasses.length === 0 ? (
          <Alert title="Nuk ka klasa të Master. Shtoni një klasë Master më sipër!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
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
