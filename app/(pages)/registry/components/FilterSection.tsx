"use client";

import { memo } from "react";
import Card from "../../../../components/Card";

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

interface FilterSectionProps {
  programs: Program[];
  classes: Class[];
  subjects: Subject[];
  types: TeachingType[];
  professors: Professor[];
  selectedClassId: string;
  selectedSubjectId: string;
  selectedTypeId: string;
  selectedProfessorId: string;
  isAdminUser: boolean;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onProfessorChange: (value: string) => void;
}

const FilterSection = memo(function FilterSection({
  programs,
  classes,
  subjects,
  types,
  professors,
  selectedClassId,
  selectedSubjectId,
  selectedTypeId,
  selectedProfessorId,
  isAdminUser,
  onClassChange,
  onSubjectChange,
  onTypeChange,
  onProfessorChange,
}: FilterSectionProps) {
  // Group classes by program
  const groupedClasses: { [programName: string]: Class[] } = {};
  programs.forEach((program) => {
    const programClasses = classes.filter(c => c.programId === program.id);
    if (programClasses.length > 0) {
      groupedClasses[program.name] = programClasses;
    }
  });

  return (
    <Card title="Filtrat">
      <div className={`grid grid-cols-1 gap-4 ${
        isAdminUser 
          ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        
        {/* Professor Selector - Only for Admin */}
        {isAdminUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesori *
            </label>
            <select
              value={selectedProfessorId}
              onChange={(e) => onProfessorChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Zgjidhni profesorin...</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.firstName} {professor.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Class Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Klasa *
          </label>
          <select
            disabled={isAdminUser && !selectedProfessorId}
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isAdminUser && !selectedProfessorId
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
            required
          >
            <option value="">
              {Object.keys(groupedClasses).length === 0 
                ? 'Nuk ka klasa të disponueshme' 
                : 'Zgjidhni klasën...'}
            </option>
            {Object.entries(groupedClasses).map(([programName, programClasses]) => (
              <optgroup key={programName} label={programName}>
                {programClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Subject Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lënda *
          </label>
          <select
            disabled={!selectedClassId || subjects.length === 0}
            value={selectedSubjectId}
            onChange={(e) => onSubjectChange(e.target.value)}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !selectedClassId || subjects.length === 0
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
            required
          >
            <option value="">
              {!selectedClassId 
                ? 'Zgjidhni klasën fillimisht' 
                : subjects.length === 0 
                  ? 'Nuk ka lëndë të disponueshme' 
                  : 'Zgjidhni lëndën...'}
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipi *
          </label>
          <select
            disabled={!selectedSubjectId || types.length === 0}
            value={selectedTypeId}
            onChange={(e) => onTypeChange(e.target.value)}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !selectedSubjectId || types.length === 0
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
            required
          >
            <option value="">
              {!selectedSubjectId 
                ? 'Zgjidhni lëndën fillimisht' 
                : types.length === 0 
                  ? 'Nuk ka tip të disponueshëm' 
                  : 'Zgjidhni tipin...'}
            </option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
});

export default FilterSection;