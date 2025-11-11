'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('./BarChart'), { 
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>
});

const ExpenseBarChart = ({ expenses, dark = false, showMonthly = false, selectedMonth = '' }) => {
  // Monthly expenses - shown when showMonthly is false or no specific month selected
  const monthlyExpenseData = useMemo(() => {
    const monthlyExpenses = Array(12).fill(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    expenses.forEach(expense => {
      if (expense?.date) {
        try {
          const date = new Date(expense.date);
          const month = date.getMonth();
          monthlyExpenses[month] += expense.amount || 0;
        } catch (error) {
          console.error('Error processing expense date:', error);
        }
      }
    });

    return months.map((month, index) => ({
      label: month,
      value: monthlyExpenses[index]
    }));
  }, [expenses]);

  // Specific month expense data - shown when showMonthly is true and selectedMonth has value
  const specificMonthData = useMemo(() => {
    if (!showMonthly || !selectedMonth || selectedMonth === '') return null;

    const monthIndex = parseInt(selectedMonth);
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Filter expenses for the selected month
    const monthExpenses = expenses.filter(expense => {
      if (!expense?.date) return false;
      try {
        const date = new Date(expense.date);
        return date.getMonth() === monthIndex;
      } catch (error) {
        console.error('Error processing expense date:', error);
        return false;
      }
    });

    // Group by day of the month for amounts
    const dailyExpenses = {};
    monthExpenses.forEach(expense => {
      if (expense?.date) {
        try {
          const date = new Date(expense.date);
          const day = date.getDate();
          if (!dailyExpenses[day]) {
            dailyExpenses[day] = 0;
          }
          dailyExpenses[day] += expense.amount || 0;
        } catch (error) {
          console.error('Error processing expense date:', error);
        }
      }
    });

    // Convert to array format for chart
    const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      chartData.push({
        label: `${day}`,
        value: dailyExpenses[day] || 0
      });
    }

    return {
      monthName: monthNames[monthIndex],
      data: chartData,
      expenses: monthExpenses
    };
  }, [expenses, showMonthly, selectedMonth]);

  // Expense category data (always calculated from filtered expenses)
  const expenseCategoryData = useMemo(() => {
    const expensesToUse = showMonthly && selectedMonth && selectedMonth !== '' 
      ? expenses.filter(expense => {
          if (!expense?.date) return false;
          try {
            const date = new Date(expense.date);
            return date.getMonth() === parseInt(selectedMonth);
          } catch (error) {
            return false;
          }
        })
      : expenses;

    const categoryTotals = {};

    expensesToUse.forEach(expense => {
      const category = expense?.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += expense.amount || 0;
    });

    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 categories
      .map(([category, amount]) => ({
        label: category.length > 10 ? category.substring(0, 10) + '...' : category,
        value: amount,
        fullLabel: category
      }));
  }, [expenses, showMonthly, selectedMonth]);

  // Determine which expense data to display
  const displayExpenseData = useMemo(() => {
    if (showMonthly && selectedMonth && selectedMonth !== '') {
      return specificMonthData;
    } else {
      return { 
        monthName: showMonthly ? 'All Months' : 'Yearly Overview', 
        data: monthlyExpenseData 
      };
    }
  }, [showMonthly, selectedMonth, specificMonthData, monthlyExpenseData]);

  if (!displayExpenseData) {
    return (
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="h-80 flex items-center justify-center">
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No data available</p>
        </div>
      </div>
    );
  }

  const totalExpenses = showMonthly && selectedMonth && selectedMonth !== '' 
    ? specificMonthData?.expenses?.length || 0
    : expenses.length;

  const totalAmount = displayExpenseData.data.reduce((sum, item) => sum + item.value, 0);
  const topCategory = expenseCategoryData[0]?.fullLabel || 'No data';

  return (
    <div className="space-y-6 flex flex-col">
      {/* Expense Amounts Chart */}
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Daily Expenses - ${displayExpenseData.monthName}`
            : 'Monthly Expenses'
          }
        </h3>
        <BarChart 
          data={displayExpenseData.data} 
          dark={dark} 
          width={800} 
          height={400} 
          showGrid={true}
        />
        
        {/* Summary statistics */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Total Spent: ₹{totalAmount.toLocaleString()} • 
            Transactions: {totalExpenses}
          </p>
        </div>
      </div>

      {/* Expense Category Chart */}
      <div className={`p-6 rounded-lg shadow-sm ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          {showMonthly && selectedMonth && selectedMonth !== '' 
            ? `Categories - ${displayExpenseData.monthName}`
            : 'Expenses by Category'
          }
        </h3>
        <BarChart 
          data={expenseCategoryData} 
          dark={dark} 
          width={800} 
          height={400} 
          showGrid={true}
        />
        
        {/* Category summary */}
        <div className={`mt-4 p-3 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Top Category: {topCategory} • 
            Categories: {expenseCategoryData.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBarChart;