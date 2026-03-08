import { DataGridTypes } from "devextreme-react/data-grid";
import { exportDataGrid as exportDataGridToPdf } from "devextreme/pdf_exporter";
import { exportDataGrid as exportDataGridToExcel } from "devextreme/excel_exporter";
import { jsPDF } from "jspdf";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

interface ExportOptions {
  title: string;
  subtitle?: string;
  fileName: string;
  columnWidths?: number[];
}

/**
 * Standardized export handler for DevExtreme DataGrids.
 * Handles both PDF and Excel export with consistent formatting.
 */
export function createExportHandler(options: ExportOptions) {
  const { title, subtitle, fileName, columnWidths } = options;

  return (e: DataGridTypes.ExportingEvent) => {
    if (e.format === "pdf") {
      exportToPdf(e, { title, subtitle, fileName, columnWidths });
    } else if (e.format === "xlsx") {
      exportToExcel(e, fileName);
    }
  };
}

function exportToPdf(
  e: DataGridTypes.ExportingEvent,
  options: ExportOptions
) {
  const doc = new jsPDF();
  const { title, subtitle, fileName, columnWidths } = options;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, 20);

  let topOffset = 30;
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 15, topOffset);
    topOffset += 10;
  }

  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString("sq-AL")}`, 15, topOffset);
  topOffset += 10;

  exportDataGridToPdf({
    jsPDFDocument: doc,
    component: e.component,
    selectedRowsOnly: e.selectedRowsOnly,
    indent: 5,
    topLeft: { x: 10, y: topOffset },
    ...(columnWidths && { columnWidths }),
    customizeCell: (options) => {
      if (
        options.gridCell &&
        options.pdfCell &&
        (options.gridCell.rowType === "data" || options.gridCell.rowType === "header")
      ) {
        options.pdfCell.borderColor = "#FFFFFF";
        options.pdfCell.font = {
          size: options.gridCell.rowType === "header" ? 9 : 8,
        };
      }
    },
  }).then(() => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const footerY = pageHeight - 15;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);

      doc.text("Gjeneruar nga www.mungesa.app", 15, footerY);

      const centerText = "Developed by JK";
      doc.text(centerText, (pageWidth - doc.getTextWidth(centerText)) / 2, footerY);

      const pageText = `${i}/${totalPages}`;
      doc.text(pageText, pageWidth - doc.getTextWidth(pageText) - 15, footerY);
    }
    doc.save(`${fileName}.pdf`);
  });
}

function exportToExcel(e: DataGridTypes.ExportingEvent, fileName: string) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(fileName);

  exportDataGridToExcel({
    component: e.component,
    worksheet,
    selectedRowsOnly: e.selectedRowsOnly,
    autoFilterEnabled: true,
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        `${fileName}.xlsx`
      );
    });
  });
}
