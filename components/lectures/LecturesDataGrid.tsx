"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PencilIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/16/solid";

// DevExtreme imports
import DataGrid, {
  Column,
  Grouping,
  GroupPanel,
  Paging,
  Pager,
  SearchPanel,
  HeaderFilter,
  Export,
  Sorting,
  ColumnChooser,
  ColumnFixing,
  StateStoring,
  Selection,
} from "devextreme-react/data-grid";
import { exportDataGrid } from "devextreme/pdf_exporter";
import { exportDataGrid as exportDataGridToExcel } from "devextreme/excel_exporter";
import { jsPDF } from "jspdf";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

//types
import { Lecture, LecturesResponse, TeachingAssignmentWithDetails } from "@/types";

// Extended type for DataGrid rows
interface LectureWithRowData {
  id: number;
  date: string;
  teachingAssignmentId: number;
  teachingAssignment: {
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
  };
  attendance?: Array<{ status: string }>;
  rowNumber: number;
  professorName: string;
  subjectName: string;
  subjectCode: string;
  className: string;
  typeName: string;
  dateFormatted: string;
  attendanceCount: number;
  presentCount: number;
  participatedCount: number;
  absentCount: number;
  hasAttendance: boolean;
  // Keep the original flat structure for compatibility with EditLectureForm
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

//components
import Loader from "@/components/ui/Loader";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import EditLectureForm from "@/components/lectures/EditLectureForm";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

interface LecturesDataGridProps {
  assignments: TeachingAssignmentWithDetails[];
}

export default function LecturesDataGrid({ assignments }: LecturesDataGridProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [selectedLectures, setSelectedLectures] = useState<Lecture[]>([]);
  const [deletingMultipleLectures, setDeletingMultipleLectures] = useState<boolean>(false);

  const { showMessage } = useNotify();
  const queryClient = useQueryClient();

  // Fetch lectures
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

  // Prepare data for DataGrid
  const lecturesWithRowNumbers = useMemo((): LectureWithRowData[] => {
    if (!data?.lectures) return [];

    return data.lectures.map((lecture, index) => {
      return {
        ...lecture,
        date: typeof lecture.date === 'string' ? lecture.date : lecture.date.toISOString(),
        rowNumber: index + 1,
        professorName: `${lecture.teachingAssignment.professor.firstName} ${lecture.teachingAssignment.professor.lastName}`,
        subjectName: lecture.teachingAssignment.subject.name,
        subjectCode: lecture.teachingAssignment.subject.code,
        className: lecture.teachingAssignment.class.name,
        typeName: lecture.teachingAssignment.type.name,
        dateFormatted: (() => {
          const date = new Date(lecture.date);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        })(),
        attendanceCount: lecture.attendance?.length || 0,
        presentCount: lecture.attendance?.filter((a: { status: string }) => a.status === "PRESENT").length || 0,
        participatedCount: lecture.attendance?.filter((a: { status: string }) => a.status === "PARTICIPATED").length || 0,
        absentCount: lecture.attendance?.filter((a: { status: string }) => a.status === "ABSENT").length || 0,
        hasAttendance: (lecture.attendance?.length || 0) > 0,
        // Keep the original flat structure for compatibility with EditLectureForm
        professor: lecture.teachingAssignment.professor,
        subject: lecture.teachingAssignment.subject,
        class: lecture.teachingAssignment.class,
        type: lecture.teachingAssignment.type
      };
    });
  }, [data]);

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

  // Bulk delete mutation
  const bulkDeleteLecturesMutation = useMutation({
    mutationFn: async (lectureIds: number[]) => {
      const results = await Promise.allSettled(
        lectureIds.map(id => deleteLectureMutation.mutateAsync(id))
      );
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage(`${successCount} leksion${successCount !== 1 ? 'e' : ''} u fshinë me sukses!`, "success");
      }
      if (failCount > 0) {
        showMessage(`${failCount} leksion${failCount !== 1 ? 'e' : ''} nuk u fshinë!`, "error");
      }

      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      setSelectedLectures([]);
      setDeletingMultipleLectures(false);
    },
    onError: () => {
      showMessage("Gabim gjatë fshirjes së leksioneve!", "error");
      setDeletingMultipleLectures(false);
    },
  });

