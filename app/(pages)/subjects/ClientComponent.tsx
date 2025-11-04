"use client";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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

  // Color palette for classes - consistent colors based on class ID
  const classColors = [
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

  // Function to get consistent color for a class based on its ID
  const getClassColor = (classId: number) => {
    return classColors[classId % classColors.length];
  };
  //#endregion

  //#region state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [deletingMultipleSubjects, setDeletingMultipleSubjects] = useState<boolean>(false);
  const [tooltipData, setTooltipData] = useState<{
    show: boolean;
    classes: Array<{ id: number; name: string }>;
    position: { x: number; y: number };
  }>({
    show: false,
    classes: [],
    position: { x: 0, y: 0 }
  });
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

  // Bulk delete mutation
  const bulkDeleteSubjectsMutation = useMutation({
    mutationFn: async (subjectIds: number[]) => {
      const results = await Promise.allSettled(
        subjectIds.map(id => deleteSubject(id))
      );
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        showMessage(`${successCount} lënd${successCount !== 1 ? 'ë' : 'a'} u fshinë me sukses!`, "success");
      } else if (successCount === 0) {
        showMessage("Dështoi fshirja e lëndëve!", "error");
      } else {
        showMessage(`${successCount} lënd${successCount !== 1 ? 'ë' : 'a'} u fshinë, ${failCount} dështuan!`, "warning");
      }

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setSelectedSubjects([]);
      setDeletingMultipleSubjects(false);
    },
    onError: () => {
      showMessage("Dështoi fshirja e lëndëve!", "error");
      setDeletingMultipleSubjects(false);
    },
  });
  //#endregion

  //#region functions
  const handleDeleteSubject = () => {
    if (deletingSubject) {
      deleteSubjectMutation.mutate(deletingSubject.id);
    }
  };

  const handleTooltipShow = (event: React.MouseEvent, classes: Array<{ id: number; name: string }>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      show: true,
      classes,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  };

  const handleTooltipHide = () => {
    setTooltipData(prev => ({ ...prev, show: false }));
  };
  //#endregion

  // Get data first
  const { subjects = [], programs = [] } = data || {};

  // Sort subjects by name
  const sortedSubjects = subjects.sort((a: Subject, b: Subject) => a.name.localeCompare(b.name));

  // Prepare data with row numbers (must be before early returns)
  const subjectsWithRowNumbers = useMemo(() => {
    return sortedSubjects.map((subject: Subject, index: number) => {
      // Extract unique classes from teaching assignments
      const uniqueClasses = subject.teachingAssignments
        ? Array.from(
          new Map(
            subject.teachingAssignments
              .filter(ta => ta.class)
              .map(ta => [ta.class!.id, ta.class!])
          ).values()
        )
        : [];

      return {
        ...subject,
        rowNumber: index + 1,
        programName: subject.program?.name || '-',
        codeDisplay: subject.code || '-',
        classesText: uniqueClasses.length > 0
          ? uniqueClasses.map(cls => cls.name).join(', ')
          : 'Nuk ka klasa'
      };
    });
  }, [sortedSubjects]);

  // Separate subjects by program type for statistics
  const bachelorSubjects = (sortedSubjects?.filter((s: Subject) => s.program?.name === "Bachelor") || []);
  const masterSubjects = (sortedSubjects?.filter((s: Subject) => s.program?.name === "Master") || []);

  // Handle selection changes in DataGrid
  const handleSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
    setSelectedSubjects(e.selectedRowsData);
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedSubjects.length > 0) {
      setDeletingMultipleSubjects(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedSubjects.length > 0) {
      const subjectIds = selectedSubjects.map(subject => subject.id);
      bulkDeleteSubjectsMutation.mutate(subjectIds);
    }
  };

  const handleBulkDeleteCancel = () => {
    setDeletingMultipleSubjects(false);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedSubjects([]);
  };

  // Export functions for DevExtreme
  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    if (e.format === 'pdf') {
      const doc = new jsPDF();

      // Add header with title and subject count
      const subjectCount = sortedSubjects?.length || 0;

      // Set font and add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Lista e Lëndëve', 15, 20);

      // Add subject count
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gjithsej ${subjectCount} lëndë`, 15, 30);

      // Add date
      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('sq-AL')}`, 15, 40);

      exportDataGrid({
        jsPDFDocument: doc,
        component: e.component,
        indent: 5,
        topLeft: { x: 10, y: 50 }, // Start the table below the header
      }).then(() => {
        // Add footer to all pages
        const totalPages = doc.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);

          // Footer positioning
          const pageHeight = doc.internal.pageSize.height;
          const footerY = pageHeight - 15;

          // Set footer font
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100); // Gray color

          // Left side - Website attribution
          doc.text('Gjeneruar nga www.mungesa.app', 15, footerY);

          // Center - Developer credit
          const centerText = 'Developed by JK';
          const centerX = (doc.internal.pageSize.width / 2) - (doc.getTextWidth(centerText) / 2);
          doc.text(centerText, centerX, footerY);

          // Right side - Page numbering
          const pageText = `${i}/${totalPages}`;
          const pageWidth = doc.internal.pageSize.width;
          const pageTextWidth = doc.getTextWidth(pageText);
          doc.text(pageText, pageWidth - pageTextWidth - 15, footerY);
        }

        doc.save('Lendët.pdf');
      });
    } else if (e.format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Lendët');

      exportDataGridToExcel({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Lendët.xlsx');
        });
      });
    }
    e.cancel = true;
  };

  // Render action buttons for each row
  const renderActionsCell = (cellData: { data: Subject }) => {
    const subject = cellData.data;
    return (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditingSubject(subject)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
          title="Modifiko lëndën"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDeletingSubject(subject)}
          className="text-red-600 hover:text-red-900 p-1 rounded cursor-pointer"
          title="Fshi lëndën"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render classes with color coding
  const renderClassesCell = (cellData: { data: Subject }) => {
    const subject = cellData.data;
    const uniqueClasses = subject.teachingAssignments
      ? Array.from(
        new Map(
          subject.teachingAssignments
            .filter(ta => ta.class)
            .map(ta => [ta.class!.id, ta.class!])
        ).values()
      )
      : [];

    if (uniqueClasses.length === 0) {
      return <span className="text-xs text-gray-400 italic">Nuk ka klasa</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {uniqueClasses.slice(0, 2).map((cls) => {
          const colors = getClassColor(cls.id);
          return (
            <span
              key={cls.id}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
            >
              {cls.name}
            </span>
          );
        })}
        {uniqueClasses.length > 2 && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 cursor-help"
            onMouseEnter={(e) => handleTooltipShow(e, uniqueClasses.slice(2))}
            onMouseLeave={handleTooltipHide}
          >
            +{uniqueClasses.length - 2} më shumë
          </span>
        )}
      </div>
    );
  };
  //#endregion

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e lëndëve */}
      <Card title="Shto lëndë">
        <AddSubjectForm isAdmin={isAdmin} programs={programs} />
      </Card>



      {/* All Subjects in Data Grid */}
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Lista e lëndëve ({sortedSubjects.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <Alert title="Gabim gjatë leximit të listës së lëndëve" />
        ) : (
          <div className="mt-6">
            {/* Bulk Actions Bar */}
            {selectedSubjects.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedSubjects.length} lënd{selectedSubjects.length !== 1 ? 'ë' : 'a'} të zgjedhura
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
                      Fshi të zgjedhurat ({selectedSubjects.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            <DataGrid
              dataSource={subjectsWithRowNumbers}
              allowColumnReordering={true}
              allowColumnResizing={true}
              columnAutoWidth={true}
              showBorders={true}
              showRowLines={true}
              showColumnLines={true}
              rowAlternationEnabled={true}
              hoverStateEnabled={true}
              keyExpr="id"
              className="dx-datagrid-borders custom-tooltip-grid"
              onExporting={onExporting}
              onSelectionChanged={handleSelectionChanged}
              noDataText="Nuk ka lëndë për të shfaqur."
              searchPanel={{ visible: true, placeholder: "Kërko..." }}
              loadPanel={{ enabled: false }}
            >
              {/* Enable features */}
              <Selection mode="multiple" showCheckBoxesMode="always" />
              <Grouping autoExpandAll={false} />
              <GroupPanel visible={true} />
              <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Kërko lëndë..." />
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
              <StateStoring enabled={true} type="localStorage" storageKey="subjectsDataGrid" />

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
              />
              <Column
                dataField="name"
                caption="Emri i lëndës"
                alignment="left"
              />
              <Column
                dataField="codeDisplay"
                caption="Kodi"
                allowGrouping={false}
              />
              <Column
                dataField="programName"
                caption="Programi"
              />
              <Column
                dataField="classesText"
                caption="Klasat"
                allowSorting={false}
                allowFiltering={false}
                allowGrouping={false}
                cellRender={renderClassesCell}
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
            </DataGrid>

            {/* Bulk Actions Bar */}
            {selectedSubjects.length > 0 && (
              <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-blue-700">
                    <span className="text-sm font-medium">
                      {selectedSubjects.length} lëndë të zgjedhura
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleClearSelection}
                      className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
                    >
                      Pastroj zgjedhjen
                    </button>
                    <button
                      onClick={handleBulkDeleteClick}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      Fshi të zgjedhurit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subject count footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {sortedSubjects.length} lëndë gjithsej
                </span>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Bachelor: {bachelorSubjects.length}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Master: {masterSubjects.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

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

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={deletingMultipleSubjects}
        onClose={() => setDeletingMultipleSubjects(false)}
        title="Konfirmo fshirjen e shumëfishtë"
      >
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            A jeni të sigurt që dëshironi të fshini{" "}
            <span className="font-semibold">{selectedSubjects.length}</span> lëndë?
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleBulkDeleteCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anulo
            </button>
            <button
              onClick={handleBulkDeleteConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Fshi
            </button>
          </div>
        </div>
      </Modal>

      {/* Fixed position tooltip */}
      {tooltipData.show && (
        <div
          className="fixed pointer-events-none transition-opacity duration-200"
          style={{
            zIndex: 9999,
            left: tooltipData.position.x,
            top: tooltipData.position.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-100 text-black text-xs rounded-lg py-2 px-3 max-w-xs shadow-xl border border-gray-200">
            <div className="flex flex-wrap gap-1">
              {tooltipData.classes.map((cls) => {
                const colors = getClassColor(cls.id);
                return (
                  <span
                    key={cls.id}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                  >
                    {cls.name}
                  </span>
                );
              })}
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
