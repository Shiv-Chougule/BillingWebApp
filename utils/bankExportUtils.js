import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './bankPdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Transaction ID', 'Date', 'Amount', 'Transaction Type', 'Description'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(entry => [
      `"${entry.transactionID || ''}"`,
      `"${new Date(entry.transactionDate).toLocaleDateString()}"`,
      `"${entry.amount || ''}"`,
      `"${entry.transactionType || ''}"`,
      `"${entry.description || ''}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(entry => ({
    'Transaction ID': entry.transactionID || '',
    'Date': new Date(entry.transactionDate).toLocaleDateString(),
    'Amount': entry.amount || 0,
    'Transaction Type': entry.transactionType || '',
    'Description': entry.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Entries');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };