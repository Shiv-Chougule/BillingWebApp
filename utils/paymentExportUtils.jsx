import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './paymentPdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Date', 'Payment Number', 'Customer Name', 'Payment Mode', 'Paid Amount'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(payment => [
      `"${new Date(payment.date).toLocaleDateString()}"`,
      `"${payment.paymentNumber || ''}"`,
      `"${payment.customerName || ''}"`,
      `"${payment.paymentMode || ''}"`,
      `"${payment.paidAmount || ''}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(payment => ({
    'Date': new Date(payment.date).toLocaleDateString(),
    'Payment Number': payment.paymentNumber || '',
    'Customer Name': payment.customerName || '',
    'Payment Mode': payment.paymentMode || '',
    'Paid Amount': payment.paidAmount || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Entries');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };