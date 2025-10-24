"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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
  const [programFilter, setProgramFilter] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
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

  if (isLoading) return <Loader />;
  if (error) {
    showMessage("Error loading subjects.", "error");
    return null;
  }

  const { subjects = [], programs = [] } = data || {}; // ✅ Extract subjects & programs

  // Filter subjects based on filters
  const filteredSubjects = subjects.filter((subject: Subject) => {
    const matchesProgram = programFilter === 0 || subject.programId === programFilter;
    const matchesSearch = searchFilter === "" || 
      subject.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchFilter.toLowerCase()));
    
    return matchesProgram && matchesSearch;
  }).sort((a: Subject, b: Subject) => a.name.localeCompare(b.name));

  // Separate subjects by program type for statistics
  const bachelorSubjects = (filteredSubjects?.filter((s: Subject) => s.program?.name === "Bachelor") || []);
  const masterSubjects = (filteredSubjects?.filter((s: Subject) => s.program?.name === "Master") || []);

  return (
    <div className="flex flex-col gap-4">
      {/* Forma për shtimin e lëndëve */}
      <Card title="Shto lëndë">
        <AddSubjectForm isAdmin={isAdmin} programs={programs} />
      </Card>



      {/* All Subjects in Data Grid */}
      <Card>
        <div className="mb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            Lista e lëndëve ({filteredSubjects.length})
          </h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:max-w-md">
            {/* Program Filter */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(Number(e.target.value))}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
              <option value={0}>Të gjithë programet</option>
              {programs.map((program: { id: number; name: string }) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>

            {/* Search Filter */}
            <input
              type="text"
              placeholder="Kërko lëndë ose kod..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
        </div>

        {subjects?.length === 0 ? (
          <Alert title="Nuk keni ende lëndë. Shtoni një lëndë më sipër!" />
        ) : filteredSubjects.length === 0 ? (
          <Alert title="Nuk u gjetën lëndë që përputhen me filtrat." />
        ) : (
          <div className="mt-6">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Emri i lëndës
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kodi
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Programi
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klasat
                      </th>
                      {isAdmin === "true" && (
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Veprime
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubjects.map((subject: Subject, index: number) => {
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

                      return (
                        <tr key={subject.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {subject.name}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {subject.code || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {subject.program?.name || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {uniqueClasses.length > 0 ? (
                                uniqueClasses.slice(0, 2).map((cls) => {
                                  const colors = getClassColor(cls.id);
                                  return (
                                    <span
                                      key={cls.id}
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                                    >
                                      {cls.name}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-gray-400 italic">Nuk ka klasa</span>
                              )}
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
                          </td>
                          {isAdmin === "true" && (
                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingSubject(subject)}
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-150 cursor-pointer"
                                  title="Modifiko lëndën"
                                >
                                  <PencilIcon className="w-3 h-3 mr-1" />
                                  Ndrysho
                                </button>
                                <button
                                  onClick={() => setDeletingSubject(subject)}
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150 cursor-pointer"
                                  title="Fshi lëndën"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Subject count footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    {filteredSubjects.length} nga {subjects?.length} lëndë
                    {(programFilter !== 0 || searchFilter !== "") && " (të filtruara)"}
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
