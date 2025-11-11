'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('./BarChart'), { 
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>
});

const InvoiceBarChart = ({ invoices, dark = false, showMonthly = false, selectedMonth = '' }) => {
  // Monthly invoice amounts - shown when showMonthly is false or no specific month selected
  const monthlyAmountData = useMemo(() => {
    const monthlyAmounts = Array(12).fill(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    invoices.forEach(invoice => {
      if (invoice?.invoiceDate) {
        try {
          const date = new Date(invoice.invoiceDate);
          const month = date.getMonth();
          monthlyAmounts[month] += invoice.total || 0;
        } catch (error) {
          console.error('Error processing invoice date:', error);
        }
      }
    });

    return months.map((month, index) => ({
      label: month,
      value: monthlyAmounts[index]
    }));
  }, [invoices]);

  // Specific month invoice data - shown when showMonthly is true and selectedMonth has value
  const specificMonthData = useMemo(() => {
    if (!showMonthly || !selectedMonth || selectedMonth === '') return null;

    const monthIndex = parseInt(selectedMonth);
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Filter invoices for the selected month
    const monthInvoices = invoices.filter(invoice => {
      if (!invoice?.invoiceDate) return false;
      try {
        const date = new Date(invoice.invoiceDate);
        return date.getMonth() === monthIndex;
      } catch (error) {
        console.error('Error processing invoice date:', error);
        return false;
      }
    });

    // Group by day of the month for amounts
    const dailyAmounts = {};
    monthInvoices.forEach(invoice => {
      if (invoice?.invoiceDate) {
        try {
          const date = new Date(invoice.invoiceDate);
          const day = date.getDate();
          if (!dailyAmounts[day]) {
            dailyAmounts[day] = 0;
          }
          dailyAmounts[day] += invoice.total || 0;
        } catch (error) {
          console.error('Error processing invoice date:', error);
        }
      }
    });

    // Convert to array format for chart
    const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      chartData.push({
        label: `${day}`,
        value: dailyAmounts[day] || 0
      });
    }

    return {
      monthName: monthNames[monthIndex],
      data: chartData,
      invoices: monthInvoices
    };
  }, [invoices, showMonthly, selectedMonth]);

  // Invoice status data (always calculated from filtered invoices)
  const invoiceStatusData = useMemo(() => {
    const invoicesToUse = showMonthly && selectedMonth && selectedMonth !== '' 
      ? invoices.filter(invoice => {
          if (!invoice?.invoiceDate) return false;
          try {
            const date = new Date(invoice.invoiceDate);
            return date.getMonth() === parseInt(selectedMonth);
          } catch (error) {
            return false;
          }
        })
      : invoices;

    const statusCounts = {
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0
    };

    invoicesToUse.forEach(invoice => {
      const status = invoice?.paymentStatus?.toLowerCase() || 'draft';
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [invoices, showMonthly, selectedMonth]);

  // Determine which amount data to display
  const displayAmountData = useMemo(() => {
    if (showMonthly && selectedMonth && selectedMonth !== '') {
      return specificMonthData;
    } else {
      return { 
        monthName: showMonthly ? 'All Months' : 'Yearly Overview', 
        data: monthlyAmountData 
      };
    }
  }, [showMonthly, selectedMonth, specificMonthData, monthlyAmountData]);

  if (!displayAmountData) {
    return (
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="h-80 flex items-center justify-center">
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No data available</p>
        </div>
      </div>
    );
  }

  const totalInvoices = showMonthly && selectedMonth && selectedMonth !== '' 
    ? specificMonthData?.invoices?.length || 0
    : invoices.length;

  const totalAmount = displayAmountData.data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 flex flex-col">
      {/* Invoice Amounts Chart */}
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Daily Invoice Amounts - ${displayAmountData.monthName}`
            : 'Monthly Invoice Amounts'
          }
        </h3>
        <BarChart 
          data={displayAmountData.data} 
          dark={dark} 
          width={800} 
          height={400} 
          showGrid={true}
        />
        
        {/* Summary statistics */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Total Amount: ₹{totalAmount.toLocaleString()} • 
            Invoices: {totalInvoices}
          </p>
        </div>
      </div>

      {/* Invoice Status Chart */}
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Status - ${displayAmountData.monthName}`
            : 'Invoices by Status'
          }
        </h3>
        <BarChart 
          data={invoiceStatusData} 
          dark={dark} 
          width={800} 
          height={400} 
          showGrid={true}
          isStatusChart={true}
        />
        
        {/* Status summary */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Paid: {invoiceStatusData.find(item => item.label === 'Paid')?.value || 0} • 
            Pending: {invoiceStatusData.find(item => item.label === 'Pending')?.value || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBarChart;