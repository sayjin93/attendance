"use client";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// DevExtreme imports
import { Column, DataGridTypes } from "devextreme-react/data-grid";

//types
import { Class } from "@/types";

//services
import { classService } from "@/services";

//utils
import { getLabelColor } from "@/lib/utils";
import { createExportHandler } from "@/lib/export";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/ui/Loader";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import AddClassForm from "@/components/classes/AddClassForm";
import EditClassForm from "@/components/classes/EditClassForm";
import Modal from "@/components/ui/Modal";
import CommonDataGrid from "@/components/ui/CommonDataGrid";

export default function ClassesPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  const router = useRouter();
  //#endregion

  //#region states
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<Class[]>([]);
  const [deletingMultipleClasses, setDeletingMultipleClasses] = useState<boolean>(false);
  //#endregion

  //#region useQuery
  const { data: classes = [], isLoading, error } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: () => classService.getAll(),
    enabled: isAdmin === "true",
  });

  // Add row numbers to classes data
  const classesWithRowNumbers = useMemo(() => classes?.map((classItem: Class, index: number) => {
    // Format subjects for export
    const uniqueSubjects = classItem.teachingAssignments
      ? Array.from(
        new Map(
          classItem.teachingAssignments
            .filter((ta) => ta.subject)
            .map((ta) => [ta.subject!.id, ta.subject!])
        ).values()
      )
      : [];

    const subjectsText = uniqueSubjects.length > 0
      ? uniqueSubjects.map((subject) => subject.name).join(', ')
      : 'Nuk ka kurse';

    return {
      ...classItem,
      rowNumber: index + 1,
      programName: classItem.program?.name || 'Nuk ka program',
      subjectCount: classItem.teachingAssignments?.length || 0,
      studentCount: classItem.students?.length || 0,
      subjectsText: subjectsText,
    };
  }) || [], [classes]);
  //#endregion

  //#region mutations
  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => classService.delete(id),
    onSuccess: () => {
      showMessage("Klasa u fshi me sukses!", "success");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setDeletingClass(null);
    },
    onError: () => {
      showMessage("Dështoi fshirja e klasës!", "error");
    },
  });

  // Bulk delete mutation
  const bulkDeleteClassesMutation = useMutation({
    mutationFn: async (classIds: number[]) => {
      const results = await Promise.allSettled(
        classIds.map(id => classService.delete(id))
      );
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        showMessage(`${successCount} klas${successCount !== 1 ? 'a' : 'ë'} u fshinë me sukses!`, "success");
      } else if (successCount === 0) {
        showMessage("Dështoi fshirja e klasave!", "error");
      } else {
        showMessage(`${successCount} klas${successCount !== 1 ? 'a' : 'ë'} u fshinë, ${failCount} dështuan!`, "warning");
      }

      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setSelectedClasses([]);
      setDeletingMultipleClasses(false);
    },
    onError: () => {
      showMessage("Dështoi fshirja e klasave!", "error");
      setDeletingMultipleClasses(false);
    },
  });
  //#endregion

  //#region functions
  const onExporting = useMemo(() => createExportHandler({
    title: "Lista e Klasave",
    subtitle: `Gjithsej ${classes?.length || 0} klas${classes?.length !== 1 ? "a" : "ë"}`,
    fileName: "Klasat",
    columnWidths: [15, 30, 70, 20, 20],
  }), [classes?.length]);

  const handleDeleteClass = () => {
    if (deletingClass) {
      deleteClassMutation.mutate(deletingClass.id);
    }
  };

  const renderSubjectsCell = (cellData: { data: Class; value: string }) => {
    const classItem = cellData.data;
    const uniqueSubjects = classItem.teachingAssignments
      ? Array.from(
        new Map(
          classItem.teachingAssignments
            .filter((ta) => ta.subject)
            .map((ta) => [ta.subject!.id, ta.subject!])
        ).values()
      )
      : [];

    if (uniqueSubjects.length === 0) {
      return <span className="text-gray-400 italic text-sm">Nuk ka kurse</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {uniqueSubjects.slice(0, 2).map((subject) => {
          const colors = getLabelColor(subject.id);
          return (
            <span
              key={subject.id}
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
            >
              {subject.name}
            </span>
          );
        })}
        {uniqueSubjects.length > 2 && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
            +{uniqueSubjects.length - 2} më shumë
          </span>
        )}
      </div>
    );
  };

  const renderStudentsCell = (cellData: { data: Class; value: number }) => {
    const classItem = cellData.data;
    const studentCount = classItem.students?.length || 0;

    return (
      <button
        onClick={() => {
          // Store the selected program and class in localStorage for the students page
          if (typeof window !== 'undefined') {
            localStorage.setItem('selectedProgramId', classItem.program?.id?.toString() || '');
            localStorage.setItem('selectedClassId', classItem.id.toString());
          }
          // Navigate to students page
          router.push('/students');
        }}
        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
        title="Shiko studentët e kësaj klase"
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
        {studentCount} student{studentCount !== 1 ? 'ë' : ''}
      </button>
    );
  };

  const renderActionsCell = (cellData: { data: Class }) => {
    const classItem = cellData.data;
    return (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditingClass(classItem)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
          title="Modifiko klasën"
        >
          <PencilIcon className="w-4 h-4" />

        </button>
        <button
          onClick={() => setDeletingClass(classItem)}
          className="text-red-600 hover:text-red-900 p-1 rounded cursor-pointer"
          title="Fshi klasën"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Handle selection changes in DataGrid
  const handleSelectionChanged = useCallback((e: DataGridTypes.SelectionChangedEvent) => {
    setSelectedClasses(e.selectedRowsData);
  }, []);

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedClasses.length > 0) {
      setDeletingMultipleClasses(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedClasses.length > 0) {
      const classIds = selectedClasses.map(classItem => classItem.id);
      bulkDeleteClassesMutation.mutate(classIds);
    }
  };

  const handleBulkDeleteCancel = () => {
    setDeletingMultipleClasses(false);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedClasses([]);
  };
  //#endregion

  // Filter programs from classes
  const programs = useMemo(() => Array.from(
    new Map(
      classes
        .filter(c => c.program) // Filter out undefined
        .map(c => [c.program!.id, c.program!]) // Non-null assertion
    ).values()
  ), [classes]);

  return (
    <div className="flex flex-col gap-4">
      {/* Add Class Form */}
      <Card title="Shto klasë të re">
        <AddClassForm isAdmin={isAdmin} programs={programs} />
      </Card>

      {/* Classes List */}
      <Card title="Lista e klasave">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <Alert title="Gabim gjatë leximit të listës së klasave" />
        ) : (
          <div className="mt-6">
            {/* Bulk Actions Bar */}
            {selectedClasses.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedClasses.length} klas{selectedClasses.length !== 1 ? 'a' : 'ë'} të zgjedhura
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearSelection}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
                    >
                      Pastro zgjedhjen
                    </button>
                    <button
                      onClick={handleBulkDeleteClick}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150 cursor-pointer"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Fshi të zgjedhurat ({selectedClasses.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            <CommonDataGrid
              dataSource={classesWithRowNumbers}
              storageKey="classesDataGrid"
              onExporting={onExporting}
              onSelectionChanged={handleSelectionChanged}
            >
              {/* Columns */}
              <Column
                dataField="name"
                caption="Emri i Klasës"
                allowGrouping={false}
              />
              <Column
                dataField="programName"
                caption="Programi"
                groupIndex={0}
              />
              <Column
                dataField="subjectsText"
                caption="Kurset"
                cellRender={renderSubjectsCell}
              />
              <Column
                dataField="subjectCount"
                caption="Nr. Kursesh"
                width={120}
                allowGrouping={false}
                dataType="number"
              />
              <Column
                dataField="studentCount"
                caption="Studentët"
                width={130}
                allowGrouping={false}
                cellRender={renderStudentsCell}
              />
              {isAdmin === "true" && (
                <Column
                  caption="Veprime"
                  width={75}
                  allowSorting={false}
                  allowFiltering={false}
                  allowGrouping={false}
                  allowExporting={false}
                  cellRender={renderActionsCell}
                />
              )}
            </CommonDataGrid>

            {/* Footer with stats */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 mt-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Gjithsej {classes?.length} klas{classes?.length !== 1 ? 'a' : 'ë'}</span>
                  <span>
                    {classes?.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)} studentë total
                  </span>
                  {selectedClasses.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      ({selectedClasses.length} të zgjedhura)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {programs.map(program => {
                    const programClasses = classes?.filter(c => c.program?.id === program.id) || [];
                    return (
                      <span
                        key={program.id}
                        className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full"
                      >
                        {program.name}: {programClasses.length}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

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
                {deleteClassMutation.isPending ? <Loader size="w-4 h-4" /> : "Fshi klasën"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      {deletingMultipleClasses && (
        <Modal
          isOpen={true}
          onClose={handleBulkDeleteCancel}
          title="Konfirmo fshirjen e shumë klasave"
        >
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Jeni të sigurt që dëshironi të fshini {selectedClasses.length} klas{selectedClasses.length !== 1 ? 'a' : 'ë'}?
            </p>
            <div className="bg-gray-50 rounded-md p-3 mb-6 max-h-40 overflow-y-auto">
              <ul className="text-sm text-gray-700 space-y-1">
                {selectedClasses.map(classItem => (
                  <li key={classItem.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{classItem.name}</span>
                    <span className="text-xs text-gray-500">
                      ({classItem.program?.name})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-red-600 mb-6">
              Ky veprim nuk mund të zhbëhet.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleBulkDeleteCancel}
                disabled={bulkDeleteClassesMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulo
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteClassesMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkDeleteClassesMutation.isPending ? "Duke fshirë..." : `Fshi ${selectedClasses.length} klas${selectedClasses.length !== 1 ? 'a' : 'ë'}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}