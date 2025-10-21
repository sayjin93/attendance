"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid";

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
    //#endregion

    //#region functions
    const handleDeleteProfessor = () => {
        if (deletingProfessor) {
            deleteProfessorMutation.mutate(deletingProfessor.id);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
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

            {/* Search Bar */}
            <Card>
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Kërko Profesor</h3>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Kërkoni profesor (emri, mbiemri, email, username)..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* Professors List */}
            <Card>
                <div className="mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                        Lista e Profesorëve {!professorsLoading && `(${professors.length})`}
                    </h2>
                </div>

                {professorsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader />
                    </div>
                ) : professors.length === 0 ? (
                    <Alert type="default" title="Nuk ka profesorë për të shfaqur." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Emri i plotë
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Caktime
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Veprime
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {professors.map((professor) => (
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
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    title="Modifiko profesor"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingProfessor(professor)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded"
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