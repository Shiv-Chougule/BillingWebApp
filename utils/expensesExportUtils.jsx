import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportToPDF } from './expensesPdfExportUtils';

export const exportToCSV = (data, fileName, categories) => {
  const headers = ['Date', 'Category', 'Payment Method', 'Amount', 'Description'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      `"${new Date(item.date).toLocaleDateString()}"`,
      `"${(categories || []).find(cat => cat.value === item.category)?.label || item.category}"`,
      `"${item.paymentMethod || ''}"`,
      `"${item.amount || ''}"`,
      `"${item.description || ''}"`
    ].join(',')) 
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToXLSX = (data, fileName, categories = []) => {
  const excelData = data.map(item => ({
    'Date': new Date(item.date).toLocaleDateString(),
    'Category': (categories || []).find(cat => cat.value === item.category)?.label || item.category,
    'Payment Method': item.paymentMethod || '',
    'Amount': item.amount || 0,
    'Description': item.description || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Entries');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export the PDF function directly
export { exportToPDF };