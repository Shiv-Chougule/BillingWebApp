export const exportToPDF = async (data, fileName, filters = {}) => {
  try {
    // Dynamic import for Next.js compatibility
    const { jsPDF } = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Vendors Report', 14, 22);
    
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
    
    // Prepare table data for vendors
    const tableData = data.map(vendor => {
      return [
        vendor.vendorName || 'N/A',
        vendor.companyName || 'N/A',
        vendor.email || 'N/A',
        vendor.phone || 'N/A',
        (vendor.totalPaid || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
        (vendor.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
        vendor.paymentRatio || 'N/A'
      ];
    });

    // Use autoTable directly
    autoTable(doc, {
      startY: yPosition,
      head: [['Vendor Name', 'Company Name', 'Email', 'Phone', 'Total Paid', 'Total Amount', 'Payment Ratio']],
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
        4: { halign: 'right' }, // Right align Total Paid column
        5: { halign: 'right' }  // Right align Total Amount column
      }
    });

    // Add summary statistics
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Vendors: ${data.length}`, 14, finalY);
    
    // Calculate total amounts
    const totals = data.reduce((acc, vendor) => {
      const totalPaid = parseFloat(vendor.totalPaid) || 0;
      const totalAmount = parseFloat(vendor.totalAmount) || 0;
      
      acc.totalPaid += totalPaid;
      acc.totalAmount += totalAmount;
      return acc;
    }, { totalPaid: 0, totalAmount: 0 });

    let summaryY = finalY + 10;
    doc.setFontSize(10);
    
    // Display vendor totals
    doc.text(`Total Paid: ${totals.totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
    summaryY += 6;
    
    doc.text(`Total Amount Due: ${totals.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
    summaryY += 6;
    
    // Calculate overall payment ratio
    const overallRatio = totals.totalAmount === 0 ? '0%' : `${((totals.totalPaid / totals.totalAmount) * 100).toFixed(2)}%`;
    doc.text(`Overall Payment Ratio: ${overallRatio}`, 14, summaryY);
    
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