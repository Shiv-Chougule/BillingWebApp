export const exportToPDF = async (data, fileName, filters = {}) => {
    try {
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
  
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Purchase Entries Report', 14, 22);
      
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
      
      // Prepare table data for purchases
      const tableData = data.map(purchase => {
        const totalAmount = parseFloat(purchase.totalAmount) || 0;
        
        return [
          new Date(purchase.purchaseDate).toLocaleDateString(),
          purchase.purchaseOrder || 'N/A',
          purchase.vendorName || 'N/A',
          purchase.vendorEmail || 'N/A',
          new Date(purchase.dueDate).toLocaleDateString(),
          totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
        ];
      });
  
      // Use autoTable directly
      autoTable(doc, {
        startY: yPosition,
        head: [['Purchase Date', 'Purchase Order No', 'Supplier Name', 'Supplier Email', 'Due Date', 'Total Amount']],
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
      doc.text(`Total Purchases: ${data.length}`, 14, finalY);
      
      // Calculate total amounts by vendor
      const totals = data.reduce((acc, purchase) => {
        const totalAmount = parseFloat(purchase.totalAmount) || 0;
        const vendorName = purchase.vendorName || 'Unknown Vendor';
        
        if (!acc[vendorName]) {
          acc[vendorName] = 0;
        }
        acc[vendorName] += totalAmount;
        acc.total += totalAmount;
        return acc;
      }, { total: 0 });
  
      let summaryY = finalY + 10;
      doc.setFontSize(10);
      
      // Display vendor totals
      Object.entries(totals).forEach(([vendorName, amount]) => {
        if (vendorName !== 'total') {
          doc.text(`${vendorName}: ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
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