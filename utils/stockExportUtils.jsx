import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './stockPdfExportUtils';

export const exportToCSV = (data, fileName) => {
  const headers = ['Item Name', 'Item Code', 'HSN Code', 'Quantity', 'Units', 'Selling Price', 'Purchase Price', 'Category'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      `"${item.itemName || ''}"`,
      `"${item.itemCode || ''}"`,
      `"${item.HSNCode || ''}"`,
      `"${item.quantity || ''}"`,
      `"${item.units || ''}"`,
      `"${item.sellingPrice || ''}"`,
      `"${item.purchasePrice || ''}"`,
      `"${item.category || ''}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName) => {
  const excelData = data.map(item => ({
    'Item Name': item.itemName || '',
    'Item Code': item.itemCode || '',
    'HSN Code': item.HSNCode || '',
    'Quantity': item.quantity || 0,
    'Units': item.units || '',
    'Selling Price': item.sellingPrice || 0,
    'Purchase Price': item.purchasePrice || 'not mentioned',
    'Category': item.category || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Items');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };