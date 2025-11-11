'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('./BarChart'), { 
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>
});

const PaymentBarChart = ({ payments, dark = false, showMonthly = false, selectedMonth = '' }) => {
  // Monthly data - shown when showMonthly is true
  const monthlyData = useMemo(() => {
    const monthlyPayments = Array(12).fill(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    payments.forEach(payment => {
      if (payment?.paymentDate) {
        try {
          const date = new Date(payment.paymentDate);
          const month = date.getMonth();
          monthlyPayments[month] += payment.totalPaid || 0;
        } catch (error) {
          console.error('Error processing payment date:', error);
        }
      }
    });

    return months.map((month, index) => ({
      label: month,
      value: monthlyPayments[index]
    }));
  }, [payments]);

  // Specific month data - shown when showMonthly is true and selectedMonth has value
  const specificMonthData = useMemo(() => {
    if (!showMonthly || !selectedMonth || selectedMonth === '') return null;

    const monthIndex = parseInt(selectedMonth);
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Filter payments for the selected month
    const monthPayments = payments.filter(payment => {
      if (!payment?.paymentDate) return false;
      try {
        const date = new Date(payment.paymentDate);
        return date.getMonth() === monthIndex;
      } catch (error) {
        console.error('Error processing payment date:', error);
        return false;
      }
    });

    // Group by day of the month
    const dailyPayments = {};
    monthPayments.forEach(payment => {
      if (payment?.paymentDate) {
        try {
          const date = new Date(payment.paymentDate);
          const day = date.getDate();
          if (!dailyPayments[day]) {
            dailyPayments[day] = 0;
          }
          dailyPayments[day] += payment.totalPaid || 0;
        } catch (error) {
          console.error('Error processing payment date:', error);
        }
      }
    });

    // Convert to array format for chart
    const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      chartData.push({
        label: ` ${day}`,
        value: dailyPayments[day] || 0
      });
    }

    return {
      monthName: monthNames[monthIndex],
      data: chartData
    };
  }, [payments, showMonthly, selectedMonth]);

  // Top 5 customers data
  const topCustomersData = useMemo(() => {
    const customerTotals = {};

    // Filter payments based on showMonthly and selectedMonth
    const filteredPayments = payments.filter(payment => {
      if (showMonthly && selectedMonth && selectedMonth !== '') {
        try {
          const date = new Date(payment.paymentDate);
          return date.getMonth() === parseInt(selectedMonth);
        } catch (error) {
          return false;
        }
      }
      return true;
    });

    // Calculate total payments per customer
    filteredPayments.forEach(payment => {
      const customerName = payment.customerName || 'Unknown Customer';
      if (!customerTotals[customerName]) {
        customerTotals[customerName] = 0;
      }
      customerTotals[customerName] += payment.totalPaid || 0;
    });

    // Sort by total paid and take top 5
    return Object.entries(customerTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([customer, amount]) => ({
        label: customer.length > 12 ? customer.substring(0, 12) + '...' : customer,
        value: amount,
        fullLabel: customer
      }));
  }, [payments, showMonthly, selectedMonth]);

  // Determine which data to display
  const displayData = useMemo(() => {
    if (showMonthly && selectedMonth && selectedMonth !== '') {
      return specificMonthData;
    } else if (showMonthly) {
      return { monthName: 'All Months', data: monthlyData };
    } else {
      return { monthName: 'Yearly Overview', data: monthlyData };
    }
  }, [showMonthly, selectedMonth, specificMonthData, monthlyData]);

  if (!displayData) {
    return (
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="h-80 flex items-center justify-center">
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No data available</p>
        </div>
      </div>
    );
  }

  const totalAmount = displayData.data.reduce((sum, item) => sum + item.value, 0);
  const transactionCount = payments.filter(p => {
    if (showMonthly && selectedMonth && selectedMonth !== '') {
      try {
        const date = new Date(p.paymentDate);
        return date.getMonth() === parseInt(selectedMonth);
      } catch (error) {
        return false;
      }
    }
    return true;
  }).length;

  const topCustomer = topCustomersData[0]?.fullLabel || 'No data';

  return (
    <div className="flex space-y-6 flex-col">
      {/* Main Payments Chart */}
      <div className={`p-6 rounded-lg shadow-sm flex-1 flex-row ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Daily Payments - ${displayData.monthName}`
            : 'Monthly Payments Overview'
          }
        </h3>
        <BarChart 
          data={displayData.data} 
          dark={dark} 
          width={800} 
          height={400}
          showGrid={true}
        />
        
        {/* Summary statistics */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Total: ₹{totalAmount.toLocaleString()} • 
            Transactions: {transactionCount}
          </p>
        </div>
      </div>

      {/* Top Customers Chart */}
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Top Customers - ${displayData.monthName}`
            : 'Top 5 Customers'
          }
        </h3>
        <BarChart 
          data={topCustomersData} 
          dark={dark} 
          width={800} 
          height={400}
          showGrid={true}
          horizontal={true} // Horizontal bars for better customer name display
        />
        
        {/* Customer summary */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Top Customer: {topCustomer} • 
            Total Customers: {Object.keys(topCustomersData).length}
          </p>
          <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total from Top 5: ₹{topCustomersData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentBarChart;