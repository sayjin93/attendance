"use client";

import { useQuery } from "@tanstack/react-query";
import autoTable from "jspdf-autotable";
import { useState, useMemo, useCallback } from "react";
import { Column, DataGridTypes } from "devextreme-react/data-grid";
import { jsPDF } from "jspdf";
import { exportDataGrid as exportDataGridToExcel } from "devextreme/excel_exporter";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import CommonDataGrid from "../../../components/ui/CommonDataGrid";
import Skeleton from "../../../components/ui/Skeleton";
import Tooltip from "../../../components/ui/Tooltip";
import { useNotify } from "../../../contexts/NotifyContext";
import { fetchReportData, fetchClassesByProfessor } from "../../../hooks/fetchFunctions";
import {
  RegistryClass as Class,
  RegistrySubject as Subject,
  StudentReport,
  ReportData
} from "@/types";

export default function ReportsPageClient({
  professorId,
}: {
  professorId: string;
}) {
  const { showMessage } = useNotify();

  //#region states
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  //#endregion

  //#region useQuery
  // Fetch classes first (includes program info)
  const {
    data: classes,
    isLoading: loadingClasses,
    error: errorClasses,
  } = useQuery<Class[]>({
    queryKey: ["classes-for-reports", professorId],
    queryFn: () => fetchClassesByProfessor(professorId),
    enabled: !!professorId,
  });

  // Find selected class first (needed for other queries)
  const selectedClass = classes?.find(c => c.id === selectedClassId) || null;

  // Fetch subjects when class is selected
  const {
    data: subjectsData,
    isLoading: loadingSubjects,
  } = useQuery<{ subjects: Subject[] }>({
    queryKey: ["report-subjects", professorId, selectedClassId],
    queryFn: () => fetchReportData(professorId, selectedClass?.programId || "", selectedClassId, ""),
    enabled: !!professorId && !!selectedClassId,
    select: (data) => ({
      subjects: data.subjects || []
    })
  });

  // Fetch full report data when all filters are selected
  const {
    data: reportData,
    isLoading: loadingReports,
    error: errorReports,
  } = useQuery<ReportData>({
    queryKey: ["reports", professorId, selectedClass?.programId, selectedClassId, selectedSubjectId],
    queryFn: () => fetchReportData(professorId, selectedClass?.programId || "", selectedClassId, selectedSubjectId),
    enabled: !!professorId && !!selectedClassId && !!selectedSubjectId,
  });
  //#endregion

  //#region computed values
  // Extract data from queries
  const subjects = subjectsData?.subjects || [];
  const students = reportData?.students || [];

  // Group classes by program for the dropdown - memoized
  const groupedClasses = useMemo(() => {
    return classes?.reduce((acc, cls) => {
      const programName = cls.program?.name || 'Other';
      if (!acc[programName]) {
        acc[programName] = [];
      }
      acc[programName].push(cls);
      return acc;
    }, {} as Record<string, Class[]>) || {};
  }, [classes]);

  // Reset functions - memoized to prevent re-renders
  const resetSelections = useCallback((from: 'class') => {
    if (from === 'class') {
      setSelectedSubjectId("");
    }
  }, []);
  //#endregion

  //#region functions
  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      const { program, class: className, subject } = reportData?.metadata || {};

      // Title
      doc.setFontSize(16);
      doc.text(`Raporti i Prezencës`, 20, 20);

      // Metadata - Combined class and program
      doc.setFontSize(12);
      doc.text(`Klasa: ${className || 'Të gjitha'}${program ? ` (${program})` : ''}`, 20, 35);
      doc.text(`Lënda: ${subject || 'Të gjitha'}`, 20, 45);

      // Summary - Two columns
      if (reportData?.summary) {
        // Left column
        doc.text(`Total Studentë: ${reportData.summary.totalStudents}`, 20, 60);
        doc.text(`Prezenca Mesatare: ${reportData.summary.averageAttendance.toFixed(1)}%`, 20, 70);

        // Right column
        const pageWidth = doc.internal.pageSize.width;
        const rightColumnX = pageWidth / 2 + 10;
        doc.text(`Studentë të Kaluar: ${reportData.summary.passedStudents}`, rightColumnX, 60);
        doc.text(`Studentë NK: ${reportData.summary.failedStudents}`, rightColumnX, 70);
      }

      // Table
      autoTable(doc, {
        startY: 85,
        head: [["Studenti", "Leksione (%)", "Leje (L)", "Aktiv.(L)", "Seminare (%)", "Leje (S)", "Aktiv.(S)", "Statusi"]],
        body: students.map((s: StudentReport) => [
          `${s.firstName} ${s.lastName}`,
          `${s.attendancePercentage.toFixed(1)}%`,
          (s.leaveLectures || 0).toString(),
          s.participatedLectures.toString(),
          `${s.seminarPercentage.toFixed(1)}%`,
          (s.leaveSeminars || 0).toString(),
          s.participatedSeminars.toString(),
          s.overallPassed ? "KALOI" : "NK"
        ]),
      });

      const fileName = `Raporti_${program || 'TeGjitha'}_${className || 'TeGjitha'}_${subject || 'TeGjitha'}.pdf`;
      doc.save(fileName);
    } else if (e.format === 'xlsx') {
      const { program, class: className, subject } = reportData?.metadata || {};
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Raporti i Studenteve');

      // Add title row
      worksheet.mergeCells('A1:G1');
      const titleRow = worksheet.getCell('A1');
      titleRow.value = 'Raporti i Prezencës';
      titleRow.font = { size: 16, bold: true };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Add metadata
      worksheet.getCell('A3').value = `Klasa: ${className || 'Të gjitha'}${program ? ` (${program})` : ''}`;
      worksheet.getCell('A4').value = `Lënda: ${subject || 'Të gjitha'}`;

      // Add summary in two columns
      if (reportData?.summary) {
        worksheet.getCell('A6').value = `Total Studentë: ${reportData.summary.totalStudents}`;
        worksheet.getCell('A7').value = `Prezenca Mesatare: ${reportData.summary.averageAttendance.toFixed(1)}%`;
        worksheet.getCell('D6').value = `Studentë të Kaluar: ${reportData.summary.passedStudents}`;
        worksheet.getCell('D7').value = `Studentë NK: ${reportData.summary.failedStudents}`;
      }

      exportDataGridToExcel({
        component: e.component,
        worksheet: worksheet,
        topLeftCell: { row: 9, column: 1 },
        autoFilterEnabled: true,
      }).then(() => {
        // Auto-fit columns
        worksheet.columns.forEach((column) => {
          if (column) {
            let maxLength = 0;
            column.eachCell?.({ includeEmpty: true }, (cell) => {
              const cellValue = cell.value ? cell.value.toString() : '';
              maxLength = Math.max(maxLength, cellValue.length);
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
          }
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
          const excelFileName = `Raporti_${program || 'TeGjitha'}_${className || 'TeGjitha'}_${subject || 'TeGjitha'}.xlsx`;
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), excelFileName);
        });
      });
    }
  };
  //#endregion

  if (errorClasses) {
    showMessage("Gabim gjatë ngarkimit të klasave.", "error");
    return <Alert type="error" title="Ka ndodhur një gabim gjatë ngarkimit të të dhënave." />;
  }

  if (errorReports) {
    showMessage("Gabim gjatë ngarkimit të raporteve.", "error");
    return <Alert type="error" title="Ka ndodhur një gabim gjatë ngarkimit të raporteve." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card title="Zgjidhni Klasën dhe Lëndën">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klasa *
            </label>
            <select
              value={selectedClassId || ""}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                resetSelections('class');
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">
                {loadingClasses
                  ? "Duke ngarkuar..."
                  : classes?.length === 0
                    ? "Nuk ka klasa"
                    : "Zgjidhni një klasë..."}
              </option>

              {Object.entries(groupedClasses).map(([programName, programClasses]) => (
                <optgroup key={programName} label={programName}>
                  {programClasses.map((cls: Class) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </optgroup>
              ))}

              {/* Fallback: show all classes without grouping if grouping fails */}
              {Object.entries(groupedClasses).length === 0 && classes?.map((cls: Class) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lënda *
            </label>
            <select
              disabled={!selectedClassId}
              value={selectedSubjectId || ""}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedClassId
                ? "border-gray-300 bg-white"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              required
            >
              <option value="">
                {!selectedClassId
                  ? "Zgjidhni një klasë fillimisht"
                  : loadingSubjects
                    ? "Duke ngarkuar..."
                    : subjects?.length === 0
                      ? "Nuk ka lëndë për këtë klasë"
                      : "Zgjidhni një lëndë..."}
              </option>
              {selectedClassId && subjects && subjects.length > 0 &&
                subjects.map((subject: Subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      {loadingReports ? (
        <Card title="Përmbledhja">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg text-center">
                <Skeleton times={1} rootCls="h-8 w-16 mx-auto mb-2" />
                <Skeleton times={1} rootCls="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : reportData?.summary && students?.length > 0 ? (
        <Card title="Përmbledhja">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Studentë</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.summary.passedStudents}</div>
              <div className="text-sm text-gray-600">Kaluan</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{reportData.summary.failedStudents}</div>
              <div className="text-sm text-gray-600">NK</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{reportData.summary.averageAttendance.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Prezencë Mesatare</div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Student Report Table */}
      <Card title="Raporti i studentëve">
        {loadingReports ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Skeleton times={1} rootCls="h-9 w-48" />
            </div>
            <Skeleton times={1} rootCls="h-8 w-16 mx-auto mb-2" />

          </div>
        ) : (
          <CommonDataGrid
            dataSource={students}
            onExporting={onExporting}
            storageKey="reportsDataGrid"
            keyExpr="id"
            columnsAutoWidth={true}
            selection={{ mode: "none" }}
          >
            <Column
              dataField="firstName"
              caption="👤 Student"
              cellRender={(data) => (
                <div className="flex items-center gap-2">
                  <span>{data.data.firstName} {data.data.lastName}</span>
                  {data.data.memo && (
                    <Tooltip content={data.data.memo} />
                  )}
                </div>
              )}
            />
            <Column
              dataField="attendancePercentage"
              caption="📚 Leksione"
              alignment="center"
              cellRender={(data) => (
                <div className="flex flex-col items-center">
                  <span className={`px-2 py-1 rounded text-sm ${data.data.attendancePercentage >= 50
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {data.data.attendancePercentage.toFixed(1)}%
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {data.data.attendedLectures}/{data.data.totalLectures}
                  </div>
                </div>
              )}
            />
            <Column
              dataField="leaveLectures"
              caption="📅 Leje (L)"
              alignment="center"
              cellRender={(data) => (
                <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                  {data.data.leaveLectures || 0}
                </span>
              )}
            />
            <Column
              dataField="participatedLectures"
              caption="⭐ Aktivizime (L)"
              alignment="center"
              cellRender={(data) => (
                <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                  {data.data.participatedLectures}
                </span>
              )}
            />
            <Column
              dataField="seminarPercentage"
              caption="🎓 Seminare"
              alignment="center"
              cellRender={(data) => (
                <div className="flex flex-col items-center">
                  <span className={`px-2 py-1 rounded text-sm ${data.data.seminarPercentage >= 75
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {data.data.seminarPercentage.toFixed(1)}%
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {data.data.attendedSeminars}/{data.data.totalSeminars}
                  </div>
                </div>
              )}
            />
            <Column
              dataField="leaveSeminars"
              caption="📅 Leje (S)"
              alignment="center"
              cellRender={(data) => (
                <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                  {data.data.leaveSeminars || 0}
                </span>
              )}
            />
            <Column
              dataField="participatedSeminars"
              caption="⭐ Aktivizime (S)"
              alignment="center"
              cellRender={(data) => (
                <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                  {data.data.participatedSeminars}
                </span>
              )}
            />
            <Column
              dataField="overallPassed"
              caption="🏆 Statusi"
              alignment="center"
              cellRender={(data) => (
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${data.data.overallPassed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {data.data.overallPassed ? 'KALOI' : 'NK'}
                </span>
              )}
            />
          </CommonDataGrid>
        )}
      </Card>
    </div>
  );
}
