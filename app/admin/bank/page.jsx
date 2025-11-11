'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import Dropdown from '../../../components/bankExport/BankExport';
import TransactionTypeFilter from './TransactionTypeFilter';
import axios from 'axios'; 
import { Upload, FileText, Funnel, ScrollText } from 'lucide-react';
import { useAllAdminData } from '../../../hooks/useAdminData';

function BankEntriesPage() {
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
  const { dark } = useAllAdminData();
    // Add this function to get export data
    const getExportData = () => {
      return getFilteredEntries().map(entry => ({
        transactionID: entry.transactionID,
        transactionDate: entry.transactionDate,
        amount: entry.amount,
        transactionType: entry.transactionType,
        description: entry.description
      }));
    };
  
    // Get current filters for PDF report
    const getCurrentFilters = () => ({
      dateFilter: dateFilter.option,
      transactionType: selectedType,
      searchTerm: searchTerm
    });

    useEffect(() => {
      const fetchItems = async () => {
        try {
          const response = await axios.get('/api/bank');
          // Sort by createdAt in descending order (newest first) when receiving data
          const sortedData = (response.data.items || []).sort((a, b) => 
            new Date(b.createdAt || b.transactionDate) - new Date(a.createdAt || a.transactionDate)
          );
          setEntries(sortedData);
        } catch (error) {
          console.error('Error fetching items:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchItems();
    }, []);

  const handleDateFilterChange = (option, customDate) => {
    console.log('Date filter changed:', { option, customDate });
    setDateFilter({ option, customDate });
  };

  const filterEntriesByDate = (entries) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return entries.filter(entry => {
        const entryDate = new Date(entry.transactionDate);
        entryDate.setHours(0, 0, 0, 0);

        switch (dateFilter.option) {
            case 'today': {
                const isToday = entryDate.getTime() === today.getTime();
                return isToday;
            }
            case 'yesterday': {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const isYesterday = entryDate.getTime() === yesterday.getTime();
                return isYesterday;
            }
            case 'thisWeek': {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const isThisWeek = entryDate >= weekStart && entryDate <= today;
                return isThisWeek;
            }
            case 'lastWeek': {
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                const isLastWeek = entryDate >= lastWeekStart && entryDate <= lastWeekEnd;
                return isLastWeek;
            }
            case 'thisMonth': {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const isThisMonth = entryDate >= monthStart && entryDate <= today;
                return isThisMonth;
            }
            case 'lastMonth': {
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                const isLastMonth = entryDate >= lastMonthStart && entryDate <= lastMonthEnd;
                return isLastMonth;
            }
            case 'custom': {
                if (dateFilter.customDate) {
                    const customDate = new Date(dateFilter.customDate);
                    customDate.setHours(0, 0, 0, 0);
                    const isCustomDate = entryDate.getTime() === customDate.getTime();
                    return isCustomDate;
                }
                return true;
            }
            default:
                return true;
        }
    });
  };

  const getTotalRowCount = () => entries.length;

  const getFilteredEntries = () => {
    // First apply date filter
    const dateFilteredEntries = filterEntriesByDate(entries);
    
    // Then apply type filter
    const typeFilteredEntries = dateFilteredEntries.filter(entry => {
      return selectedType === 'all' || 
             entry.transactionType?.toLowerCase() === selectedType;
    });
    
    // Then apply search filter if there's a search term
    if (!searchTerm) return typeFilteredEntries;
    
    const searchLower = searchTerm.toLowerCase();
    
    return typeFilteredEntries.filter(entry => {
      const fieldsToSearch = [
        entry.transactionID || '',
        new Date(entry.transactionDate).toLocaleDateString(),
        entry.transactionType || '',
        entry.amount?.toString() || '',
        entry.description || ''
      ];
      
      return fieldsToSearch.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  };

  const toggleEntrySelection = (id) => {
    setSelectedEntries(prev =>
      prev.includes(id)
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const selectAllEntries = () => {
    const filtered = getFilteredEntries();
    if (selectedEntries.length === filtered.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filtered.map(entry => entry._id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-gray-900">
        <span className='text-sm sm:t-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
      </div>
    );
  }
  
  const filteredEntries = getFilteredEntries();
  
  return (
    <div className="p-2 h-[100%] bg-gray-200 dark:bg-gray-900 items-center transition-colors duration-300">
      {/* Header */}
      <div className="py-6">
        <DateDropdown onDateFilterChange={handleDateFilterChange} />
      </div>
      
      <div className="text-black dark:text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 flex rounded-lg items-center gap-2 border border-gray-300 dark:border-gray-600">
            <TransactionTypeFilter 
              selectedType={selectedType} 
              setSelectedType={setSelectedType} 
            />
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total: {filteredEntries.length} <span className="text-gray-700 dark:text-gray-400">/{getTotalRowCount()} ▼</span>
          </div>
        </div>
  
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mr-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, Date, Type, Amount, Description"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className='w-[140px]'>  
            <Link href="/admin/bank/createEntry">
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1 justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> 
                </svg>
                Create Entry
              </button>
            </Link>
          </div>
          <div className="w-[36px] h-[36px] border-1 border-gray-300 dark:border-gray-600 rounded-md flex justify-center items-center bg-white dark:bg-gray-800">
            <Dropdown
              options={[
                { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
              ]}
              exportData={getExportData()}
              exportFileName="bank-entries"
              filters={getCurrentFilters()}
            />
          </div>
        </div>
      </div>
  
      {/* Table */}
      <div className="h-[660px] bg-white dark:bg-gray-800 border-1 border-blue-200 dark:border-blue-800 text-black dark:text-white rounded-lg shadow overflow-scroll hide-scrollbar transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800">
              <tr className='bg-blue-100 dark:bg-blue-900/30'>
                <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Date</th>
                <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Transaction Type</th>
                <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Description</th>
              </tr>
            </thead> 
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map(entry => (
                <tr key={entry._id} className='hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200'>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <span className="text-sm">
                      {entry.transactionID}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(entry.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    ₹ {entry.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {entry.transactionType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {entry.description}
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
 
export default BankEntriesPage;