export const exportToPDF = async (data, fileName, filters = {}) => {
    try {
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
  
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Bank Entries Report', 14, 22);
      
      // Add filters information if provided
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      let yPosition = 32;
      
      if (filters.dateFilter) {
        doc.text(`Date Filter: ${filters.dateFilter}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.transactionType && filters.transactionType !== 'all') {
        doc.text(`Transaction Type: ${filters.transactionType}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.searchTerm) {
        doc.text(`Search Term: ${filters.searchTerm}`, 14, yPosition);
        yPosition += 6;
      }
      
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPosition);
      yPosition += 10;
      
      // Prepare table data - FIXED AMOUNT FORMATTING
      const tableData = data.map(entry => {
        const amount = parseFloat(entry.amount) || 0;
        return [
          entry.transactionID || 'N/A',
          new Date(entry.transactionDate).toLocaleDateString(),
          amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
          entry.transactionType || 'N/A',
          entry.description || ''
        ];
      });
  
      // Use autoTable directly
      autoTable(doc, {
        startY: yPosition,
        head: [['Transaction ID', 'Date', 'Amount', 'Transaction Type', 'Description']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: yPosition },
        columnStyles: {
          2: { halign: 'right' } // Right align amount column
        }
      });
  
      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Entries: ${data.length}`, 14, finalY);
      
      // Calculate total amounts by type - FIXED CALCULATION
      const totals = data.reduce((acc, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        const transactionType = entry.transactionType || 'Unknown';
        
        if (!acc[transactionType]) {
          acc[transactionType] = 0;
        }
        acc[transactionType] += amount;
        acc.total += amount;
        return acc;
      }, { total: 0 });
  
      let summaryY = finalY + 10;
      doc.setFontSize(10);
      
      // Display transaction type totals
      Object.entries(totals).forEach(([type, amount]) => {
        if (type !== 'total') {
          doc.text(`${type}: ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
          summaryY += 6;
        }
      });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Grand Total: ${totals.total.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY + 5);
  
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
  
      // Save the PDF
      doc.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };