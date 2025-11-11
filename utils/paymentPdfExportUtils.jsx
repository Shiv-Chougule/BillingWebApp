export const exportToPDF = async (data, fileName, filters = {}) => {
    try {
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
  
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Payment Entries Report', 14, 22);
      
      // Add filters information if provided
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      let yPosition = 32;
      
      if (filters.dateFilter) {
        doc.text(`Date Filter: ${filters.dateFilter}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.searchTerm) {
        doc.text(`Search Term: ${filters.searchTerm}`, 14, yPosition);
        yPosition += 6;
      }
      
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPosition);
      yPosition += 10;
      
      // Prepare table data for payments
      const tableData = data.map(payment => {
        const paidAmount = parseFloat(payment.paidAmount) || 0;
        return [
          new Date(payment.date).toLocaleDateString(),
          payment.paymentNumber || 'N/A',
          payment.customerName || 'N/A',
          payment.paymentMode || 'N/A',
          paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
        ];
      });
  
      // Use autoTable directly
      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Payment Number', 'Customer Name', 'Payment Mode', 'Paid Amount']],
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
          4: { halign: 'right' } // Right align Paid Amount column
        }
      });
  
      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Payments: ${data.length}`, 14, finalY);
      
      // Calculate total amounts by payment mode
      const totals = data.reduce((acc, payment) => {
        const paidAmount = parseFloat(payment.paidAmount) || 0;
        const paymentMode = payment.paymentMode || 'Unknown';
        
        if (!acc[paymentMode]) {
          acc[paymentMode] = 0;
        }
        acc[paymentMode] += paidAmount;
        acc.total += paidAmount;
        return acc;
      }, { total: 0 });
  
      let summaryY = finalY + 10;
      doc.setFontSize(10);
      
      // Display payment mode totals
      Object.entries(totals).forEach(([mode, amount]) => {
        if (mode !== 'total') {
          doc.text(`${mode}: ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
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