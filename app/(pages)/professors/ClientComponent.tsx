"use client";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { MagnifyingGlassIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
    const [deletingProfessor, setDeletingProfessor] = useState<Professor | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Professor | 'fullName' | 'assignments' | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });
    const [testEmail, setTestEmail] = useState("");
    const [showEmailTest, setShowEmailTest] = useState(false);
    //#endregion

    //#region useQuery
    const {
        data: professors = [],
        isLoading: professorsLoading,
        error: professorsError,
    } = useQuery<Professor[]>({
        queryKey: ["professors", searchTerm],
        queryFn: () => fetchProfessors(searchTerm),
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
    const handleSort = (key: keyof Professor | 'fullName' | 'assignments') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey: keyof Professor | 'fullName' | 'assignments') => {
        if (sortConfig.key !== columnKey) {
            return <ChevronUpDownIcon className="w-4 h-4 inline ml-1 text-gray-400" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUpIcon className="w-4 h-4 inline ml-1 text-indigo-600" />
            : <ChevronDownIcon className="w-4 h-4 inline ml-1 text-indigo-600" />;
    };

    const handleDeleteProfessor = () => {
        if (deletingProfessor) {
            deleteProfessorMutation.mutate(deletingProfessor.id);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleTestEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (testEmail.trim()) {
            testEmailMutation.mutate(testEmail.trim());
        }
    };

    // Sort professors based on sortConfig
    const sortedProfessors = useMemo(() => {
        if (!sortConfig.key) return professors;

        const sorted = [...professors].sort((a, b) => {
            let aValue: string | number | boolean;
            let bValue: string | number | boolean;

            if (sortConfig.key === 'fullName') {
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
            } else if (sortConfig.key === 'assignments') {
                aValue = a.teachingAssignments?.length || 0;
                bValue = b.teachingAssignments?.length || 0;
            } else {
                aValue = a[sortConfig.key as keyof Professor] as string | number | boolean;
                bValue = b[sortConfig.key as keyof Professor] as string | number | boolean;
            }

            // Handle string values
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            }

            // Handle numeric and boolean values
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [professors, sortConfig]);
    //#endregion

    if (professorsError) {
        showMessage("Error loading professors.", "error");
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Add Professor Form */}
            <Card>
                <AddProfessorForm />
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
                        Lista e Profesorëve {!professorsLoading && `(${sortedProfessors.length})`}
                    </h2>
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Kërko profesor..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {professorsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader />
                    </div>
                ) : sortedProfessors.length === 0 ? (
                    <Alert type="default" title="Nuk ka profesorë për të shfaqur." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                        onClick={() => handleSort('fullName')}
                                    >
                                        Emri i plotë{getSortIcon('fullName')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                        onClick={() => handleSort('email')}
                                    >
                                        Email{getSortIcon('email')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                        onClick={() => handleSort('username')}
                                    >
                                        Username{getSortIcon('username')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                        onClick={() => handleSort('assignments')}
                                    >
                                        Caktime{getSortIcon('assignments')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Veprime
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedProfessors.map((professor) => (
                                    <tr key={professor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {professor.firstName} {professor.lastName}
                                            </div>
                                            {professor.isAdmin && (
                                                <div className="text-xs text-blue-600 font-medium">
                                                    Administrator
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{professor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{professor.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {professor.teachingAssignments?.length || 0} kurs(e)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
        </div>
    );
}