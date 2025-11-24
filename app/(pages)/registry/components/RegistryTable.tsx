"use client";

import { memo, useCallback, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Column, DataGridTypes } from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import saveAs from "file-saver";
import { exportDataGrid } from "devextreme/excel_exporter";
import Card from "../../../../components/ui/Card";
import CommonDataGrid from "../../../../components/ui/CommonDataGrid";
import Tooltip from "../../../../components/ui/Tooltip";

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
  attendanceByLecture: { [lectureId: string]: { id: number; name: string } | null };
  absenceCount: number;
  totalLectures: number;
  absencePercentage: number;
  status: 'NK' | 'OK';
}

interface AttendanceData {
  text: string;
  status: string;
}

interface GridRowData {
  id: string;
  rowNumber: number;
  studentName: string;
  studentMemo?: string | null;
  status: string;
  absenceCount: number;
  totalLectures: number;
  absencePercentage: number;
  [key: string]: string | number | AttendanceData | null | undefined;
}

interface CellRenderData {
  value: string | AttendanceData | null | undefined;
  data: GridRowData;
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

const RegistryTable = ({
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
}: RegistryTableProps) => {
  // Format date helper - memoized to prevent rerenders
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit'
    });
  }, []);

  // Transform data for DataGrid - memoized to prevent rerenders
  const gridData = useMemo(() => {
    return registryRows.map((row: StudentRegistryRow, index: number) => {
      const gridRow: GridRowData = {
        id: row.student.id,
        rowNumber: index + 1,
        studentName: `${row.student.firstName} ${row.student.lastName}`,
        studentMemo: row.student.memo,
        status: row.status,
        absenceCount: row.absenceCount,
        totalLectures: row.totalLectures,
        absencePercentage: row.absencePercentage,
      };

      // Add attendance data for each lecture
      lectures.forEach((lecture: Lecture) => {
        const status = row.attendanceByLecture[lecture.id];
        let displayText = '';

        if (status?.name === 'ABSENT') displayText = 'm';
        else if (status?.name === 'PARTICIPATED') displayText = '+';
        else if (status?.name === 'LEAVE') displayText = 'L';
        else if (status?.name === 'PRESENT') displayText = '';
        else displayText = '-';

        gridRow[`lecture_${lecture.id}`] = {
          text: displayText,
          status: status?.name || 'NOT_RECORDED'
        };
      });

      return gridRow;
    });
  }, [registryRows, lectures]);

  // Export function (handles both PDF and Excel)
  const onExporting = useCallback((e: DataGridTypes.ExportingEvent) => {
    if (e.format === 'pdf') {
      e.cancel = true; // Cancel default PDF export

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
          if (status?.name === 'ABSENT') return 'm';
          if (status?.name === 'PARTICIPATED') return '+';
          if (status?.name === 'LEAVE') return 'L';
          if (status?.name === 'PRESENT') return '';
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
    } else if (e.format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Registry');

      exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        // Find program from selected class
        const selectedProgram = programs.find((p: Program) => p.id === selectedClass?.programId);
        const programName = selectedProgram?.name || 'Program';
        const className = selectedClass?.name || 'Klasa';
        const subjectCode = selectedSubject?.code || 'Lenda';
        const typeName = selectedType?.name || 'Tipi';
        const fileName = `Regjistri_${programName}_${className}_${subjectCode}_${typeName}.xlsx`;

        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            fileName
          );
        });
      });
      e.cancel = true;
    }
  }, [programs, selectedClass, selectedSubject, selectedType, selectedProfessor, isAdminUser, professors, registryRows, lectures, formatDate]);

  // Custom cell render functions
  const renderStudentCell = useCallback((data: CellRenderData) => {
    return (
      <div className="flex items-center gap-2">
        <span>{data.value as string}</span>
        {data.data.studentMemo && (
          <Tooltip content={data.data.studentMemo} />
        )}
      </div>
    );
  }, []);

  const renderAttendanceCell = useCallback((data: CellRenderData) => {
    const attendance = data.value as AttendanceData;
    if (!attendance) return <span className="text-gray-400">-</span>;

    let className = "font-bold ";
    // if (attendance.status === 'ABSENT') className += "text-red-600";
    if (attendance.status === 'PARTICIPATED') className += "text-green-600";
    else if (attendance.status === 'LEAVE') className += "text-yellow-600";
    else className += "font-normal text-black-600";

    return <span className={className}>{attendance.text}</span>;
  }, []);

  const renderStatusCell = useCallback((data: CellRenderData) => {
    const status = data.value as string;
    const isNK = status === 'NK';
    if (!isNK) return <span></span>;
    return (
      <span className="text-red-600 font-bold">
        {status}
      </span>
    );
  }, []);

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
        <CommonDataGrid
          dataSource={gridData}
          keyExpr="id"
          onExporting={onExporting}
          storageKey="registryDataGrid"
          showRowNumber={false}
          wordWrapEnabled={false}
          columnChooser={{ enabled: false }}
          paging={{ pageSize: 100 }}
        >
          {/* Student Name Column */}
          <Column
            dataField="studentName"
            caption="Studenti"
            cellRender={renderStudentCell}
            minWidth={200}
            fixed={true}
            fixedPosition="left"
          />

          {/* Lecture Date Columns */}
          {lectures.map((lecture: Lecture) => (
            <Column
              key={lecture.id}
              dataField={`lecture_${lecture.id}`}
              caption={formatDate(lecture.date)}
              cellRender={renderAttendanceCell}
              width={60}
              alignment="center"
              allowSorting={false}
              allowFiltering={false}
              allowGrouping={false}
              customizeText={(data) => {
                const attendance = data.value as AttendanceData;
                return attendance ? attendance.text : '-';
              }}
            />
          ))}

          {/* Status Column */}
          <Column
            dataField="status"
            caption="Statusi"
            cellRender={renderStatusCell}
            width={100}
            alignment="center"
            fixed={true}
            fixedPosition="right"
            customizeText={(data) => {
              return data.value === 'NK' ? 'NK' : '';
            }}
          />
        </CommonDataGrid>

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Legjenda:</h4>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white"></span>
              <span>Prezent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white text-black-600 font-bold flex items-center justify-center">m</span>
              <span>Mungon</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white text-green-600 font-bold flex items-center justify-center">+</span>
              <span>Aktivizuar</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 border border-gray-300 bg-white text-yellow-600 font-bold flex items-center justify-center">L</span>
              <span>Me leje</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-red-100 text-red-600 font-bold rounded text-xs">NK</span>
              <span>Nuk kalon (Leksion: {'>'}50% mungesa, Seminar: {'>'}25% mungesa)</span>
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
};

export default memo(RegistryTable);