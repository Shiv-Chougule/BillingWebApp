'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Dropdown from '../../../components/expensesExport/ExpensesExport';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import axios from 'axios';
import { Funnel, FileText, Upload, ChevronDown } from 'lucide-react';

function Page() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // Added missing state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
  const dropdownRef = useRef(null);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "office", label: "Office Expenses" },
    { value: "travel", label: "Travel & Transportation" },
    { value: "food", label: "Food & Beverages" },
    { value: "utilities", label: "Utilities" },
    { value: "salary", label: "Salary & Wages" },
    { value: "stocks purchases", label: "stocks purchases" }
  ];

  // Add this function to get export data
  const getExportData = () => {
    //console.log('entries:', getFilteredEntries);
    return getFilteredEntries().map(entry => ({
      date: entry.date,
      category: entry.category,
      paymentMethod: entry.paymentMethod,
      amount: entry.amount,
      description: entry.description
    }));
    //console.log('entries:', getFilteredEntries);
  };

  // Get current filters for PDF report - UPDATED: category instead of transactionType
  const getCurrentFilters = () => ({
    dateFilter: dateFilter.option,
    category: selectedCategory, // Changed from transactionType to category
    searchTerm: searchTerm
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/expenses');
        // Sort by createdAt in descending order (newest first) when receiving data
        const sortedData = (response.data || []).sort((a, b) => 
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        setItems(sortedData);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchItems();
  }, []);
  
  const handleDateFilterChange = (option, customDate = '') => {
    setDateFilter({ option, customDate });
  };

  const filterItemsByDate = (items) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.filter(item => {
      if (!item.date) return false;
      
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      switch (dateFilter.option) {
        case 'today':
          return itemDate.getTime() === today.getTime();
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return itemDate.getTime() === yesterday.getTime();
        case 'thisWeek':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return itemDate >= weekStart && itemDate <= today;
        case 'lastWeek':
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
          const lastWeekEnd = new Date(today); 
          lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
          return itemDate >= lastWeekStart && itemDate <= lastWeekEnd;
        case 'thisMonth':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return itemDate >= monthStart && itemDate <= today;
        case 'lastMonth':
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
        case 'custom':
          if (dateFilter.customDate) {
            const customDate = new Date(dateFilter.customDate);
            customDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === customDate.getTime();
          }
          return true;
        default:
          return true;
      }
    });
  };

  const getTotalRowCount = () => items.length;

  const getFilteredEntries = () => {
    // First apply date filter
    const dateFilteredEntries = filterItemsByDate(items);
    
    // Then apply category filter (not type filter)
    const categoryFilteredEntries = dateFilteredEntries.filter(entry => {
      return selectedCategory === 'all' || 
             entry.category === selectedCategory;
    });
    
    // Then apply search filter if there's a search term
    if (!searchTerm) return categoryFilteredEntries;
    
    const searchLower = searchTerm.toLowerCase();
    
    return categoryFilteredEntries.filter(entry => {
      const fieldsToSearch = [
        entry._id || '', // Using _id instead of transactionID
        new Date(entry.date).toLocaleDateString(), // Using date instead of transactionDate
        entry.category || '', // Using category instead of transactionType
        entry.amount?.toString() || '',
        entry.description || '',
        entry.paymentMethod || '' // Added payment method to search
      ];
      
      return fieldsToSearch.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  };

  const getFilteredRowCount = () => {
    return filterItems().length;
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.itemCode));
    }
  };

  const filterItems = () => {
    // First apply date filter
    const dateFilteredItems = filterItemsByDate(items);
    
    // Then apply other filters
    return dateFilteredItems.filter(item => {
      const statusMatch = selectedStatus === "all" || item.status === selectedStatus;
      const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
      const searchMatch = searchTerm === "" || 
        Object.values(item).some(
          value => value && 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      return statusMatch && categoryMatch && searchMatch;
    });
  };

  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    setShowCategoryDropdown(false);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-300">
        <span className='text-sm sm:t-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full p-2 h-[100%] bg-gray-200 dark:bg-gray-900 items-center transition-colors duration-300">
      {/* Date Dropdown */}
      <div className="py-6">
        <DateDropdown onDateFilterChange={handleDateFilterChange} />
      </div>

      <div className="text-black dark:text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="w-56 mt-2 p-2 bg-white dark:bg-gray-800 flex rounded-lg items-center gap-2 relative border border-gray-300 dark:border-gray-600" ref={dropdownRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-56 flex flex-row justify-between items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className='flex gap-2'>
                <Funnel className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>{categories.find(c => c.value === selectedCategory)?.label || 'Filter'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400`} />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute z-50 top-12 left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-blue-400 dark:border-blue-500">
                {categories.map((category) => (
                  <div
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 ${
                      selectedCategory === category.value 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {category.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Showing: {getFilteredRowCount()} <span className="text-gray-700 dark:text-gray-400">/{getTotalRowCount()}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto lg:mr-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by category, date, amount, etc..."
              className="pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className='w-[160px]'>
            <Link href="/admin/expenses/createExpenses">
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1 justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Expense
              </button>
            </Link>
          </div>
          <div className="w-[36px] h-[36px] rounded-md flex justify-center items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <Dropdown
              options={[
                { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
              ]}
              exportData={getExportData()}
              exportFileName="expenses"
              filters={getCurrentFilters()} 
              categories={categories}
            />
          </div>
        </div>
      </div>

      <div className="h-[660px] bg-white dark:bg-gray-800 border-1 border-blue-200 dark:border-blue-800 text-black dark:text-white rounded-lg shadow overflow-scroll hide-scrollbar transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800">
              <tr className='bg-blue-100 dark:bg-blue-900/30'>
                <th className="w-[18%] px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Date</th>
                <th className="w-[18%] px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Category</th>
                <th className="w-[18%] px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Payment Method</th>               
                <th className="w-[18%] px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                <th className="max-w-[28%] px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filterItems().map(item => (
                <tr key={item._id} className="hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="w-[18%] px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="w-[18%] px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {categories.find(cat => cat.value === item.category)?.label || item.category} 
                  </td>
                  <td className="w-[18%] px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.paymentMethod}
                  </td>        
                  <td className="w-[18%] px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.amount}
                  </td>
                  <td className="max-w-[28%] px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Page;