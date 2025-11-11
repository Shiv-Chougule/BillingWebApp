'use client';
import React, { useState, useEffect } from 'react';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import axios from 'axios';
import Link from 'next/link';
import StockFilterDropdown from './StockFilterDropdown';
import Dropdown from '../../../components/stockExport/StockExport';
import { UserRoundPen, Trash2, Upload, Funnel, FileText } from 'lucide-react'; 
import { useRouter } from 'next/navigation';

function Page() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
  const [searchQuery, setSearchQuery] = useState(''); 
  const router = useRouter();

   // Add this function to get export data
   const getExportData = () => {
    return getFilteredItems().map(item => ({
      itemName: item.name,
      itemCode: item.itemCode,
      HSNCode: item.HSNCode,
      quantity: item.quantity,
      units: item.type,
      sellingPrice: item.sellingPrice,
      purchasePrice: item.purchasePrice === 0 || item.purchasePrice === null || item.purchasePrice === undefined 
        ? 'not mentioned' 
        : item.purchasePrice,
      category: item.category
    }));
  };

  // Updated filters for PDF report
  const getCurrentFilters = () => ({
    dateFilter: dateFilter.option,
    stockFilter: selectedFilter,
    searchTerm: searchQuery
  });


  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/stocks');
        setItems(response.data.items || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleEdit = (itemId) => {
    router.push(`/admin/stocks/createStock?id=${itemId}`);
  };

  const handleDateFilterChange = (option, customDate) => {
    setDateFilter({ option, customDate });
  };

  const filterItemsByDate = (items) => {
    if (dateFilter.option === 'all') return items;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.filter(item => {
      const itemDate = new Date(item.createdAt || item.dateAdded);
      itemDate.setHours(0, 0, 0, 0);

      switch (dateFilter.option) {
        case 'today':
          return itemDate.getTime() === today.getTime();
        case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return itemDate.getTime() === yesterday.getTime();
        }
        case 'thisWeek': {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return itemDate >= weekStart && itemDate <= today;
        }
        case 'lastWeek': {
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
          const lastWeekEnd = new Date(today);
          lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
          return itemDate >= lastWeekStart && itemDate <= lastWeekEnd;
        }
        case 'thisMonth': {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return itemDate >= monthStart && itemDate <= today;
        }
        case 'lastMonth': {
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
        }
        case 'custom': {
          if (dateFilter.customDate) {
            const customDate = new Date(dateFilter.customDate);
            customDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === customDate.getTime();
          }
          return true;
        }
        default:
          return true;
      }
    });
  };

  const getFilteredItems = () => {
    const dateFilteredItems = filterItemsByDate(items);
    
    const filteredItems = dateFilteredItems.filter(item => {
      switch(selectedFilter) {
        case 'services':
          return item.category === 'services';
        case 'products':
          return item.category === 'product';
        case 'in_stock':
          return item.quantity > 0;
        case 'out_of_stock':
          return item.quantity <= 0;
        default:
          return true; // 'all' filter
      }
    });

    // Apply search filter if search query exists
    if (!searchQuery) return filteredItems;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return filteredItems.filter(item => 
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      (item.HSNCode && item.HSNCode.toLowerCase().includes(lowerCaseQuery)) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(lowerCaseQuery))
    );
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const getCountByStatus = (status) => getFilteredItems().filter(item => item.status === status).length;
  const getTotalRowCount = () => items.length;
  const getFilteredRowCount = () => getFilteredItems().length;

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleDelete = async (stockId) => {
    if (confirm('Are you sure you want to delete this Item?')) {
        try {
            const response = await fetch(`/api/stocks?id=${stockId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                setItems(prevItems => prevItems.filter(item => item._id !== stockId));
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete customer'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete customer');
        }
    }
};

if (loading) {
  return (
    <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
      <span className='text-sm sm:text-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
    </div>
  );
}

return (
  <div className="p-2 h-[200%] sm:h-[150%] lg:h-[100%] bg-gray-200 dark:bg-gray-900">
    <div className="py-2">
      <DateDropdown onDateFilterChange={handleDateFilterChange} />
    </div>

    
    {/* Summary Cards */}
    <div className="text-black dark:text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
        <h3 className="text-md font-medium text-blue-600 dark:text-blue-400">Total Items</h3>
        <p className="text-2xl font-bold dark:text-white">{getTotalRowCount()}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
        <h3 className="text-md font-medium text-green-600 dark:text-green-400">In Stock</h3>
        <p className="text-2xl font-bold dark:text-white">
          {items.filter(item => item.quantity > 0).length}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
        <h3 className="text-md font-medium text-yellow-500 dark:text-yellow-400">Out-of-Stock</h3>
        <p className="text-2xl font-bold dark:text-white">
          {items.filter(item => item.quantity <= 0).length}
        </p>
      </div>
    </div>

    {/* Controls */}
    <div className="text-black dark:text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="p-2 bg-white dark:bg-gray-800 flex rounded-lg items-center gap-2 border border-gray-200 dark:border-gray-700">
          <div className="w-[100px] flex items-center gap-1 dark:text-white">
            Filter <Funnel size={16} className="inline" />
          </div>
          <StockFilterDropdown 
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Showing: {getFilteredRowCount()} / {getTotalRowCount()}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mr-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, code or HSN"
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-4 pr-10 py-2 bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-500 rounded-md text-sm sm:text-md w-full text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Create Item */}
        <div className="w-[130px]">
          <Link href="/admin/stocks/createStock">
            <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1 justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Item
            </button>
          </Link>
        </div>

        {/* Export */}
        <div className="w-[36px] h-[36px] border border-gray-300 dark:border-gray-600 rounded-md flex justify-center items-center bg-white dark:bg-gray-800">
          <Dropdown
            options={[
              { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2" /> },
              { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2" /> },
              { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2" /> },
            ]}
            exportData={getExportData()}
            exportFileName="Stock-entries"
            filters={getCurrentFilters()}
          />
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="h-[580px] bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 text-black dark:text-white rounded-lg shadow-md overflow-auto hide-scrollbar">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-md">
        <thead className="sticky bg-blue-100 dark:bg-gray-700 top-0 rounded-md">
          <tr>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Item Name</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Item Code</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">HSN Code</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Quantity</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Units</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Selling Price</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Purchase Price</th>
            <th className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {getFilteredItems().length > 0 ? (
            getFilteredItems().map(item => (
              <tr key={item._id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-blue-500 dark:text-blue-400">
                  <Link href={`/admin/stocks/showStock?id=${item._id}`}>{item.name}</Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.itemCode}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.HSNCode}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.type}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.sellingPrice}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {item.purchasePrice === 0 || item.purchasePrice === null || item.purchasePrice === undefined 
                    ? <span className='text-sm text-gray-500 dark:text-gray-400'>not mentioned</span>
                    : item.purchasePrice
                  }
                </td>
                <td className='w-[10%] px-2 py-4 text-center'>
                  <button 
                      onClick={() => handleEdit(item._id)}
                      className='p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600'
                  >
                      <UserRoundPen size={16} className='text-blue-500 dark:text-blue-400' />
                  </button>
                  <button 
                      onClick={() => handleDelete(item._id)}
                      className='ml-2 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600'
                  >
                      <Trash2 size={16} className='text-red-500 dark:text-red-400' />
                  </button>
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No items found matching your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default Page;