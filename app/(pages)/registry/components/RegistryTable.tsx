"use client";

import { memo, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  memo?: string | null;
}

interface StudentRegistryRow {
  student: Student;
  attendanceByLecture: { [lectureId: string]: 'PRESENT' | 'ABSENT' | 'PARTICIPATED' | null };
  absenceCount: number;
  totalLectures: number;
  absencePercentage: number;
  status: 'NK' | 'OK';
}

interface RegistryTableProps {
  programs: Program[];
  professors: Professor[];
  lectures: Lecture[];
  registryRows: StudentRegistryRow[];
  selectedClass: Class | undefined;
  selectedSubject: Subject | undefined;
  selectedType: TeachingType | undefined;
  selectedProfessor: Professor | undefined;
  isAdminUser: boolean;
  isLoading: boolean;
}

const RegistryTable = memo(function RegistryTable({
  programs,
  professors,
  lectures,
  registryRows,
  selectedClass,
  selectedSubject,
  selectedType,
  selectedProfessor,
  isAdminUser,
  isLoading,
}: RegistryTableProps) {
  // Format date helper - memoized to prevent rerenders
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit'
    });
  }, []);

  // PDF Export function - memoized to prevent rerenders
  const downloadPDF = useCallback(() => {
    if (!registryRows.length || !lectures.length) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table fit
    
    // Title
    doc.setFontSize(16);
    doc.text('Regjistri i Prezencës', 20, 20);

    // Find program from selected class
    const selectedProgram = programs.find((p: Program) => p.id === selectedClass?.programId);
    
    // Metadata
    doc.setFontSize(12);
    doc.text(`Programi: ${selectedProgram?.name || ''}`, 20, 35);
    doc.text(`Klasa: ${selectedClass?.name || ''}`, 20, 45);
    doc.text(`Lënda: ${selectedSubject?.code} - ${selectedSubject?.name || ''}`, 20, 55);
    doc.text(`Tipi: ${selectedType?.name || ''}`, 20, 65);
    
    // Always show professor name (either selected admin professor or current professor)
    const professorName = isAdminUser && selectedProfessor 
      ? `${selectedProfessor.firstName} ${selectedProfessor.lastName}`
      : professors.length > 0 
        ? `${professors[0].firstName} ${professors[0].lastName}`
        : 'N/A';
    doc.text(`Profesori: ${professorName}`, 20, 75);

    // Prepare table data
    const tableHead = [
      'Studenti',
      ...lectures.map((lecture: Lecture) => formatDate(lecture.date)),
      'Statusi'
    ];

    const tableBody = registryRows.map((row: StudentRegistryRow) => [
      `${row.student.firstName} ${row.student.lastName}`,
      ...lectures.map((lecture: Lecture) => {
        const status = row.attendanceByLecture[lecture.id];
        if (status === 'ABSENT') return 'm';
        if (status === 'PARTICIPATED') return '+';
        if (status === 'PRESENT') return '';
        return '-';
      }),
      row.status
    ]);

    // Add table
    autoTable(doc, {
      startY: 85,
      head: [tableHead],
      body: tableBody,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 9,
      },
      columnStyles: {
        0: { minCellWidth: 30 }, // Student name column
        [tableHead.length - 1]: { minCellWidth: 15 }, // Status column
      },
    });

    // Generate filename
    const programName = selectedProgram?.name || 'Program';
    const className = selectedClass?.name || 'Klasa';
    const subjectCode = selectedSubject?.code || 'Lenda';
    const typeName = selectedType?.name || 'Tipi';
    const fileName = `Regjistri_${programName}_${className}_${subjectCode}_${typeName}.pdf`;
    
    doc.save(fileName);
  }, [registryRows, lectures, programs, selectedClass, selectedSubject, selectedType, selectedProfessor, isAdminUser, professors, formatDate]);

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-600">Po ngarkohet...</span>
          </div>
        </div>
      )}
      <Card title={`Regjistri - ${selectedClass?.name} - ${selectedSubject?.code} - ${selectedType?.name}${isAdminUser ? ` - ${selectedProfessor?.firstName} ${selectedProfessor?.lastName}` : ""}`}>
        {/* Export button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={downloadPDF}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Shkarko regjistrën në PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Studenti
                </th>
                {lectures.map((lecture: Lecture) => (
                  <th
                    key={lecture.id}
                    className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ minWidth: '60px' }}
                  >
                    {formatDate(lecture.date)}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statusi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registryRows.map((row: StudentRegistryRow) => (
                <tr key={row.student.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{row.student.firstName} {row.student.lastName}</span>
                      {row.student.memo && (
                        <div className="group relative inline-block">
                          <svg 
                            className="w-4 h-4 text-indigo-500 cursor-help" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none print:hidden">
                            {row.student.memo}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  {lectures.map((lecture: Lecture) => {
                    const status = row.attendanceByLecture[lecture.id];
                    let displayText = '';
                    let cellClass = 'border border-gray-300 px-2 py-2 text-center text-sm';
                    
                    if (status === 'ABSENT') {
                      displayText = 'm';
                      cellClass += ' text-red-600 font-bold';
                    } else if (status === 'PARTICIPATED') {
                      displayText = '+';
                      cellClass += ' text-green-600 font-bold';
                    } else if (status === 'PRESENT') {
                      displayText = '';
                      cellClass += ' text-gray-400';
                    } else {
                      displayText = '-';
                      cellClass += ' text-gray-400';
                    }
                    
                    return (
                      <td key={lecture.id} className={cellClass}>
                        {displayText}
                      </td>
                    );
                  })}
                  <td className={`border border-gray-300 px-4 py-2 text-center text-sm font-bold ${
                    row.status === 'NK' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Legjenda:</h4>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white"></span>
              <span>Prezent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white text-red-600 font-bold flex items-center justify-center">m</span>
              <span>Mungon</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white text-green-600 font-bold flex items-center justify-center">+</span>
              <span>Aktivizuar</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-red-100 text-red-600 font-bold rounded text-xs">NK</span>
              <span>Nuk kaloni (Leksion: {'>'}50% mungesa, Seminar: {'>'}25% mungesa)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-green-100 text-green-600 font-bold rounded text-xs">OK</span>
              <span>Kaloni</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default RegistryTable;