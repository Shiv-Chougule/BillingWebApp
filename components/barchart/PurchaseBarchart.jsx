'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('./BarChart'), { 
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>
});

const PurchaseBarChart = ({ purchase, dark = false, showMonthly = false, selectedMonth = '' }) => {
  // Monthly purchase data - shown when showMonthly is false or no specific month selected
  const monthlyPurchaseData = useMemo(() => {
    const monthlyPurchases = Array(12).fill(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    purchase.forEach(purchaseItem => {
      if (purchaseItem?.purchaseDate) {
        try {
          const date = new Date(purchaseItem.purchaseDate);
          const month = date.getMonth();
          monthlyPurchases[month] += purchaseItem.total || 0;
        } catch (error) {
          console.error('Error processing purchase date:', error);
        }
      }
    });

    return months.map((month, index) => ({
      label: month,
      value: monthlyPurchases[index]
    }));
  }, [purchase]);

  // Specific month purchase data - shown when showMonthly is true and selectedMonth has value
  const specificMonthData = useMemo(() => {
    if (!showMonthly || !selectedMonth || selectedMonth === '') return null;

    const monthIndex = parseInt(selectedMonth);
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Filter purchases for the selected month
    const monthPurchases = purchase.filter(purchaseItem => {
      if (!purchaseItem?.purchaseDate) return false;
      try {
        const date = new Date(purchaseItem.purchaseDate);
        return date.getMonth() === monthIndex;
      } catch (error) {
        console.error('Error processing purchase date:', error);
        return false;
      }
    });

    // Group by day of the month for amounts
    const dailyPurchases = {};
    monthPurchases.forEach(purchaseItem => {
      if (purchaseItem?.purchaseDate) {
        try {
          const date = new Date(purchaseItem.purchaseDate);
          const day = date.getDate();
          if (!dailyPurchases[day]) {
            dailyPurchases[day] = 0;
          }
          dailyPurchases[day] += purchaseItem.total || 0;
        } catch (error) {
          console.error('Error processing purchase date:', error);
        }
      }
    });

    // Convert to array format for chart
    const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      chartData.push({
        label: ` ${day}`,
        value: dailyPurchases[day] || 0
      });
    }

    return {
      monthName: monthNames[monthIndex],
      data: chartData,
      purchases: monthPurchases
    };
  }, [purchase, showMonthly, selectedMonth]);

  // Top 5 vendors data
  const topVendorsData = useMemo(() => {
    const vendorTotals = {};

    // Filter purchases based on showMonthly and selectedMonth
    const filteredPurchases = purchase.filter(purchaseItem => {
      if (showMonthly && selectedMonth && selectedMonth !== '') {
        try {
          const date = new Date(purchaseItem.purchaseDate);
          return date.getMonth() === parseInt(selectedMonth);
        } catch (error) {
          return false;
        }
      }
      return true;
    });

    // Calculate total purchases per vendor
    filteredPurchases.forEach(purchaseItem => {
      const vendorName = purchaseItem.vendor?.vendorName || 'Unknown Vendor';
      if (!vendorTotals[vendorName]) {
        vendorTotals[vendorName] = 0;
      }
      vendorTotals[vendorName] += purchaseItem.total || 0;
    });

    // Sort by total purchase amount and take top 5
    return Object.entries(vendorTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([vendor, amount]) => ({
        label: vendor.length > 12 ? vendor.substring(0, 12) + '...' : vendor,
        value: amount,
        fullLabel: vendor
      }));
  }, [purchase, showMonthly, selectedMonth]);

  // Purchase status data (always calculated from filtered purchases)
  const purchaseStatusData = useMemo(() => {
    const purchasesToUse = showMonthly && selectedMonth && selectedMonth !== '' 
      ? purchase.filter(purchaseItem => {
          if (!purchaseItem?.purchaseDate) return false;
          try {
            const date = new Date(purchaseItem.purchaseDate);
            return date.getMonth() === parseInt(selectedMonth);
          } catch (error) {
            return false;
          }
        })
      : purchase;

    const statusCounts = {
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0
    };

    purchasesToUse.forEach(purchaseItem => {
      const status = purchaseItem?.paymentStatus?.toLowerCase() || 'pending';
      if (status in statusCounts) {
        statusCounts[status]++;
      } else {
        statusCounts.pending++; // Default to pending if status not recognized
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [purchase, showMonthly, selectedMonth]);

  // Determine which data to display
  const displayPurchaseData = useMemo(() => {
    if (showMonthly && selectedMonth && selectedMonth !== '') {
      return specificMonthData;
    } else if (showMonthly) {
      return { monthName: 'All Months', data: monthlyPurchaseData };
    } else {
      return { monthName: 'Yearly Overview', data: monthlyPurchaseData };
    }
  }, [showMonthly, selectedMonth, specificMonthData, monthlyPurchaseData]);

  if (!displayPurchaseData) {
    return (
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="h-80 flex items-center justify-center">
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No data available</p>
        </div>
      </div>
    );
  }

  const totalAmount = displayPurchaseData.data.reduce((sum, item) => sum + item.value, 0);
  const purchaseCount = purchase.filter(p => {
    if (showMonthly && selectedMonth && selectedMonth !== '') {
      try {
        const date = new Date(p.purchaseDate);
        return date.getMonth() === parseInt(selectedMonth);
      } catch (error) {
        return false;
      }
    }
    return true;
  }).length;

  const topVendor = topVendorsData[0]?.fullLabel || 'No data';
  const pendingPurchases = purchaseStatusData.find(item => item.label === 'Pending')?.value || 0;

  return (
    <div className="flex space-y-6 flex-col">
      {/* Main Purchases Chart */}
      <div className={`p-6 rounded-lg shadow-sm flex-1 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Daily Purchases - ${displayPurchaseData.monthName}`
            : 'Monthly Purchases Overview'
          }
        </h3>
        <BarChart 
          data={displayPurchaseData.data} 
          dark={dark} 
          width={800} 
          height={400}
          showGrid={true}
        />
        
        {/* Summary statistics */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Total Spent: ₹{totalAmount.toLocaleString()} • 
            Purchase Orders: {purchaseCount}
          </p>
          <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Pending: {pendingPurchases} • 
            Average: ₹{purchaseCount > 0 ? Math.round(totalAmount / purchaseCount).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Top Vendors Chart */}
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Top Vendors - ${displayPurchaseData.monthName}`
            : 'Top 5 Vendors'
          }
        </h3>
        <BarChart 
          data={topVendorsData} 
          dark={dark} 
          width={800} 
          height={400}
          showGrid={true}
          horizontal={true}
        />
        
        {/* Vendor summary */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Top Vendor: {topVendor} • 
            Active Vendors: {Object.keys(topVendorsData).length}
          </p>
          <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total from Top 5: ₹{topVendorsData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBarChart;