import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './customerPdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Customer Name', 'Company Name', 'Email', 'Phone', 'Total Paid', 'Total Amount', 'Payment Ratio'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(customer => [
      `"${customer.customerName || ''}"`,
      `"${customer.companyName || ''}"`,
      `"${customer.email || ''}"`,
      `"${customer.phone || ''}"`,
      `"${customer.totalPaid || 0}"`,
      `"${customer.totalAmount || 0}"`,
      `"${customer.paymentRatio || 'N/A'}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(customer => ({
    'Customer Name': customer.customerName || '',
    'Company Name': customer.companyName || '',
    'Email': customer.email || '',
    'Phone': customer.phone || '',
    'Total Paid': customer.totalPaid || 0,
    'Total Amount': customer.totalAmount || 0,
    'Payment Ratio': customer.paymentRatio || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };