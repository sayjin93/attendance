"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Alert from "../../../components/Alert";
import Skeleton from "../../../components/Skeleton";
import FilterSection from "./components/FilterSection";
import RegistryTable from "./components/RegistryTable";
import EmptyState from "./components/EmptyState";

// Interfaces
interface Program {
    id: string;
    name: string;
}

interface Class {
    id: string;
    name: string;
    programId: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
}

interface TeachingType {
    id: string;
    name: string;
}

interface Professor {
    id: string;
    firstName: string;
    lastName: string;
}

interface Lecture {
    id: string;
    date: string;
    typeId: string;
    typeName: string;
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface AttendanceRecord {
    studentId: string;
    lectureId: string;
    status: 'PRESENT' | 'ABSENT' | 'PARTICIPATED';
}

interface StudentRegistryRow {
    student: Student;
    attendanceByLecture: { [lectureId: string]: 'PRESENT' | 'ABSENT' | 'PARTICIPATED' | null };
    absenceCount: number;
    totalLectures: number;
    absencePercentage: number;
    status: 'NK' | 'OK';
}

interface RegistryData {
    programs: Program[];
    classes: Class[];
    subjects: Subject[];
    types: TeachingType[];
    professors?: Professor[];
    lectures: Lecture[];
    students: Student[];
    attendance: AttendanceRecord[];
    registryRows: StudentRegistryRow[];
}

export default function RegistryPageClient({
    professorId,
    isAdmin,
}: {
    professorId: string;
    isAdmin: string;
}) {

    //#region states
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [selectedProfessorId, setSelectedProfessorId] = useState("");
    //#endregion

    const isAdminUser = isAdmin === "true";

    // Check if all required filters are selected
    const canShowTable = !!(selectedClassId && selectedSubjectId && selectedTypeId && 
        (isAdminUser ? selectedProfessorId : true));    //#region useQuery for filter data only
    const {
        data: filterData,
        isLoading: loadingFilters,
        error: errorFilters,
    } = useQuery<RegistryData>({
        queryKey: ["registry-filters", professorId, selectedProfessorId, selectedClassId, selectedSubjectId],
        queryFn: async () => {
            // For admin, use selectedProfessorId if available, otherwise use current professorId
            const effectiveProfessorId = isAdminUser && selectedProfessorId ? selectedProfessorId : professorId;
            const params = new URLSearchParams({ professorId: effectiveProfessorId });

            if (selectedClassId) params.append('classId', selectedClassId);
            if (selectedSubjectId) params.append('subjectId', selectedSubjectId);

            const response = await fetch(`/api/registry?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch registry data");
            }
            return response.json();
        },
        enabled: !!professorId,
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    });

    //#region useQuery for registry table data
    const {
        data: registryData,
        isLoading: loadingRegistry,
    } = useQuery<RegistryData>({
        queryKey: ["registry-table", professorId, selectedClassId, selectedSubjectId, selectedTypeId, selectedProfessorId],
        queryFn: async () => {
            // For admin, use selectedProfessorId if available, otherwise use current professorId
            const effectiveProfessorId = isAdminUser && selectedProfessorId ? selectedProfessorId : professorId;
            const params = new URLSearchParams({ professorId: effectiveProfessorId });

            if (selectedClassId) params.append('classId', selectedClassId);
            if (selectedSubjectId) params.append('subjectId', selectedSubjectId);
            if (selectedTypeId) params.append('typeId', selectedTypeId);
            // Remove the duplicate professorId append since we're already using effectiveProfessorId as the main one

            const response = await fetch(`/api/registry?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch registry data");
            }
            return response.json();
        },
        enabled: !!canShowTable,
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    });
    //#endregion

    // Helper functions for resetting dependent selections with useCallback to prevent rerenders
    const resetSelections = useCallback((fromLevel: 'professor' | 'class' | 'subject' | 'type') => {
        if (fromLevel === 'professor') {
            setSelectedClassId("");
            setSelectedSubjectId("");
            setSelectedTypeId("");
        } else if (fromLevel === 'class') {
            setSelectedSubjectId("");
            setSelectedTypeId("");
        } else if (fromLevel === 'subject') {
            setSelectedTypeId("");
        }
    }, []);

    // Filter change handlers with useCallback
    const handleProfessorChange = useCallback((value: string) => {
        setSelectedProfessorId(value);
        resetSelections('professor');
    }, [resetSelections]);

    const handleClassChange = useCallback((value: string) => {
        setSelectedClassId(value);
        resetSelections('class');
    }, [resetSelections]);

    const handleSubjectChange = useCallback((value: string) => {
        setSelectedSubjectId(value);
        resetSelections('subject');
    }, [resetSelections]);

    const handleTypeChange = useCallback((value: string) => {
        setSelectedTypeId(value);
        resetSelections('type');
    }, [resetSelections]);

    // Filter data based on selections (use filterData for dropdowns, registryData for table)
    const programs = filterData?.programs || [];
    const classes = filterData?.classes || [];
    const subjects = filterData?.subjects || [];
    const types = filterData?.types || [];
    const professors = filterData?.professors || [];
    const lectures = registryData?.lectures || [];
    const registryRows = registryData?.registryRows || [];

    // Filter classes based on selected program
    const filteredClasses = classes;

    const selectedClass = filteredClasses.find((c: Class) => c.id === selectedClassId);
    const selectedSubject = subjects.find((s: Subject) => s.id === selectedSubjectId);
    const selectedType = types.find((t: TeachingType) => t.id === selectedTypeId);
    const selectedProfessor = professors.find((p: Professor) => p.id === selectedProfessorId);

    if (loadingFilters) {
        return (
            <div className="space-y-6">
                <Skeleton />
            </div>
        );
    }

    if (errorFilters) {
        return (
            <Alert
                type="error"
                title="Gabim në ngarkim"
                desc={errorFilters.message || "Dështoi ngarkimi i të dhënave"}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters - This component won't rerender unnecessarily */}
            <FilterSection
                programs={programs}
                classes={classes}
                subjects={subjects}
                types={types}
                professors={professors}
                selectedClassId={selectedClassId}
                selectedSubjectId={selectedSubjectId}
                selectedTypeId={selectedTypeId}
                selectedProfessorId={selectedProfessorId}
                isAdminUser={isAdminUser}
                onClassChange={handleClassChange}
                onSubjectChange={handleSubjectChange}
                onTypeChange={handleTypeChange}
                onProfessorChange={handleProfessorChange}
            />

            {/* Registry Table - Only renders when data is available */}
            {canShowTable && registryRows.length > 0 && (
                <RegistryTable
                    programs={programs}
                    professors={professors}
                    lectures={lectures}
                    registryRows={registryRows}
                    selectedClass={selectedClass}
                    selectedSubject={selectedSubject}
                    selectedType={selectedType}
                    selectedProfessor={selectedProfessor}
                    isAdminUser={isAdminUser}
                    isLoading={loadingRegistry}
                />
            )}

            {/* Empty States - Handles both no data and no filters selected */}
            <EmptyState
                canShowTable={canShowTable}
                registryRows={registryRows}
                isAdminUser={isAdminUser}
                isLoading={loadingRegistry}
            />
        </div>
    );
}