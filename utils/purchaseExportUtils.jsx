import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './purchasePdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Purchase Date', 'Purchase Order No', 'Supplier Name', 'Supplier Email', 'Due Date', 'Total Amount'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(purchase => [
      `"${new Date(purchase.purchaseDate).toLocaleDateString()}"`,
      `"${purchase.purchaseOrder || ''}"`,
      `"${purchase.vendorName || ''}"`,
      `"${purchase.vendorEmail || ''}"`,
      `"${new Date(purchase.dueDate).toLocaleDateString()}"`,
      `"${purchase.totalAmount || ''}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(purchase => ({
    'Purchase Date': new Date(purchase.purchaseDate).toLocaleDateString(),
    'Purchase Order No': purchase.purchaseOrder || '',
    'Supplier Name': purchase.vendorName || '',
    'Supplier Email': purchase.vendorEmail || '',
    'Due Date': new Date(purchase.dueDate).toLocaleDateString(),
    'Total Amount': purchase.totalAmount || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Entries');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };