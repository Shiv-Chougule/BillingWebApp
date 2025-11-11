'use client'
import React, {useState,useEffect} from 'react'
import axios from 'axios';
import Link from 'next/link';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import Dropdown from '../../../components/vendorExport/VendorExport';
import { IndianRupee, ScrollText, CircleUser, FileText, User, Upload, Users, Download, Mail, Funnel, EllipsisVertical, UserRoundPen, Trash2, Building2, Phone } from 'lucide-react';

function page() {
    const [vendors, setVendors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedvendors, setSelectedvendors] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("all"); 
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(11);
    const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
    
     // Add this function to get export data
     const getExportData = () => {
      return getFilteredVendors().map(vendor => ({
        vendorName: vendor.vendorName,
        companyName: vendor.companyName,
        email: vendor.email,
        phone: vendor.phone,
        totalPaid: paymentData[vendor._id]?.totalPaid || 0,
        totalAmount: paymentData[vendor._id]?.totalAmount || 0,
        paymentRatio: paymentData[vendor._id]?.display || 'N/A'
      }));
    };
    
    // Update getCurrentFilters for vendor-specific filters
    const getCurrentFilters = () => ({
      dateFilter: dateFilter.option,
      searchTerm: searchQuery
    });
    

    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/vendor'); 
        if (!res.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const data = await res.json();
        console.log('Fetched data:', data);
        
        // Handle different possible response structures
        const vendorsData = data.vendors || data.vendor || data.vendors || [];
        setVendors(vendorsData);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchVendors();
    }, []);
    
    const handleDateFilterChange = (option, customDate) => {
      setDateFilter({ option, customDate });
    };

    const filterVendorsByDate = (vendors) => {
      if (dateFilter.option === 'all') return vendors;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return vendors.filter(vendor => {
          const vendorDate = new Date(vendor.createdAt || vendor.dateAdded);
          vendorDate.setHours(0, 0, 0, 0);

          switch (dateFilter.option) {
              case 'today':
                  return vendorDate.getTime() === today.getTime();
              case 'yesterday': {
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  return vendorDate.getTime() === yesterday.getTime();
              }
              case 'thisWeek': {
                  const weekStart = new Date(today);
                  weekStart.setDate(today.getDate() - today.getDay());
                  return vendorDate >= weekStart && vendorDate <= today;
              }
              case 'lastWeek': {
                  const lastWeekStart = new Date(today);
                  lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                  const lastWeekEnd = new Date(today);
                  lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                  return vendorDate >= lastWeekStart && vendorDate <= lastWeekEnd;
              }
              case 'thisMonth': {
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                  return vendorDate >= monthStart && vendorDate <= today;
              }
              case 'lastMonth': {
                  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                  return vendorDate >= lastMonthStart && vendorDate <= lastMonthEnd;
              }
              case 'custom': {
                  if (dateFilter.customDate) {
                      const customDate = new Date(dateFilter.customDate);
                      customDate.setHours(0, 0, 0, 0);
                      return vendorDate.getTime() === customDate.getTime();
                  }
                  return true;
              }
              default:
                  return true;
          }
      });
    };
    const getFilteredVendors = () => {
      const dateFilteredVendors = filterVendorsByDate(vendors);
  
      return searchQuery
          ? dateFilteredVendors.filter(vendor => 
              vendor.vendorName.toLowerCase().includes(searchQuery) ||
              (vendor.companyName?.toLowerCase().includes(searchQuery)) ||
              (vendor.email?.toLowerCase().includes(searchQuery)) ||
              (vendor.phone?.includes(searchQuery))
            )
          : dateFilteredVendors;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };
    
    const togglevendorselection = (id) => {
      setSelectedvendors(prev =>
        prev.includes(id) 
          ? prev.filter(vendorId => vendorId !== id)
          : [...prev, id]
      );
    };

    const selectAllvendors = () => {
      if (selectedvendors.length === vendors.length) {
        setSelectedvendors([]);
      } else {
        setSelectedvendors(vendors.map(vendor => vendor._id)); // Changed from vendor.id to vendor._id
      }
    };

    // Get current vendors for the current page
    const getCurrentVendors = () => {
      const filteredVendors = vendors.filter(
        (vendor) => selectedStatus === 'all' || vendor.status === selectedStatus
      );
      
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
    };

    // Calculate total pages
    const totalPages = Math.ceil(
      vendors.filter(
        (vendor) => selectedStatus === 'all' || vendor.status === selectedStatus
      ).length / itemsPerPage
    );

    // Change page
    const paginate = (pageNumber) => {
      if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    };

    const handleDelete = async (vendorId) => {
      if (confirm('Are you sure you want to delete this vendor?')) {
        try {
          const response = await fetch(`/api/vendor?id=${vendorId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            const errorData = await response.json(); // Fails if response is HTML
            throw new Error(errorData.error || 'Failed to delete vendor');
          }
    
          const data = await response.json(); // Parse success response
          console.log('Deleted:', data);
    
          // Update UI by removing the deleted vendor
          setVendors(prevVendors => 
            prevVendors.filter(vendor => vendor._id !== vendorId)
          );
    
        } catch (error) {
          console.error('Delete error:', error);
          alert(error.message || 'Failed to delete vendor');
        }
      }
    };
    useEffect(() => {
      const fetchPaymentData = async () => {
        setLoading(true);
        const data = {};
        for (const vendor of vendors) {
          data[vendor._id] = await calculatePaymentRatio(vendor._id);
        }
        setPaymentData(data);
        setLoading(false);
      };
    
      if (vendors.length > 0) {
        fetchPaymentData();
      }
    }, [vendors]);

    const calculatePaymentRatio = async (vendorId) => {
      try {
        const response = await fetch(`/api/purchase?vendorId=${vendorId}`);
        const data = await response.json();
        
        console.log('Purchase API Response for vendor:', vendorId, data); // Debug log
        
        // Check the actual response structure from your API
        if (!data.purchases || data.purchases.length === 0) {
          return { 
            totalPaid: 0, 
            totalAmount: 0, 
            display: 'N/A' 
          };
        }
    
        // Use the correct data structure from your API
        const purchases = data.purchases;
        const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
        const totalPaid = purchases.reduce((sum, purchase) => sum + (purchase.totalPaid || 0), 0);
        
        return {
          totalPaid,
          totalAmount,
          display: totalAmount === 0 ? '0%' : `${((totalPaid / totalAmount) * 100).toFixed(2)}%`
        };
      } catch (error) {
        console.error('Error calculating payment ratio for vendor:', vendorId, error);
        return { 
          totalPaid: 0, 
          totalAmount: 0, 
          display: 'Error' 
        };
      } 
    };
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-300">
            <span className='text-sm sm:t-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
        </div>
    );
}
  
  return (
    <div className="p-2 h-[100%] bg-gray-200 dark:bg-gray-900 items-center">
      <div className="text-black dark:text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex flex-col lg:flex-row items-center gap-2">
            <DateDropdown onDateFilterChange={handleDateFilterChange} />
            {/* <span className="text-sm sm:text-md font-medium text-gray-700 dark:text-gray-300">
              Total {getFilteredVendors().length} / {vendors.length} ▼
            </span> */}
          </div>
        </div>
  
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mr-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name,company,email,phone"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-blue-600 dark:border-blue-400 rounded-md text-sm sm:text-md w-full text-black dark:text-white"
            />
            <svg
              className="absolute right-3 top-2.5 h-4 w-4 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {/* Pagination controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border transition-colors duration-200 ${
                  currentPage === 1
                    ? "border-blue-400 dark:border-blue-600 text-gray-400 cursor-not-allowed"
                    : "border-blue-400 dark:border-blue-600 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-800 dark:hover:border-blue-300"
                }`}
                aria-label="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md border border-blue-400 dark:border-blue-600">
                <span className="font-medium text-gray-800 dark:text-gray-200">{currentPage}</span> /{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">{totalPages}</span>
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border transition-colors duration-200 ${
                  currentPage === totalPages
                    ? "border-blue-400 dark:border-blue-600 text-gray-400 cursor-not-allowed"
                    : "border-blue-400 dark:border-blue-600 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-800 dark:hover:border-blue-300"
                }`}
                aria-label="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-[160px]">
            <Link href="/admin/vendor/createVendor">
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-1 justify-center transition-colors duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Vendor
              </button>
            </Link>
          </div>
          {/* export pdf dropdown menu */}
          <div className="w-[36px] h-[36px] border-1 border-blue-400 dark:border-blue-600 rounded-md flex justify-center items-center">
            <Dropdown
              options={[
                { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2" /> },
                { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2" /> },
                { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2" /> },
              ]}
              exportData={getExportData()}
              exportFileName="Vendor-entries"
              filters={getCurrentFilters()}
            />
          </div>
        </div>
      </div>
  
      <div className="h-[780px] bg-white dark:bg-gray-800 border-1 border-blue-200 dark:border-gray-700 text-black dark:text-white rounded-lg shadow overflow-scroll hide-scrollbar">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800">
              <tr className="bg-blue-100 dark:bg-gray-700">
                
                <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Company Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Total Pay
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {getFilteredVendors().length > 0 ? (
                getFilteredVendors().map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">
                      <Link href={`/admin/vendor/showVendor?id=${vendor._id}`}>
                        <User size={16} className="inline text-blue-500 dark:text-blue-400" /> {vendor.vendorName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className="mr-1">
                        <Building2 size={16} className="inline text-blue-500 dark:text-blue-400" />
                      </span>{" "}
                      {vendor.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className="mr-1">
                        <Mail size={16} className="inline text-blue-500 dark:text-blue-400" />
                      </span>{" "}
                      {vendor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className="mr-1">
                        <Phone size={16} className="inline text-blue-500 dark:text-blue-400" />
                      </span>{" "}
                      {vendor.phone}
                    </td>
                    <td className="w-[20%] px-2 py-4 text-center">
                      {paymentData[vendor._id]?.totalAmount === 0 ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                      ) : (
                        <span className="text-sm text-black dark:text-white">
                          {paymentData[vendor._id]?.totalAmount || 0}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {/* Edit Link (Pencil Icon) */}
                        <Link
                          href={`/admin/vendor/createVendor?vendorId=${vendor._id}`}
                          className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                          title="Edit Vendor"
                        >
                          <UserRoundPen size={18} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" />
                        </Link>
  
                        {/* Delete Button (Trash Icon) */}
                        <button
                          onClick={() => handleDelete(vendor._id)}
                          className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                          title="Delete Vendor"
                        >
                          <Trash2 size={18} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default page