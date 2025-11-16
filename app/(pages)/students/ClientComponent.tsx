"use client";
import { useState, useEffect, useId } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon, UserPlusIcon } from "@heroicons/react/20/solid";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// DevExtreme imports
import { Column, DataGridTypes } from "devextreme-react/data-grid";
import { exportDataGrid } from "devextreme/pdf_exporter";
import { exportDataGrid as exportDataGridToExcel } from "devextreme/excel_exporter";
import { jsPDF } from "jspdf";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

//types
import { Class, Program, Student } from "@/types";

//hooks
import { fetchClasses, fetchStudents, deleteStudent } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/ui/Loader";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import AddStudentForm from "@/components/students/AddStudentForm";
import EditStudentForm from "@/components/students/EditStudentForm";
import Modal from "@/components/ui/Modal";
import CommonDataGrid from "@/components/ui/CommonDataGrid";
import Tooltip from "@/components/ui/Tooltip";

export default function StudentsPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  const programSelectId = useId();
  const classSelectId = useId();
  //#endregion

  //#region states
  const [classId, setClassId] = useState<number>(0);
  const [programId, setProgramId] = useState<number>(0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [deletingMultipleStudents, setDeletingMultipleStudents] = useState<boolean>(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  // Check localStorage for pre-selected program and class (from classes page navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgramId = localStorage.getItem('selectedProgramId');
      const savedClassId = localStorage.getItem('selectedClassId');

      if (savedProgramId && savedClassId) {
        setProgramId(parseInt(savedProgramId));
        setClassId(parseInt(savedClassId));

        // Clear the saved values after using them
        localStorage.removeItem('selectedProgramId');
        localStorage.removeItem('selectedClassId');
      }
    }
  }, []);
  //#endregion

  //#region useQuery
  const {
    data: classes = [],
    isLoading: classesLoading,
    error: classesError,
  } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
    enabled: isAdmin === "true",
  });

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["students", classId], // Re-fetch when classId changes
    queryFn: () => fetchStudents(classId),
    enabled: classId > 0, // Prevent fetch when classId is null
  });

  // Add row numbers to students data
  const studentsWithRowNumbers = studentsData?.map((student: Student, index: number) => ({
    ...student,
    rowNumber: index + 1
  })) || [];
  //#endregion

  //#region mutations
  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: (data) => {
      if (data.error) {
        showMessage(data.error, "error");
      } else {
        showMessage("Studenti u fshi me sukses!", "success");
        queryClient.invalidateQueries({ queryKey: ["students", classId] });
        setDeletingStudent(null);
        // Clear selection if the deleted student was selected
        setSelectedStudents(prev => prev.filter(s => s.id !== data.id));
      }
    },
    onError: () => {
      showMessage("Dështoi fshirja e studentit!", "error");
    },
  });

  const deleteMultipleStudentsMutation = useMutation({
    mutationFn: async (studentIds: number[]) => {
      const promises = studentIds.map(id => deleteStudent(id));
      const results = await Promise.allSettled(promises);
      return results;
    },
    onSuccess: (results) => {
      const failed = results.filter(result => result.status === 'rejected').length;
      const successful = results.filter(result => result.status === 'fulfilled').length;

      if (failed > 0) {
        showMessage(`${successful} studentë u fshinë me sukses, ${failed} dështuan.`, "warning");
      } else {
        showMessage(`${successful} studentë u fshinë me sukses!`, "success");
      }

      queryClient.invalidateQueries({ queryKey: ["students", classId] });
      setDeletingMultipleStudents(false);
      setSelectedStudents([]);
    },
    onError: () => {
      showMessage("Dështoi fshirja e studentëve!", "error");
    },
  });
  //#endregion

  //#region functions
  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    if (e.format === 'pdf') {
      const doc = new jsPDF();

      // Add header with class name and student count
      const className = selectedClass?.name || 'Lista e studentëve';
      const studentCount = studentsData?.length || 0;

      // Set font and add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(className, 15, 20);

      // Add student count
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gjithsej ${studentCount} student${studentCount !== 1 ? 'ë' : ''}`, 15, 30);

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

        doc.save(`Studentet_${selectedClass?.name || 'Lista'}.pdf`);
      });
    } else if (e.format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Studentet');

      exportDataGridToExcel({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
        customizeCell: (options) => {
          // Enable text wrapping for all cells
          if (options.excelCell) {
            options.excelCell.alignment = {
              wrapText: true,
              vertical: 'top',
              horizontal: 'left'
            };
          }
        }
      }).then(() => {
        // Set column widths and row heights after export
        worksheet.columns = [
          { width: 8 },   // # column
          { width: 20 },  // Emri
          { width: 20 },  // Atësia
          { width: 20 },  // Mbiemri
          { width: 30 },  // Email institucional
          { width: 30 },  // Email personal
          { width: 15 },  // Telefoni
          { width: 10 }   // Nr. rradhës
        ];

        // Set minimum row height for data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) { // Skip header row
            row.height = 25; // Minimum height for better text visibility
          }
        });
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Studentet_${selectedClass?.name || 'Lista'}.xlsx`);
        });
      });
    }
  };

  const handleDeleteStudent = () => {
    if (deletingStudent) {
      deleteStudentMutation.mutate(deletingStudent.id);
    }
  };

  const handleSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
    setSelectedStudents(e.selectedRowsData);
  };

  const handleDeleteSelectedStudents = () => {
    if (selectedStudents.length > 0) {
      const studentIds = selectedStudents.map(student => student.id);
      deleteMultipleStudentsMutation.mutate(studentIds);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedStudents.length > 0) {
      setDeletingMultipleStudents(true);
    }
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const renderFirstNameCell = (cellData: { data: Student; value: string }) => {
    const student = cellData.data;

    return (
      <div className="flex items-center gap-2 w-full">
        <span className="text-left">{student.firstName}</span>
        {student.memo && (
          <Tooltip content={student.memo} />
        )}
      </div>
    );
  };

  const renderActionsCell = (cellData: { data: Student }) => {
    const student = cellData.data;
    return (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditingStudent(student)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
          title="Modifiko studentin"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDeletingStudent(student)}
          className="text-red-600 hover:text-red-900 p-1 rounded cursor-pointer"
          title="Fshi studentin"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };
  //#endregion

  if (classesLoading) return <Loader />;
  if (classesError) {
    showMessage("Error loading data.", "error");
    return null;
  }

  // Extract programs from classes data and sort alphabetically
  const programs = Array.from(
    new Map(
      classes
        .filter(c => c.program) // Filter out undefined
        .map(c => [c.program!.id, c.program!]) // Non-null assertion
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const selectedProgramm = programs?.find(
    (prog: Program) => prog.id === programId
  );
  const filteredClasses = classes?.filter(
    (cls: Class) => cls.programId === programId
  ).sort((a, b) => a.name.localeCompare(b.name));
  const selectedClass = filteredClasses?.find(
    (cls: Class) => cls.id === classId
  );

  return (
    <div className="flex flex-col gap-4">
      <Card title="Filtrimi">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Program Selector */}
          <Listbox
            value={programId}
            onChange={(value) => {
              setProgramId(value);
              setClassId(0);
              setSelectedStudents([]); // Clear selection when program changes
            }}
            name={`program-select-${programSelectId}`}
          >
            <div className="relative mt-2">
              <ListboxButton
                id={`program-select-button-${programSelectId}`}
                className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                <span className="col-start-1 row-start-1 truncate pr-6">
                  {programs?.length === 0
                    ? "Nuk ka programe aktive"
                    : programId === 0
                      ? "Zgjidh një program"
                      : selectedProgramm?.name}
                </span>
                <ChevronUpDownIcon
                  aria-hidden="true"
                  className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </ListboxButton>

              <ListboxOptions
                id={`program-select-options-${programSelectId}`}
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
              >
                {programs?.map((prog: Program) => (
                  <ListboxOption
                    key={prog.id}
                    value={prog.id}
                    className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                  >
                    <span className="block truncate font-normal group-data-selected:font-semibold">
                      {prog.name}
                    </span>

                    <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="size-5" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Class Selector */}
          <Listbox
            disabled={programId === 0}
            value={classId}
            onChange={(value) => {
              setClassId(value);
              setSelectedStudents([]); // Clear selection when class changes
            }}
            name={`class-select-${classSelectId}`}
          >
            <div className="relative mt-2">
              <ListboxButton
                id={`class-select-button-${classSelectId}`}
                className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left sm:text-sm/6 
  ${programId === 0
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "cursor-default bg-white text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                  }`}
              >
                <span className="col-start-1 row-start-1 truncate pr-6">
                  {programId === 0
                    ? "Zgjidh një program fillimisht"
                    : classes?.length === 0
                      ? "Nuk ka klasa aktive"
                      : classId === 0
                        ? "Zgjidh një klasë"
                        : selectedClass?.name}
                </span>
                <ChevronUpDownIcon
                  aria-hidden="true"
                  className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </ListboxButton>

              <ListboxOptions
                id={`class-select-options-${classSelectId}`}
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
              >
                {filteredClasses?.map((cls: Class) => (
                  <ListboxOption
                    key={cls.id}
                    value={cls.id}
                    className="group relative cursor-default py-2 pr-4 pl-8 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                  >
                    <span className="block truncate font-normal group-data-selected:font-semibold">
                      {cls.name}
                    </span>

                    <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="size-5" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </Card>

      {/* Add Student Form */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Shto student</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStudentForm(!showAddStudentForm)}
              className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {showAddStudentForm ? 'Fshih' : 'Shfaq'}
            </button>
          </div>

          {showAddStudentForm && (
            <div>
              {!classId ? (
                <Alert title="Zgjidh një klasë për të shtuar studentë" />
              ) : (
                <AddStudentForm classId={classId} />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Students List */}
      <Card title={`Lista e studentëve ${selectedClass ? `- ${selectedClass.name}` : ''}`}>
        {studentsLoading ? (
          <Loader />
        ) : studentsError ? (
          <Alert title="Gabim gjatë leximit të listës së studentëve" />
        ) : !classId ? (
          <Alert title="Zgjidh një klasë për të parë studentët" />
        ) : (
          <div className="mt-6">
            {/* Bulk Actions */}
            {selectedStudents.length > 0 && isAdmin === "true" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 'ë' : ''} të zgjedhur
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={clearSelection}
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
                      Fshi të zgjedhurit ({selectedStudents.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            <CommonDataGrid
              dataSource={studentsWithRowNumbers}
              storageKey="studentsDataGrid"
              onExporting={onExporting}
              onSelectionChanged={handleSelectionChanged}
            >
              {/* Columns */}
              <Column
                dataField="firstName"
                caption="Emri"
                cellRender={renderFirstNameCell}
                alignment="left"
                allowGrouping={false}

              />
              <Column
                dataField="father"
                caption="Atësia"
                allowGrouping={false}
                cellRender={(cellData) => cellData.value || "-"}
                visible={false}
              />
              <Column
                dataField="lastName"
                caption="Mbiemri"
                allowGrouping={false}
              />
              <Column
                dataField="institutionEmail"
                caption="Email Institucional"
                allowGrouping={false}
              />
              <Column
                dataField="personalEmail"
                caption="Email Personal"
                allowGrouping={false}
                visible={false}
                cellRender={(cellData) => cellData.value || "-"}
              />
              <Column
                dataField="phone"
                caption="Telefoni"
                allowGrouping={false}
                visible={false}
                cellRender={(cellData) => cellData.value || "-"}
              />
              <Column
                dataField="orderId"
                caption="Nr. Rendi"
                width={100}
                allowGrouping={false}
                visible={false}
                allowSorting={false}
                allowFiltering={false}
                cellRender={(cellData) => cellData.rowIndex + 1}
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
          </div>
        )}
      </Card>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editingStudent !== null}
        onClose={() => setEditingStudent(null)}
        title="Modifiko studentin"
        maxWidth="max-w-lg"
      >
        {editingStudent && (
          <EditStudentForm
            student={editingStudent}
            classes={classes}
            onClose={() => setEditingStudent(null)}
          />
        )}
      </Modal>

      {/* Delete Student Modal */}
      <Modal
        isOpen={deletingStudent !== null}
        onClose={() => setDeletingStudent(null)}
        title="Fshi studentin"
        maxWidth="max-w-md"
      >
        {deletingStudent && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A jeni të sigurt që doni të fshini studentin <strong>{deletingStudent.firstName} {deletingStudent.lastName}</strong>?
            </p>
            <p className="text-sm text-red-600">
              Ky veprim nuk mund të kthehet prapa. Studenti do të fshihet përgjithmonë.
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={deleteStudentMutation.isPending}
              >
                Anulo
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={deleteStudentMutation.isPending}
              >
                {deleteStudentMutation.isPending ? <Loader size="w-4 h-4" /> : "Fshi studentin"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Multiple Students Modal */}
      <Modal
        isOpen={deletingMultipleStudents}
        onClose={() => setDeletingMultipleStudents(false)}
        title="Fshi studentët e zgjedhur"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            A jeni të sigurt që doni të fshini <strong>{selectedStudents.length} student{selectedStudents.length !== 1 ? 'ë' : ''}</strong>?
          </p>
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-2">
            {selectedStudents.map((student, index) => (
              <div key={student.id} className="text-xs text-gray-700 py-1">
                {index + 1}. {student.firstName} {student.lastName}
              </div>
            ))}
          </div>
          <p className="text-sm text-red-600">
            Ky veprim nuk mund të kthehet prapa. Studentët do të fshihen përgjithmonë.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setDeletingMultipleStudents(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={deleteMultipleStudentsMutation.isPending}
            >
              Anulo
            </button>
            <button
              onClick={handleDeleteSelectedStudents}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              disabled={deleteMultipleStudentsMutation.isPending}
            >
              {deleteMultipleStudentsMutation.isPending ? <Loader size="w-4 h-4" /> : `Fshi ${selectedStudents.length} studentët`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
