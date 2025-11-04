"use client";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { EnvelopeIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";

// DevExtreme imports
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    Paging,
    Pager,
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
import { Professor } from "@/types";

//hooks
import { fetchProfessors, deleteProfessor } from "@/hooks/fetchFunctions";

//contexts
import { useNotify } from "@/contexts/NotifyContext";

//components
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import Card from "@/components/Card";
import AddProfessorForm from "@/components/AddProfessorForm";
import EditProfessorForm from "@/components/EditProfessorForm";
import Modal from "@/components/Modal";

export default function ProfessorsPageClient({ isAdmin }: { isAdmin: string }) {
    //#region constants
    const { showMessage } = useNotify();
    const queryClient = useQueryClient();
    //#endregion

    //#region states
    const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
    const [deletingProfessor, setDeletingProfessor] = useState<Professor | null>(null);
    const [testEmail, setTestEmail] = useState("");
    const [showEmailTest, setShowEmailTest] = useState(false);
    const [showAddProfessorForm, setShowAddProfessorForm] = useState(false);
    const [selectedProfessors, setSelectedProfessors] = useState<Professor[]>([]);
    const [deletingMultipleProfessors, setDeletingMultipleProfessors] = useState<boolean>(false);
    //#endregion

    //#region useQuery
    const {
        data: professors = [],
        isLoading: professorsLoading,
        error: professorsError,
    } = useQuery<Professor[]>({
        queryKey: ["professors"],
        queryFn: () => fetchProfessors(),
        enabled: isAdmin === "true",
    });
    //#endregion

    //#region mutations
    const deleteProfessorMutation = useMutation({
        mutationFn: (id: number) => deleteProfessor(id),
        onSuccess: (data) => {
            if (data.error) {
                showMessage(data.error, "error");
            } else {
                showMessage("Profesori u fshi me sukses!", "success");
                queryClient.invalidateQueries({ queryKey: ["professors"] });
                setDeletingProfessor(null);
            }
        },
        onError: () => {
            showMessage("Dështoi fshirja e profesorit!", "error");
        },
    });

    // Bulk delete mutation
    const bulkDeleteProfessorsMutation = useMutation({
        mutationFn: async (professorIds: number[]) => {
            const results = await Promise.allSettled(
                professorIds.map(id => deleteProfessor(id))
            );
            return results;
        },
        onSuccess: (results) => {
            const successCount = results.filter(result => result.status === 'fulfilled').length;
            const failCount = results.length - successCount;

            if (failCount === 0) {
                showMessage(`${successCount} profesor(ë) u fshinë me sukses!`, "success");
            } else if (successCount === 0) {
                showMessage("Dështoi fshirja e profesorëve!", "error");
            } else {
                showMessage(`${successCount} profesor(ë) u fshinë, ${failCount} dështuan!`, "warning");
            }

            queryClient.invalidateQueries({ queryKey: ["professors"] });
            setSelectedProfessors([]);
            setDeletingMultipleProfessors(false);
        },
        onError: () => {
            showMessage("Dështoi fshirja e profesorëve!", "error");
            setDeletingMultipleProfessors(false);
        },
    });

    // Test email mutation
    const testEmailMutation = useMutation({
        mutationFn: async (email: string) => {
            const res = await fetch("/api/test-email", {
                method: "POST",
                body: JSON.stringify({
                    testType: "send",
                    email: email
                }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Dështoi dërgimi i email-it!");
            }

            return data;
        },
        onSuccess: () => {
            showMessage("Email-i u dërgua me sukses!", "success");
            setTestEmail("");
            setShowEmailTest(false);
        },
        onError: (error: Error) => {
            showMessage(error.message, "error");
        },
    });
    //#endregion

    //#region functions
    const handleDeleteProfessor = () => {
        if (deletingProfessor) {
            deleteProfessorMutation.mutate(deletingProfessor.id);
        }
    };

    const handleTestEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (testEmail.trim()) {
            testEmailMutation.mutate(testEmail.trim());
        }
    };

    // Handle selection changes in DataGrid
    const handleSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
        setSelectedProfessors(e.selectedRowsData);
    };

    // Handle bulk delete
    const handleBulkDeleteClick = () => {
        if (selectedProfessors.length > 0) {
            setDeletingMultipleProfessors(true);
        }
    };

    const handleBulkDeleteConfirm = () => {
        if (selectedProfessors.length > 0) {
            const professorIds = selectedProfessors.map(professor => professor.id);
            bulkDeleteProfessorsMutation.mutate(professorIds);
        }
    };

    const handleBulkDeleteCancel = () => {
        setDeletingMultipleProfessors(false);
    };

    // Clear selection
    const handleClearSelection = () => {
        setSelectedProfessors([]);
    };

    // Export functions for DevExtreme
    const onExporting = (e: DataGridTypes.ExportingEvent) => {
        if (e.format === 'pdf') {
            const doc = new jsPDF();

            // Add header with title and professor count
            const professorCount = professorsWithRowNumbers?.length || 0;

            // Set font and add title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Lista e Profesorëve', 15, 20);

            // Add professor count
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Gjithsej ${professorCount} profesor${professorCount !== 1 ? 'ë' : ''}`, 15, 30);

            // Add date
            doc.setFontSize(10);
            doc.text(`Data: ${new Date().toLocaleDateString('sq-AL')}`, 15, 40);

            exportDataGrid({
                jsPDFDocument: doc,
                component: e.component,
                indent: 5,
                topLeft: { x: 10, y: 50 }, // Start the table below the header
                columnWidths: [15, 45, 50, 35, 20], // #, Emri i plotë, Email, Username, Caktime
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

                doc.save('Profesoret.pdf');
            });
        } else if (e.format === 'xlsx') {
            const workbook = new Workbook();
            const worksheet = workbook.addWorksheet('Profesoret');

            exportDataGridToExcel({
                component: e.component,
                worksheet: worksheet,
                autoFilterEnabled: true
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Profesoret.xlsx');
                });
            });
        }
        e.cancel = true;
    };

    // Render action buttons for each row
    const renderActionsCell = (cellData: { data: Professor }) => {
        const professor = cellData.data;
        return (
            <div className="flex space-x-2">
                <button
                    onClick={() => setEditingProfessor(professor)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded cursor-pointer"
                    title="Modifiko profesor"
                >
                    <PencilIcon className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setDeletingProfessor(professor)}
                    className="text-red-600 hover:text-red-900 p-1 rounded cursor-pointer"
                    title="Fshi profesor"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        );
    };

    // Render full name with admin badge
    const renderFullNameCell = (cellData: { data: Professor }) => {
        const professor = cellData.data;
        return (
            <div>
                <div className="text-sm font-medium text-gray-900">
                    {professor.firstName} {professor.lastName}
                </div>
                {professor.isAdmin && (
                    <div className="text-xs text-blue-600 font-medium">
                        Administrator
                    </div>
                )}
            </div>
        );
    };

    // Prepare data with row numbers
    const professorsWithRowNumbers = useMemo(() => {
        return professors.map((professor, index) => ({
            ...professor,
            rowNumber: index + 1,
            fullName: `${professor.firstName} ${professor.lastName}`,
            assignmentsCount: professor.teachingAssignments?.length || 0
        }));
    }, [professors]);
    //#endregion

    return (
        <div className="space-y-6">
            {/* Add Professor Form */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <UserPlusIcon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-medium text-gray-900">Shto Profesor të ri</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddProfessorForm(!showAddProfessorForm)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            {showAddProfessorForm ? 'Fshih' : 'Shfaq'}
                        </button>
                    </div>

                    {showAddProfessorForm && (
                        <AddProfessorForm />
                    )}
                </div>
            </Card>

            {/* Test Email Form */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-medium text-gray-900">Testo Email-in</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowEmailTest(!showEmailTest)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            {showEmailTest ? 'Fshih' : 'Shfaq'}
                        </button>
                    </div>

                    {showEmailTest && (
                        <form onSubmit={handleTestEmail} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="testEmail"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email për test *
                                </label>
                                <input
                                    type="email"
                                    id="testEmail"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Shkruani email-in për test..."
                                    disabled={testEmailMutation.isPending}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={testEmailMutation.isPending}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {testEmailMutation.isPending ? "Duke dërguar..." : "Dërgo Email Test"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>

            {/* Professors List */}
            <Card>
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-lg font-medium text-gray-900">
                        Lista e Profesorëve {!professorsLoading && `(${professors.length})`}
                    </h2>
                </div>

                {professorsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader />
                    </div>
                ) : professorsError ? (
                    <Alert title="Gabim gjatë leximit të listës së profesorëve" />
                ) : (
                    <div>
                        {/* Bulk Actions Bar */}
                        {selectedProfessors.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-800">
                                        {selectedProfessors.length} profesor{selectedProfessors.length !== 1 ? 'ë' : ''} të zgjedhur
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
                                            Fshi të zgjedhurit ({selectedProfessors.length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DataGrid
                            dataSource={professorsWithRowNumbers}
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
                            noDataText="Nuk ka profesorë për të shfaqur."
                            searchPanel={{ visible: true, placeholder: "Kërko..." }}

                        >
                            {/* Enable features */}
                            <Selection mode="multiple" showCheckBoxesMode="always" />
                            <Grouping autoExpandAll={false} />
                            <GroupPanel visible={true} />
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
                            <StateStoring enabled={true} type="localStorage" storageKey="professorsDataGrid" />

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
                                dataField="fullName"
                                caption="Emri i plotë"
                                cellRender={renderFullNameCell}
                                alignment="left"
                            />
                            <Column
                                dataField="email"
                                caption="Email"
                                allowGrouping={false}
                            />
                            <Column
                                dataField="username"
                                caption="Username"
                                allowGrouping={false}
                            />
                            <Column
                                dataField="assignmentsCount"
                                caption="Caktime"
                                width={100}
                                allowGrouping={false}
                                cellRender={(cellData) => `${cellData.value} kurs(e)`}
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

                        {/* Professor count footer */}
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 mt-4">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                    <span>Gjithsej {professors.length} profesor{professors.length !== 1 ? 'ë' : ''}</span>
                                    {selectedProfessors.length > 0 && (
                                        <span className="text-blue-600 font-medium">
                                            ({selectedProfessors.length} të zgjedhur)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Edit Professor Modal */}
            {editingProfessor && (
                <Modal
                    isOpen={true}
                    onClose={() => setEditingProfessor(null)}
                    title="Modifiko Profesor"
                    maxWidth="max-w-2xl"
                >
                    <EditProfessorForm
                        professor={editingProfessor}
                        onClose={() => setEditingProfessor(null)}
                    />
                </Modal>
            )}

            {/* Delete Professor Confirmation Modal */}
            {deletingProfessor && (
                <Modal
                    isOpen={true}
                    onClose={() => setDeletingProfessor(null)}
                    title="Konfirmo fshirjen"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Konfirmo fshirjen
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Jeni të sigurt që dëshironi të fshini profesorin{" "}
                            <span className="font-medium">
                                {deletingProfessor.firstName} {deletingProfessor.lastName}
                            </span>
                            ? Ky veprim nuk mund të zhbëhet.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeletingProfessor(null)}
                                disabled={deleteProfessorMutation.isPending}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anulo
                            </button>
                            <button
                                onClick={handleDeleteProfessor}
                                disabled={deleteProfessorMutation.isPending}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteProfessorMutation.isPending ? "Duke fshirë..." : "Fshi"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {deletingMultipleProfessors && (
                <Modal
                    isOpen={true}
                    onClose={handleBulkDeleteCancel}
                    title="Konfirmo fshirjen e shumë profesorëve"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Konfirmo fshirjen e shumë profesorëve
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Jeni të sigurt që dëshironi të fshini {selectedProfessors.length} profesor(ë)?
                        </p>
                        <div className="bg-gray-50 rounded-md p-3 mb-6 max-h-40 overflow-y-auto">
                            <ul className="text-sm text-gray-700 space-y-1">
                                {selectedProfessors.map(professor => (
                                    <li key={professor.id} className="flex items-center space-x-2">
                                        <span>•</span>
                                        <span>{professor.firstName} {professor.lastName}</span>
                                        {professor.isAdmin && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                                Admin
                                            </span>
                                        )}
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
                                disabled={bulkDeleteProfessorsMutation.isPending}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anulo
                            </button>
                            <button
                                onClick={handleBulkDeleteConfirm}
                                disabled={bulkDeleteProfessorsMutation.isPending}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bulkDeleteProfessorsMutation.isPending ? "Duke fshirë..." : `Fshi ${selectedProfessors.length} profesor(ë)`}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}