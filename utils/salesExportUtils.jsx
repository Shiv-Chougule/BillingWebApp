import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './salesPdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Invoice Number', 'Customer Name', 'Email Address', 'Date', 'Due Date', 'Total Amount', 'Payment Status'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(invoice => [
      `"${invoice.invoiceNumber || ''}"`,
      `"${invoice.customerName || ''}"`,
      `"${invoice.email || ''}"`,
      `"${new Date(invoice.invoiceDate).toLocaleDateString()}"`,
      `"${new Date(invoice.dueDate).toLocaleDateString()}"`,
      `"${invoice.totalAmount || ''}"`,
      `"${invoice.paymentStatus || ''}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(invoice => ({
    'Invoice Number': invoice.invoiceNumber || '',
    'Customer Name': invoice.customerName || '',
    'Email Address': invoice.email || 'N/A',
    'Date': new Date(invoice.invoiceDate).toLocaleDateString(),
    'Due Date': new Date(invoice.dueDate).toLocaleDateString(),
    'Total Amount': invoice.totalAmount || 0,
    'Payment Status': invoice.paymentStatus || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Entries');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };