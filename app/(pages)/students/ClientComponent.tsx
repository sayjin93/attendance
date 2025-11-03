"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon, UserPlusIcon } from "@heroicons/react/20/solid";

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
} from "devextreme-react/data-grid";
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
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import AddStudentForm from "@/components/AddStudentForm";
import EditStudentForm from "@/components/EditStudentForm";
import Modal from "@/components/Modal";

export default function StudentsPageClient({ isAdmin }: { isAdmin: string }) {
  //#region constants
  const { showMessage } = useNotify();
  const queryClient = useQueryClient();
  //#endregion

  //#region states
  const [classId, setClassId] = useState<number>(0);
  const [programId, setProgramId] = useState<number>(0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [deletingMultipleStudents, setDeletingMultipleStudents] = useState<boolean>(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  //#endregion

  //#region custom cell renderers
  const renderFirstNameCell = (cellData: { data: Student; value: string }) => {
    const student = cellData.data;
    return (
      <div className="flex items-center gap-2">
        <span>{student.firstName}</span>
        {student.memo && (
          <div className="group relative inline-block">
            <svg 
              className="w-4 h-4 text-indigo-500 cursor-help" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
              {student.memo}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
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
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-150 cursor-pointer"
          title="Modifiko studentin"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={() => setDeletingStudent(student)}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150 cursor-pointer"
          title="Fshi studentin"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  };
  //#endregion

  //#region export functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onExporting = (e: any) => {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGrid({
        jsPDFDocument: doc,
        component: e.component,
        indent: 5,
      }).then(() => {
        doc.save(`Studentet_${selectedClass?.name || 'Lista'}.pdf`);
      });
    } else if (e.format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Studentet');
      
      exportDataGridToExcel({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Studentet_${selectedClass?.name || 'Lista'}.xlsx`);
        });
      });
    }
  };
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
  const handleDeleteStudent = () => {
    if (deletingStudent) {
      deleteStudentMutation.mutate(deletingStudent.id);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChanged = (e: any) => {
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
          >
            <div className="relative mt-2">
              <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
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
          >
            <div className="relative mt-2">
              <ListboxButton
                className={`grid w-full grid-cols-1 rounded-md py-1.5 pr-2 pl-3 text-left sm:text-sm/6 
  ${
    programId === 0
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
              className="text-sm text-blue-600 hover:text-blue-700"
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
          <Alert title="Zgjidh një klasë për të parë studentët" />
        ) : !classId ? (
          <Alert title="Zgjidh një klasë për të parë studentët" />
        ) : studentsData?.length === 0 ? (
          <Alert title="Nuk ka studentë në këtë klasë. Shtoni një student më sipër!" />
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
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-150"
                    >
                      Pastro zgjedhjen
                    </button>
                    <button
                      onClick={handleBulkDeleteClick}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
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
            
            <DataGrid
              dataSource={studentsData}
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
            >
              {/* Enable features */}
              <Selection mode="multiple" showCheckBoxesMode="always" />
              <Grouping autoExpandAll={false} />
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
              <StateStoring enabled={true} type="localStorage" storageKey="studentsDataGrid" />
              
              {/* Export functionality */}
              <Export enabled={true} allowExportSelectedData={true} formats={["xlsx", "pdf"]} />

              {/* Columns */}
              <Column
                dataField="id"
                caption="#"
                width={60}
                allowSorting={false}
                allowFiltering={false}
                allowGrouping={false}
                cellRender={(cellData) => cellData.rowIndex + 1}
              />
              <Column
                dataField="firstName"
                caption="Emri"
                cellRender={renderFirstNameCell}
              />
              <Column
                dataField="father"
                caption="Atësia"
                allowGrouping={false}
                cellRender={(cellData) => cellData.value || "-"}
              />
              <Column
                dataField="lastName"
                caption="Mbiemri"
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
                cellRender={(cellData) => cellData.value || "-"}
              />
              <Column
                dataField="phone"
                caption="Telefoni"
                allowGrouping={false}
                cellRender={(cellData) => cellData.value || "-"}
              />
              <Column
                dataField="orderId"
                caption="Nr. Rendi"
                width={100}
                allowGrouping={false}
                cellRender={(cellData) => cellData.value || "-"}
              />
              {isAdmin === "true" && (
                <Column
                  caption="Veprime"
                  width={150}
                  allowSorting={false}
                  allowFiltering={false}
                  allowGrouping={false}
                  allowExporting={false}
                  cellRender={renderActionsCell}
                />
              )}
            </DataGrid>
            
            {/* Student count footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 mt-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Gjithsej {studentsData?.length} student{studentsData?.length !== 1 ? 'ë' : ''}</span>
                  {selectedStudents.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      ({selectedStudents.length} të zgjedhur)
                    </span>
                  )}
                </div>
                {selectedClass && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {selectedClass.name}
                  </span>
                )}
              </div>
            </div>
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
                {deleteStudentMutation.isPending ? <Loader /> : "Fshi studentin"}
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
              {deleteMultipleStudentsMutation.isPending ? <Loader /> : `Fshi ${selectedStudents.length} studentët`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