  // Handle selection change
  const handleSelectionChanged = (e: { selectedRowsData?: Lecture[] }) => {
    setSelectedLectures(e.selectedRowsData || []);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedLectures([]);
  };

  // Handle bulk delete click
  const handleBulkDeleteClick = () => {
    if (selectedLectures.length === 0) return;

    const confirmMessage = `A jeni të sigurt që dëshironi të fshini ${selectedLectures.length} leksion${selectedLectures.length !== 1 ? 'e' : ''}?`;
    if (window.confirm(confirmMessage)) {
      setDeletingMultipleLectures(true);
      const lectureIds = selectedLectures.map(lecture => lecture.id);
      bulkDeleteLecturesMutation.mutate(lectureIds);
    }
  };

  const handleEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setIsEditModalOpen(true);
  };

  const handleDelete = (lecture: Lecture) => {
    const subjectName = lecture.teachingAssignment?.subject?.name || 'Lëndë të panjohur';
    const className = lecture.teachingAssignment?.class?.name || 'Klasë të panjohur';

    if (
      window.confirm(
        `A jeni të sigurt që dëshironi të fshini leksionin për ${subjectName} në ${className}?`
      )
    ) {
      deleteLectureMutation.mutate(lecture.id);
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
      doc.text('Leksionet', 15, 25);

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
        doc.save('Leksionet.pdf');
      });
    } else if (e.format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Leksionet');
      exportDataGridToExcel({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Leksionet.xlsx');
        });
      });
    }
  };

  // Cell renderers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTypeCell = (cellData: any) => {
    const type = cellData.value;
    if (!type || type === 'Pa tip') {
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
  const renderAttendanceCell = (cellData: any) => {
    const lecture = cellData.data;

    if (!lecture.hasAttendance) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Pa prezencë
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            ✓ {lecture.presentCount}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            ⭐ {lecture.participatedCount}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            ✗ {lecture.absentCount}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Total: {lecture.attendanceCount} studentë
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActionsCell = (cellData: any) => {
    const lecture = cellData.data;

    return (
      <div className="flex justify-center gap-2">
        <a
          href={`/attendance?classId=${lecture.class.id}&lectureId=${lecture.id}`}
          className="text-blue-600 hover:text-blue-900 p-1"
          title="Menaxho Prezencën"
        >
          <ClipboardDocumentCheckIcon className="w-4 h-4" />
        </a>
        {data?.isAdmin && (
          <>
            <button
              onClick={() => handleEdit(lecture)}
              className="text-indigo-600 hover:text-indigo-900 p-1 cursor-pointer"
              title="Redakto"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(lecture)}
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

  if (isLoading) return <Loader />;
  if (error) {
    return <Alert type="error" title="Dështoi ngarkimi i leksioneve!" />;
  }

  if (!data) {
    return <Alert type="warning" title="" />;
  }

  const { isAdmin } = data;

  return (
    <>
      {/* DataGrid */}
      <Card title="Lista e Leksioneve">
        {lecturesWithRowNumbers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nuk ka leksione të regjistruara.</p>
          </div>
        ) : (
          <div>
            {/* Selection controls */}
            {selectedLectures.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedLectures.length} leksion{selectedLectures.length !== 1 ? 'e' : ''} të zgjedhura
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearSelection}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
                    >
                      Pastro zgjedhjen
                    </button>
                    {isAdmin && (
                      <button
                        onClick={handleBulkDeleteClick}
                        disabled={deletingMultipleLectures}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingMultipleLectures ? 'Duke fshirë...' : `Fshi të zgjedhurat (${selectedLectures.length})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DataGrid
              dataSource={lecturesWithRowNumbers as unknown as Lecture[]}
              allowColumnReordering={true}
              allowColumnResizing={false}
              columnAutoWidth={true}
              showBorders={false}
              showRowLines={false}
              showColumnLines={true}
              rowAlternationEnabled={true}
              hoverStateEnabled={true}
              keyExpr="id"
              className="dx-datagrid-borders"
              onExporting={onExporting}
              onSelectionChanged={handleSelectionChanged}
              noDataText="Nuk ka leksione. Shtoni një leksion më sipër!"
              searchPanel={{ visible: true, placeholder: "Kërko..." }}
              loadPanel={{ enabled: false }}
            >
              {/* Enable features */}
              <Selection mode="multiple" showCheckBoxesMode="always" />
              <Grouping autoExpandAll={true} />
              <GroupPanel visible={true} emptyPanelText="Bëji drag një header kolone këtu për ta grupuar sipas asaj kolone" />
              <SearchPanel visible={true} highlightCaseSensitive={true} />
              <Sorting mode="multiple" />
              <HeaderFilter visible={true} />
              <ColumnChooser enabled={true} title="Zgjidh Kolonat" emptyPanelText="Shtoni kolona këtu për ta fshehur atë" />
              <ColumnFixing enabled={true} />
              <Paging defaultPageSize={25} />
              <Pager
                showPageSizeSelector={true}
                allowedPageSizes={[10, 25, 50, 100]}
                showInfo={true}
              />
              <StateStoring enabled={true} type="localStorage" storageKey="lecturesDataGrid" />

              {/* Export functionality */}
              <Export
                enabled={true}
                allowExportSelectedData={true}
                formats={["xlsx", "pdf"]}
                texts={{
                  // exportAll: "Eksporto të gjitha",
                  // exportSelectedRows: "Eksporto të zgjedhurat",
                  // exportTo: "Eksporto në"
                }} />

              {/* Columns */}
              <Column
                dataField="rowNumber"
                caption="#"
                width={60}
                visible={true}
                allowSorting={false}
                allowGrouping={false}
                allowExporting={true}
                dataType="number"
              />
              <Column
                dataField="dateFormatted"
                caption="Data"
                allowGrouping={false}
                allowSorting={true}
                dataType="string"
                width={120}
              />
              <Column
                dataField="subjectName"
                caption="Lënda"
                allowGrouping={true}
                allowSorting={true}
              />
              <Column
                dataField="subjectCode"
                caption="Kodi"
                width={100}
                allowGrouping={false}
                allowSorting={true}
              />
              <Column
                dataField="className"
                caption="Klasa"
                allowGrouping={true}
                allowSorting={true}
              />
              <Column
                dataField="typeName"
                caption="Tipi"
                width={120}
                allowGrouping={true}
                allowSorting={true}
                cellRender={renderTypeCell}
              />
              {isAdmin && (
                <Column
                  dataField="professorName"
                  caption="Profesori"
                  allowGrouping={true}
                  allowSorting={true}
                />
              )}
              <Column
                caption="Prezenca"
                width={200}
                allowSorting={false}
                allowGrouping={false}
                allowExporting={false}
                cellRender={renderAttendanceCell}
              />
              <Column
                caption="Veprime"
                width={140}
                allowSorting={false}
                allowGrouping={false}
                allowExporting={false}
                cellRender={renderActionsCell}
              />
            </DataGrid>

            {/* Footer with stats */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Gjithsej {lecturesWithRowNumbers.length} leksion{lecturesWithRowNumbers.length !== 1 ? 'e' : ''}</span>
                  {selectedLectures.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      ({selectedLectures.length} të zgjedhura)
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Me prezencë: {lecturesWithRowNumbers.filter(l => l.hasAttendance).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Lecture Modal */}
      {editingLecture && editingLecture.teachingAssignment && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLecture(null);
          }}
          title="Redakto Leksionin"
        >
          <EditLectureForm
            lecture={{
              id: editingLecture.id,
              date: editingLecture.date,
              professor: editingLecture.teachingAssignment.professor!,
              subject: editingLecture.teachingAssignment.subject!,
              class: editingLecture.teachingAssignment.class!,
            }}
            assignments={assignments}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingLecture(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}