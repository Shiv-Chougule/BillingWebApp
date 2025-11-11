import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './vendorPdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Vendor Name', 'Company Name', 'Email', 'Phone', 'Total Paid', 'Total Amount', 'Payment Ratio'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(vendor => [
      `"${vendor.vendorName || ''}"`,
      `"${vendor.companyName || ''}"`,
      `"${vendor.email || ''}"`,
      `"${vendor.phone || ''}"`,
      `"${vendor.totalPaid || 0}"`,
      `"${vendor.totalAmount || 0}"`,
      `"${vendor.paymentRatio || 'N/A'}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(vendor => ({
    'Vendor Name': vendor.vendorName || '',
    'Company Name': vendor.companyName || '',
    'Email': vendor.email || '',
    'Phone': vendor.phone || '',
    'Total Paid': vendor.totalPaid || 0,
    'Total Amount': vendor.totalAmount || 0,
    'Payment Ratio': vendor.paymentRatio || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendors');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };