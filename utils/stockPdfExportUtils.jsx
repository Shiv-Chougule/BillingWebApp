export const exportToPDF = async (data, fileName, filters = {}) => {
    try {
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
  
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Stock Items Report', 14, 22);
      
      // Add filters information if provided
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      let yPosition = 32;
      
      if (filters.dateFilter) {
        doc.text(`Date Filter: ${filters.dateFilter}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.stockFilter && filters.stockFilter !== 'all') {
        doc.text(`Stock Filter: ${filters.stockFilter}`, 14, yPosition);
        yPosition += 6;
      }
      
      if (filters.searchTerm) {
        doc.text(`Search Term: ${filters.searchTerm}`, 14, yPosition);
        yPosition += 6;
      }
      
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPosition);
      yPosition += 10;
      
      // Prepare table data - UPDATED FOR STOCK ITEMS
      const tableData = data.map(item => {
        const sellingPrice = parseFloat(item.sellingPrice) || 0;
        const purchasePrice = item.purchasePrice === 'not mentioned' ? 'N/A' : 
                            parseFloat(item.purchasePrice) || 0;
        
        return [
          item.itemName || 'N/A',
          item.itemCode || 'N/A',
          item.HSNCode || 'N/A',
          item.quantity || 0,
          item.units || 'N/A',
          sellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
          purchasePrice === 'N/A' ? 'N/A' : purchasePrice.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
          item.category || 'N/A'
        ];
      });
  
      // Use autoTable directly - UPDATED COLUMNS
      autoTable(doc, {
        startY: yPosition,
        head: [['Item Name', 'Item Code', 'HSN Code', 'Quantity', 'Units', 'Selling Price', 'Purchase Price', 'Category']],
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
          3: { halign: 'right' }, // Right align quantity
          5: { halign: 'right' }, // Right align selling price
          6: { halign: 'right' }  // Right align purchase price
        }
      });
  
      // Add summary statistics - UPDATED FOR STOCK ITEMS
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Items: ${data.length}`, 14, finalY);
      
      // Calculate stock statistics - UPDATED CALCULATIONS
      const stockStats = data.reduce((acc, item) => {
        const quantity = parseInt(item.quantity) || 0;
        const sellingPrice = parseFloat(item.sellingPrice) || 0;
        const purchasePrice = item.purchasePrice === 'not mentioned' ? 0 : parseFloat(item.purchasePrice) || 0;
        const category = item.category || 'Unknown';
        
        // Count by category
        if (!acc.categories[category]) {
          acc.categories[category] = 0;
        }
        acc.categories[category]++;
        
        // Stock status
        if (quantity > 0) {
          acc.inStock++;
          acc.totalInStockValue += sellingPrice * quantity;
        } else {
          acc.outOfStock++;
        }
        
        // Total values
        acc.totalQuantity += quantity;
        acc.totalSellingValue += sellingPrice * quantity;
        acc.totalPurchaseValue += purchasePrice * quantity;
        
        return acc;
      }, { 
        categories: {},
        inStock: 0,
        outOfStock: 0,
        totalQuantity: 0,
        totalSellingValue: 0,
        totalPurchaseValue: 0,
        totalInStockValue: 0
      });
  
      let summaryY = finalY + 10;
      doc.setFontSize(10);
      
      // Display category counts
      doc.text('Items by Category:', 14, summaryY);
      summaryY += 6;
      
      Object.entries(stockStats.categories).forEach(([category, count]) => {
        doc.text(`- ${category}: ${count} items`, 20, summaryY);
        summaryY += 5;
      });
      
      // Display stock status
      summaryY += 3;
      doc.text(`In Stock: ${stockStats.inStock} items`, 14, summaryY);
      summaryY += 5;
      doc.text(`Out of Stock: ${stockStats.outOfStock} items`, 14, summaryY);
      summaryY += 5;
      doc.text(`Total Quantity: ${stockStats.totalQuantity}`, 14, summaryY);
      
      // Display financial summary
      summaryY += 8;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Financial Summary:', 14, summaryY);
      summaryY += 6;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Selling Value: ${stockStats.totalSellingValue.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
      summaryY += 5;
      doc.text(`Total Purchase Value: ${stockStats.totalPurchaseValue.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
      summaryY += 5;
      doc.text(`Total In-Stock Value: ${stockStats.totalInStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`, 14, summaryY);
  
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