"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { UserPlusIcon } from "@heroicons/react/20/solid";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// DevExtreme imports
import DataGrid, {
  Column,
  Grouping,
  GroupPanel,
  Paging,
  Pager,
  SearchPanel,
  HeaderFilter,
  FilterRow,
  Export,
  Sorting,
  ColumnChooser,
  ColumnFixing,
  StateStoring,
  Selection,
  DataGridTypes,
} from "devextreme-react/data-grid";
import { exportDataGrid } from "devextreme/pdf_exporter";
import { exportDataGrid as exportDataGridToExcel } from "devextreme/excel_exporter";
import { jsPDF } from "jspdf";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

//types
import { TeachingAssignment, Program } from "@/types";

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
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<TeachingAssignment | null>(null);
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState<TeachingAssignment[]>([]);
  const [deletingMultipleAssignments, setDeletingMultipleAssignments] = useState<boolean>(false);
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

  // Bulk delete mutation
  const bulkDeleteAssignmentsMutation = useMutation({
    mutationFn: async (assignmentIds: number[]) => {
      const results = await Promise.allSettled(
        assignmentIds.map(id => deleteAssignment(id))
      );
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        showMessage(`${successCount} caktim${successCount !== 1 ? 'e' : ''} u fshinë me sukses!`, "success");
      } else if (successCount === 0) {
        showMessage("Dështoi fshirja e caktimeve!", "error");
      } else {
        showMessage(`${successCount} caktim${successCount !== 1 ? 'e' : ''} u fshinë, ${failCount} dështuan!`, "warning");
      }

      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setSelectedAssignments([]);
      setDeletingMultipleAssignments(false);
    },
    onError: () => {
      showMessage("Dështoi fshirja e caktimeve!", "error");
      setDeletingMultipleAssignments(false);
    },
  });
  //#endregion

  const handleDelete = () => {
    if (deletingAssignment) {
      deleteMutation.mutate(deletingAssignment.id);
    }
  };

  // Handle selection changes in DataGrid
  const handleSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
    setSelectedAssignments(e.selectedRowsData);
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedAssignments.length > 0) {
      setDeletingMultipleAssignments(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedAssignments.length > 0) {
      const assignmentIds = selectedAssignments.map(assignment => assignment.id);
      bulkDeleteAssignmentsMutation.mutate(assignmentIds);
    }
  };

  const handleBulkDeleteCancel = () => {
    setDeletingMultipleAssignments(false);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedAssignments([]);
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

  // Add row numbers to assignments data
  const assignmentsWithRowNumbers = assignments?.map((assignment: TeachingAssignment, index: number) => ({
    ...assignment,
    rowNumber: index + 1,
    professorName: `${assignment.professor?.firstName || ''} ${assignment.professor?.lastName || ''}`.trim(),
    subjectName: assignment.subject?.name || '',
    subjectCode: assignment.subject?.code || '',
    className: assignment.class?.name || '',
    programName: assignment.subject?.program?.name || assignment.class?.program?.name || '',
    typeName: assignment.type?.name || '',
  })) || [];

  //#region functions
  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    if (e.format === 'pdf') {
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Lista e Caktimeve', 15, 20);

      // Add total assignments count
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gjithsej ${assignments?.length || 0} caktim${assignments?.length !== 1 ? 'e' : ''}`, 15, 30);

      // Add date
      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('sq-AL')}`, 15, 40);

      exportDataGrid({
        jsPDFDocument: doc,
        component: e.component,
        indent: 5,
        topLeft: { x: 10, y: 50 },
        columnWidths: [15, 30, 40, 20, 30, 25],
        customizeCell: (options) => {
          if (options.gridCell && options.pdfCell &&
            (options.gridCell.rowType === 'data' || options.gridCell.rowType === 'header')) {
            options.pdfCell.borderColor = '#FFFFFF';
            if (options.gridCell.rowType === 'header') {
              options.pdfCell.font = { size: 9 };
            } else {
              options.pdfCell.font = { size: 8 };
            }
          }
        },
      }).then(() => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageHeight = doc.internal.pageSize.height;
          const footerY = pageHeight - 15;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Gjeneruar nga www.mungesa.app', 15, footerY);
          const centerText = 'Developed by JK';
          const centerX = (doc.internal.pageSize.width / 2) - (doc.getTextWidth(centerText) / 2);
          doc.text(centerText, centerX, footerY);
          const pageText = `${i}/${totalPages}`;
          const pageWidth = doc.internal.pageSize.width;
          const pageTextWidth = doc.getTextWidth(pageText);
          doc.text(pageText, pageWidth - pageTextWidth - 15, footerY);
        }
        doc.save('Caktimet.pdf');
      });
    } else if (e.format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Caktimet');
      exportDataGridToExcel({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Caktimet.xlsx');
        });
      });
    }
  };

  const renderActionsCell = (cellData: { data: TeachingAssignment }) => {
    const assignment = cellData.data;
    return (
      <div className="flex justify-end gap-2">
        <a
          href={`/lectures?professorId=${assignment.professor?.id}&subjectId=${assignment.subject?.id}&classId=${assignment.class?.id}`}
          className="text-indigo-600 hover:text-indigo-900 p-1"
          title="Menaxho Leksionet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
    );
  };

  const renderTypeCell = (cellData: { data: TeachingAssignment }) => {
    const assignment = cellData.data;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${assignment.type?.name === 'Leksion'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800'
        }`}>
        {assignment.type?.name}
      </span>
    );
  };
  //#endregion

  return (
    <div className="space-y-6">
      {/* Add Assignment Form */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Cakto Profesor në Lëndë për Klasë</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAssignmentForm(!showAddAssignmentForm)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAddAssignmentForm ? 'Fshih' : 'Shfaq'}
            </button>
          </div>

          {showAddAssignmentForm && (
            <AddAssignmentForm
              isAdmin={isAdmin}
              professors={professors}
              subjects={subjects}
              classes={classes}
              programs={programs}
              teachingTypes={teachingTypes}
            />
          )}
        </div>
      </Card>

      {/* Assignments List */}
      <Card title="Lista e Caktimeve">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <Alert title="Gabim gjatë leximit të listës së caktimeve" />
        ) : (
          <div className="mt-6">
            {/* Bulk Actions Bar */}
            {selectedAssignments.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedAssignments.length} caktim{selectedAssignments.length !== 1 ? 'e' : ''} të zgjedhura
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
                      Fshi të zgjedhurat ({selectedAssignments.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            <DataGrid
              dataSource={assignmentsWithRowNumbers}
              allowColumnReordering={true}
              allowColumnResizing={true}
              columnAutoWidth={true}
              showBorders={true}
              showRowLines={true}
              showColumnLines={true}
              rowAlternationEnabled={true}
              hoverStateEnabled={true}
              keyExpr="id"
              className="dx-datagrid-borders"
              onExporting={onExporting}
              onSelectionChanged={handleSelectionChanged}
              noDataText="Nuk ka caktime. Shtoni një caktim më sipër!"
              searchPanel={{ visible: true, placeholder: "Kërko..." }}
              loadPanel={{ enabled: false }}
            >
              {/* Enable features */}
              <Selection mode="multiple" showCheckBoxesMode="always" />
              <Grouping autoExpandAll={true} />
              <GroupPanel visible={true} />
              <SearchPanel visible={true} highlightCaseSensitive={true} />
              <Sorting mode="multiple" />
              <FilterRow visible={true} />
              <HeaderFilter visible={true} />
              <ColumnChooser enabled={true} />
              <ColumnFixing enabled={true} />
              <Paging defaultPageSize={25} />
              <Pager
                showPageSizeSelector={true}
                allowedPageSizes={[10, 25, 50, 100]}
                showInfo={true}
              />
              <StateStoring enabled={true} type="localStorage" storageKey="assignmentsDataGrid" />

              {/* Export functionality */}
              <Export enabled={true} allowExportSelectedData={true} formats={["xlsx", "pdf"]} />

              {/* Columns */}
              <Column
                dataField="rowNumber"
                caption="#"
                width={60}
                visible={true}
                allowSorting={false}
                allowFiltering={false}
                allowGrouping={false}
                allowExporting={true}
                dataType="number"
              />
              <Column
                dataField="professorName"
                caption="Profesori"
                allowGrouping={true}
                allowSorting={true}
                allowFiltering={true}
              />
              <Column
                dataField="subjectName"
                caption="Lënda"
                allowGrouping={true}
                allowSorting={true}
                allowFiltering={true}
              />
              <Column
                dataField="subjectCode"
                caption="Kodi"
                width={100}
                allowGrouping={false}
                allowSorting={true}
                allowFiltering={true}
              />
              <Column
                dataField="className"
                caption="Klasa"
                allowGrouping={true}
                allowSorting={true}
                allowFiltering={true}
              />
              <Column
                dataField="programName"
                caption="Programi"
                groupIndex={0}
                allowGrouping={true}
                allowSorting={true}
                allowFiltering={true}
              />
              <Column
                dataField="typeName"
                caption="Tipi"
                width={120}
                allowGrouping={true}
                allowSorting={true}
                allowFiltering={true}
                cellRender={renderTypeCell}
              />
              {isAdmin === "true" && (
                <Column
                  caption="Veprime"
                  width={110}
                  allowSorting={false}
                  allowFiltering={false}
                  allowGrouping={false}
                  allowExporting={false}
                  cellRender={renderActionsCell}
                />
              )}
            </DataGrid>

            {/* Footer with stats */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 mt-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Gjithsej {assignments?.length} caktim{assignments?.length !== 1 ? 'e' : ''}</span>
                  {selectedAssignments.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      ({selectedAssignments.length} të zgjedhura)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {programs.map((program: Program) => {
                    const programAssignments = assignments?.filter((a: TeachingAssignment) =>
                      a.subject?.program?.id === program.id || a.class?.program?.id === program.id
                    ) || [];
                    return programAssignments.length > 0 ? (
                      <span
                        key={program.id}
                        className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full"
                      >
                        {program.name}: {programAssignments.length}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
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
        <Modal
          isOpen={!!deletingAssignment}
          onClose={() => setDeletingAssignment(null)}
          title="Konfirmo fshirjen"
        >
          <div className="p-6">
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
              ?
            </p>
            <p className="text-sm text-red-600 mb-6">
              Ky veprim nuk mund të zhbëhet.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingAssignment(null)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulo
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? "Duke fshirë..." : "Fshi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {deletingMultipleAssignments && (
        <Modal
          isOpen={true}
          onClose={handleBulkDeleteCancel}
          title="Konfirmo fshirjen e shumë caktimeve"
        >
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Jeni të sigurt që dëshironi të fshini {selectedAssignments.length} caktim{selectedAssignments.length !== 1 ? 'e' : ''}?
            </p>
            <div className="bg-gray-50 rounded-md p-3 mb-6 max-h-40 overflow-y-auto">
              <ul className="text-sm text-gray-700 space-y-1">
                {selectedAssignments.map(assignment => (
                  <li key={assignment.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>
                      {assignment.professor?.firstName} {assignment.professor?.lastName} - {assignment.subject?.name} ({assignment.class?.name})
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
                disabled={bulkDeleteAssignmentsMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulo
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteAssignmentsMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkDeleteAssignmentsMutation.isPending ? "Duke fshirë..." : `Fshi ${selectedAssignments.length} caktim${selectedAssignments.length !== 1 ? 'e' : ''}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
