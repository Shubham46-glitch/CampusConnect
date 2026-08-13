import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates an official CampusConnect PDF Document / Receipt
 */
export const exportReceiptPDF = ({ title, subtitle, items = [], details = {} }) => {
  const doc = new jsPDF();

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CampusConnect', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('OFFICIAL ACADEMIC & PLATFORM DOCUMENT', 14, 28);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 20);

  // Document Section Header
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title || 'Document Summary', 14, 52);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 58);
  }

  let startY = subtitle ? 66 : 60;

  // Key-Value Details Summary
  if (Object.keys(details).length > 0) {
    const detailRows = Object.entries(details).map(([key, val]) => [key, val]);
    doc.autoTable({
      startY,
      head: [['Specification', 'Details']],
      body: detailRows,
      theme: 'grid',
      headStyles: { fillStyle: 'F', fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
    });
    startY = doc.lastAutoTable.finalY + 10;
  }

  // Items Table
  if (items.length > 0) {
    const headers = Object.keys(items[0]);
    const rows = items.map((item) => Object.values(item));

    doc.autoTable({
      startY,
      head: [headers],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3.5 },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`CampusConnect™ Smart College Platform — Page ${i} of ${pageCount}`, 14, 287);
  }

  // Save File
  const filename = `${(title || 'CampusConnect_Doc').toLowerCase().replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
