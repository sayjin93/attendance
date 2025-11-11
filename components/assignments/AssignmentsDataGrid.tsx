"use client";
import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

// DevExtreme imports
import { Column } from "devextreme-react/data-grid";
import { exportDataGrid } from "devextreme/pdf_exporter";
import { exportDataGrid as exportDataGridToExcel } from "devextreme/excel_exporter";
import { jsPDF } from "jspdf";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

//types
import { TeachingAssignment, Professor, Subject, Class, TeachingType } from "@/types";

//hooks
import { deleteAssignment } from "@/hooks/functions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import EditAssignmentForm from "@/components/assignments/EditAssignmentForm";
import CommonDataGrid from "@/components/ui/CommonDataGrid";

interface AssignmentsDataGridProps {
  assignments: TeachingAssignment[];
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  teachingTypes: TeachingType[];
  isAdmin: string;
}

export default function AssignmentsDataGrid({
  assignments,
  professors,
  subjects,
  classes,
  teachingTypes,
  isAdmin,
}: AssignmentsDataGridProps) {
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<TeachingAssignment[]>([]);
  const [deletingMultipleAssignments, setDeletingMultipleAssignments] = useState<boolean>(false);

  const { showMessage } = useNotify();
  const queryClient = useQueryClient();

  // Add row numbers to assignments data
  const assignmentsWithRowNumbers = useMemo(() => {
    return assignments?.map((assignment: TeachingAssignment, index: number) => ({
      ...assignment,
      rowNumber: index + 1,
      professorName: `${assignment.professor?.firstName || ''} ${assignment.professor?.lastName || ''}`.trim(),
      subjectName: assignment.subject?.name || '',
      subjectCode: assignment.subject?.code || '',
      className: assignment.class?.name || '',
      programName: assignment.subject?.program?.name || assignment.class?.program?.name || '',
      typeName: assignment.type?.name || '',
    })) || [];
  }, [assignments]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAssignment(id),
    onSuccess: () => {
      showMessage("Caktimi u fshi me sukses!", "success");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
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

      if (successCount > 0) {
        showMessage(`${successCount} caktim${successCount !== 1 ? 'e' : ''} u fshinë me sukses!`, "success");
      }
      if (failCount > 0) {
        showMessage(`${failCount} caktim${failCount !== 1 ? 'e' : ''} nuk u fshinë!`, "error");
      }

      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setSelectedAssignments([]);
      setDeletingMultipleAssignments(false);
    },
    onError: () => {
      showMessage("Gabim gjatë fshirjes së caktimeve!", "error");
      setDeletingMultipleAssignments(false);
    },
  });

  // Handle selection change
  const handleSelectionChanged = (e: { selectedRowsData?: TeachingAssignment[] }) => {
    setSelectedAssignments(e.selectedRowsData || []);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedAssignments([]);
  };

  // Handle bulk delete click
  const handleBulkDeleteClick = () => {
    if (selectedAssignments.length === 0) return;

    const confirmMessage = `A jeni të sigurt që dëshironi të fshini ${selectedAssignments.length} caktim${selectedAssignments.length !== 1 ? 'e' : ''}?`;
    if (window.confirm(confirmMessage)) {
      setDeletingMultipleAssignments(true);
      const assignmentIds = selectedAssignments.map(assignment => assignment.id);
      bulkDeleteAssignmentsMutation.mutate(assignmentIds);
    }
  };

  const handleEdit = (assignment: TeachingAssignment) => {
    setEditingAssignment(assignment);
  };

  const handleDelete = (assignment: TeachingAssignment) => {
    if (
      window.confirm(
        `A jeni të sigurt që dëshironi të fshini caktimin për ${assignment.subject?.name} në ${assignment.class?.name}?`
      )
    ) {
      deleteMutation.mutate(assignment.id);
    }
  };

  // Export functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onExporting = (e: any) => {
    if (e.format === 'pdf') {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Caktimet', 15, 25);

      // Add generation date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gjeneruar më: ${new Date().toLocaleDateString('sq-AL')}`, 15, 35);

      exportDataGrid({
        jsPDFDocument: doc,
        component: e.component,
        indent: 5,
        topLeft: { x: 10, y: 50 },
        columnWidths: [15, 25, 30, 30, 25, 20, 30],
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

  // Cell renderers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTypeCell = (cellData: any) => {
    const type = cellData.value;
    if (!type) {
      return <span className="text-xs text-gray-400">-</span>;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type === 'Leksion'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800'
        }`}>
        {type}
      </span>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActionsCell = (cellData: any) => {
    const assignment = cellData.data;

    return (
      <div className="flex justify-center gap-2">
        <a
          href={`/lectures?professorId=${assignment.professor?.id}&subjectId=${assignment.subject?.id}&classId=${assignment.class?.id}`}
          className="text-blue-600 hover:text-blue-900 p-1"
          title="Shiko Leksionet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </a>
        {isAdmin === "true" && (
          <>
            <button
              onClick={() => handleEdit(assignment)}
              className="text-indigo-600 hover:text-indigo-900 p-1 cursor-pointer"
              title="Redakto"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(assignment)}
              className="text-red-600 hover:text-red-900 p-1 cursor-pointer"
              title="Fshi"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* DataGrid */}
      <Card title="Lista e Caktimeve">
        {assignmentsWithRowNumbers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nuk ka caktime të regjistruara.</p>
          </div>
        ) : (
          <div>
            {/* Selection controls */}
            {selectedAssignments.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedAssignments.length} caktim{selectedAssignments.length !== 1 ? 'e' : ''} të zgjedhura
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearSelection}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
                    >
                      Pastro zgjedhjen
                    </button>
                    {isAdmin === "true" && (
                      <button
                        onClick={handleBulkDeleteClick}
                        disabled={deletingMultipleAssignments}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingMultipleAssignments ? 'Duke fshirë...' : `Fshi të zgjedhurat (${selectedAssignments.length})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <CommonDataGrid
              dataSource={assignmentsWithRowNumbers as unknown as TeachingAssignment[]}
              storageKey="assignmentsDataGrid"
              onExporting={onExporting}
              onSelectionChanged={handleSelectionChanged}
              keyExpr="id"
            >
              <Column
                dataField="professorName"
                caption="Profesori"
              />
              <Column
                dataField="subjectName"
                caption="Lënda"
              />
              <Column
                dataField="subjectCode"
                caption="Kodi"
                width={100}
                allowGrouping={false}
              />
              <Column
                dataField="className"
                caption="Klasa"
              />
              <Column
                dataField="programName"
                caption="Programi"
              />
              <Column
                dataField="typeName"
                caption="Tipi"
                width={120}
                cellRender={renderTypeCell}
              />
              <Column
                caption="Veprime"
                width={140}
                allowSorting={false}
                allowGrouping={false}
                allowExporting={false}
                cellRender={renderActionsCell}
              />
            </CommonDataGrid>

            {/* Footer with stats */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Gjithsej {assignmentsWithRowNumbers.length} caktim{assignmentsWithRowNumbers.length !== 1 ? 'e' : ''}</span>
                  {selectedAssignments.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      ({selectedAssignments.length} të zgjedhura)
                    </span>
                  )}
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
          title="Redakto Caktimin"
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
    </>
  );
}