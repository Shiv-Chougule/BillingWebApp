'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FilterDropdown from '../../../components/FilterDropdown/FilterDropdown';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import Dropdown from '../../../components/purchaseExport/PurchaseExport';
import { Funnel, Search, Upload, ScrollText, FileText, User, Mail } from 'lucide-react';

const PurchasePage = () => {
  const [selectedpurchases, setSelectedPurchases] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const getExportData = () => {
    return getFilteredPurchases().map(purchase => ({
        purchaseDate: purchase.purchaseDate,
        purchaseOrder: purchase.purchaseOrder,
        vendorName: purchase.vendor?.vendorName,
        vendorEmail: purchase.vendor?.email,
        dueDate: purchase.dueDate,
        totalAmount: purchase.total
    }));
};

  // Get current filters for PDF report - UPDATED: category instead of transactionType
  const getCurrentFilters = () => ({
    dateFilter: dateFilter.option,
    category: selectedStatus,
    searchTerm: searchQuery
  });


  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/purchase'); // fetch from updated API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let purchasesData = [];

        // Handle according to API response
        if (data.success && Array.isArray(data.purchases)) {
          purchasesData = data.purchases; // new GET response format
        } else if (Array.isArray(data)) {
          purchasesData = data; // when filtering by item
        }

        console.log("Fetched purchases:", purchasesData);
        setPurchases(purchasesData);

      } catch (error) {
        console.error('Fetch error:', error);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const handleDateFilterChange = (option, customDate = '') => {
    console.log('Date filter changed:', { option, customDate });
    setDateFilter({ option, customDate });
  };

  const filterPurchasesByDate = (purchases) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Current date filter:', dateFilter);
    console.log('Today:', today);

    return purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        purchaseDate.setHours(0, 0, 0, 0);

        console.log('Processing purchase:', {
            id: purchase.id,
            date: purchase.purchaseDate,
            purchaseDate: purchaseDate
        });

        switch (dateFilter.option) {
            case 'today': {
                const isToday = purchaseDate.getTime() === today.getTime();
                console.log('Today check:', isToday);
                return isToday;
            }
            case 'yesterday': {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const isYesterday = purchaseDate.getTime() === yesterday.getTime();
                console.log('Yesterday check:', isYesterday);
                return isYesterday;
            }
            case 'thisWeek': {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const isThisWeek = purchaseDate >= weekStart && purchaseDate <= today;
                console.log('This week check:', isThisWeek);
                return isThisWeek;
            }
            case 'lastWeek': {
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                const isLastWeek = purchaseDate >= lastWeekStart && purchaseDate <= lastWeekEnd;
                console.log('Last week check:', isLastWeek);
                return isLastWeek;
            }
            case 'thisMonth': {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const isThisMonth = purchaseDate >= monthStart && purchaseDate <= today;
                console.log('This month check:', isThisMonth);
                return isThisMonth;
            }
            case 'lastMonth': {
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                const isLastMonth = purchaseDate >= lastMonthStart && purchaseDate <= lastMonthEnd;
                console.log('Last month check:', isLastMonth);
                return isLastMonth;
            }
            case 'custom': {
                if (dateFilter.customDate) {
                    const customDate = new Date(dateFilter.customDate);
                    customDate.setHours(0, 0, 0, 0);
                    const isCustomDate = purchaseDate.getTime() === customDate.getTime();
                    console.log('Custom date check:', isCustomDate);
                    return isCustomDate;
                }
                return true;
            }
            default:
                return true;
        }
    });
  };
  
  const getFilteredPurchases = () => {
    // First apply date filter
    const dateFilteredPurchases = filterPurchasesByDate(purchases);
    
    // Then apply status filter
    const statusFilteredPurchases = selectedStatus === "all" 
      ? dateFilteredPurchases 
      : dateFilteredPurchases.filter(purchase => purchase.paymentStatus === selectedStatus);
  
    // Then apply search filter if there's a search query
    return searchQuery
      ? statusFilteredPurchases.filter(purchase => {
          const query = searchQuery.toLowerCase();
          return (
            (purchase.purchaseOrder?.toLowerCase().includes(query)) ||
            (purchase.vendor?.vendorName?.toLowerCase().includes(query)) ||
            (purchase.vendor?.email?.toLowerCase().includes(query)) ||
            (formatDate(purchase.purchaseDate).toLowerCase().includes(query)) ||
            (formatDate(purchase.dueDate).toLowerCase().includes(query)) ||
            (purchase.total?.toString().includes(query))
          );
        })
      : statusFilteredPurchases;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

 // Replace countByStatus with this:
const countByStatus = (status) => {
  const filteredPurchases = filterPurchasesByDate(purchases);
  return Array.isArray(filteredPurchases) 
    ? filteredPurchases.filter((inv) => inv.paymentStatus === status).length 
    : 0;
};

// Replace getTotalRowCount with this:
const getTotalRowCount = () => {
  const filteredPurchases = filterPurchasesByDate(purchases);
  return Array.isArray(filteredPurchases) ? filteredPurchases.length : 0;
};

// Replace getFilteredRowCount with this:
const getFilteredRowCount = () => {
  const filteredPurchases = filterPurchasesByDate(purchases);
  if (!Array.isArray(filteredPurchases)) return 0;
  return filteredPurchases.filter(inv => selectedStatus === "all" || inv.paymentStatus === selectedStatus).length;
};

  const togglepurchaseselection = (id) => {
    setSelectedPurchases(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    
    // Handle MongoDB extended JSON format
    if (date?.$date) {
      return new Date(date.$date).toLocaleDateString();
    }
    
    // Handle regular date strings
    const parsed = new Date(date);
    return isNaN(parsed) ? "N/A" : parsed.toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <span className="text-sm sm:text-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="pb-6 h-[200%] sm:h-[150%] lg:h-[100%] bg-gray-200 dark:bg-gray-900">
      <div className="px-2 py-6">
        {/* Filter + Actions */}
        <div className="flex flex-col mb-6 md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <DateDropdown onDateFilterChange={handleDateFilterChange} />
          </div>
  
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative lg:w-84">
              <input
                type="text"
                placeholder="Search by name, purchaseId, date, email"
                value={searchQuery}
                autoComplete='off'
                onChange={handleSearchChange}
                className="pl-4 pr-10 py-2 lg:w-84 bg-gray-50 dark:bg-gray-700 border border-blue-600 dark:border-blue-500 rounded-md text-sm sm:text-md w-full text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
  
            <Link href="/admin/purchase/createPurchase">
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Purchase
              </button>
            </Link>
  
            <div className="w-[36px] h-[36px] border border-gray-300 dark:border-gray-600 rounded-md flex justify-center items-center bg-white dark:bg-gray-800">
              <Dropdown
                options={[
                  { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2" /> },
                  { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2" /> },
                  { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2" /> },
                ]}
                exportData={getExportData()}
                exportFileName="Purchase-entries"
                filters={getCurrentFilters()} 
                // categories={categories}
              />
            </div>
          </div>
        </div>
  
        {/* Table */}
        <div className="h-[680px] bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow overflow-auto hide-scrollbar border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-100 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <TableHeader />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {getFilteredPurchases().length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No purchases found matching your criteria
                  </td>
                </tr>
              ) : (
                getFilteredPurchases().map((purchase) => (
                  <tr key={purchase._id || purchase.id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(purchase.purchaseDate)}</td>
                    <td className="px-6 py-4 text-sm text-blue-500 dark:text-blue-400">
                      <Link 
                        href={{
                          pathname: '/admin/purchase/showPurchase',
                          query: { id: purchase._id }
                        }}>
                        <span className="mr-1"><ScrollText size={16} className='inline text-blue-500 dark:text-blue-400'/></span>
                        {purchase.purchaseOrder}
                      </Link>  
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <User size={16} className="inline text-blue-500 dark:text-blue-400 mr-1" />{purchase.vendor?.vendorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <Mail size={16} className="inline text-blue-500 dark:text-blue-400 mr-1" />{purchase.vendor?.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(purchase.dueDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{purchase.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const TableHeader = () => (
  <>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-blue-100 dark:bg-gray-700">Purchase Date</th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-blue-100 dark:bg-gray-700">Purchase Order No</th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-blue-100 dark:bg-gray-700">Supplier Name</th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-blue-100 dark:bg-gray-700">Supplier Email</th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-blue-100 dark:bg-gray-700">Due Date</th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase sticky top-0 bg-blue-100 dark:bg-gray-700">Total Amount</th>
  </>
);

export default PurchasePage;
 