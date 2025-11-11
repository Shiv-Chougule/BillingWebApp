export const exportToPDF = async (data, fileName, filters = {}) => {
    try {
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
  
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Sales Invoices Report', 14, 22);
      
      // Add filters information if provided
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      let yPosition = 32;
      
      if (filters.dateFilter) {
        doc.text(`Date Filter: ${filters.dateFilter}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.status && filters.status !== 'all') {
        doc.text(`Status: ${filters.status}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.searchTerm) {
        doc.text(`Search Term: ${filters.searchTerm}`, 14, yPosition);
        yPosition += 6;
      }
      
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPosition);
      yPosition += 10;
      
      // Prepare table data for invoices
      const tableData = data.map(invoice => {
        const totalAmount = parseFloat(invoice.totalAmount) || 0;
        return [
          invoice.invoiceNumber || 'N/A',
          invoice.customerName || 'N/A',
          invoice.email || 'N/A',
          new Date(invoice.invoiceDate).toLocaleDateString(),
          new Date(invoice.dueDate).toLocaleDateString(),
          totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
          invoice.paymentStatus || 'N/A'
        ];
      });
  
      // Use autoTable directly
      autoTable(doc, {
        startY: yPosition,
        head: [['Invoice Number', 'Customer Name', 'Email Address', 'Date', 'Due Date', 'Total Amount', 'Payment Status']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 7,
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
          5: { halign: 'right' } // Right align Total Amount column
        }
      });
  
      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Invoices: ${data.length}`, 14, finalY);
      
      // Calculate total amounts by payment status
      const totals = data.reduce((acc, invoice) => {
        const totalAmount = parseFloat(invoice.totalAmount) || 0;
        const paymentStatus = invoice.paymentStatus || 'Unknown';
        
        if (!acc[paymentStatus]) {
          acc[paymentStatus] = 0;
        }
        acc[paymentStatus] += totalAmount;
        acc.total += totalAmount;
        return acc;
      }, { total: 0 });

      // Count invoices by status
      const statusCounts = data.reduce((acc, invoice) => {
        const status = invoice.paymentStatus || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      let summaryY = finalY + 10;
      doc.setFontSize(10);
      
      // Display status counts
      doc.text('Invoices by Status:', 14, summaryY);
      summaryY += 6;
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`- ${status}: ${count} invoices`, 20, summaryY);
        summaryY += 5;
      });
      
      // Display financial totals by status
      summaryY += 3;
      doc.text('Amounts by Status:', 14, summaryY);
      summaryY += 6;
      
      Object.entries(totals).forEach(([status, amount]) => {
        if (status !== 'total') {
          doc.text(`${status}: ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
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