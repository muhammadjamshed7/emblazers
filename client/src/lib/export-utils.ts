import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Column } from "@/components/shared/data-table";

export interface SummaryRow {
  label: string;
  value: string;
}

export interface ExportConfig<T> {
  title: string;
  filename: string;
  data: T[];
  columns: Column<T>[];
  excludeColumns?: string[];
  summaryRows?: SummaryRow[];
}

function getPlainTextValue<T>(item: T, column: Column<T>): string {
  const value = (item as Record<string, unknown>)[column.key];
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function exportToPDF<T extends Record<string, unknown>>({
  title,
  filename,
  data,
  columns,
  excludeColumns = [],
  summaryRows = [],
}: ExportConfig<T>) {
  const doc = new jsPDF();
  
  const filteredColumns = columns.filter(col => !excludeColumns.includes(col.key));
  
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

  const headers = filteredColumns.map((col) => col.label);
  const rows = data.map((item) =>
    filteredColumns.map((col) => getPlainTextValue(item, col))
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 35 },
  });

  if (summaryRows.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary", 14, finalY + 15);
    
    autoTable(doc, {
      body: summaryRows.map(row => [row.label, row.value]),
      startY: finalY + 20,
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 80 },
        1: { halign: "right", cellWidth: 60 },
      },
      theme: "plain",
      tableWidth: 140,
    });
  }

  doc.save(`${filename}.pdf`);
}

export function exportToExcel<T extends Record<string, unknown>>({
  title,
  filename,
  data,
  columns,
  excludeColumns = [],
  summaryRows = [],
}: ExportConfig<T>) {
  const filteredColumns = columns.filter(col => !excludeColumns.includes(col.key));
  
  const worksheetData = [
    filteredColumns.map((col) => col.label),
    ...data.map((item) =>
      filteredColumns.map((col) => getPlainTextValue(item, col))
    ),
  ];

  if (summaryRows.length > 0) {
    worksheetData.push([]);
    worksheetData.push(["Summary", ""]);
    summaryRows.forEach(row => {
      worksheetData.push([row.label, row.value]);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  const colWidths = filteredColumns.map((col) => ({
    wch: Math.max(
      col.label.length,
      ...data.map((item) => getPlainTextValue(item, col).length)
    ) + 2,
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
