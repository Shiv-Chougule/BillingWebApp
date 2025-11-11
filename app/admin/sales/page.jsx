'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FilterDropdown from '../../../components/FilterDropdown/FilterDropdown';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import SortDropdown from '../../../components/sortDropdown/SortDropdown';
import Dropdown from '../../../components/salesExport/SalesExport';
import { ScrollText, FileText, User, Mail, Upload, Funnel} from 'lucide-react';
//import { useAllAdminData } from '../../../hooks/useAdminData'; // Import the hook

function page() {
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('latest'); 
    const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
    //const { dark } = useAllAdminData();

    const getExportData = () => {
      return getFilteredInvoices().map(invoice => ({
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customer?.customerName,
          email: invoice.customer?.email || 'N/A',
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          totalAmount: invoice.total,
          paymentStatus: invoice.paymentStatus
      }));
  };
  
    // Get current filters for PDF report
    const getCurrentFilters = () => ({
      dateFilter: dateFilter.option,
      status: selectedStatus,
      searchTerm: searchQuery
    });

    const statusColors = { 
      paid: "text-green-500",
      pending: "text-yellow-600",
      overdue: "text-red-500",
      cancelled: "text-gray-500"
    };

    useEffect(() => {
      const fetchInvoices = async () => { 
        try {
          const response = await fetch('/api/invoices');
          const data = await response.json();
    
          console.log("Fetched invoices and customers:", data);
    
          setInvoices(data?.invoices || []);
          setCustomers(data?.customers || []);
        } catch (error) {
          console.error('Fetch error:', error);
          setInvoices([]);
          setCustomers([]);
        } finally {
          setLoading(false);
        }
      };
    
      fetchInvoices();
    }, []);
    
    const getFilteredCounts = () => {
      const filteredInvoices = filterInvoicesByDate(invoices);
      return {
          total: filteredInvoices.length,
          paid: filteredInvoices.filter(invoice => invoice.paymentStatus === "paid").length,
          pending: filteredInvoices.filter(invoice => invoice.paymentStatus === "pending").length,
          cancelled: filteredInvoices.filter(invoice => invoice.paymentStatus === "cancelled").length,
          overdue: filteredInvoices.filter(invoice => invoice.paymentStatus === "overdue").length
      };  
    };
    const handleDateFilterChange = (option, customDate) => {
      console.log('Date filter changed:', { option, customDate });
      setDateFilter({ option, customDate });
    };
 
  const filterInvoicesByDate = (invoices) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Current date filter:', dateFilter);
    console.log('Today:', today);

    return invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        invoiceDate.setHours(0, 0, 0, 0);

        console.log('Processing invoice:', {
            id: invoice.id,
            date: invoice.invoiceDate,
            invoiceDate: invoiceDate
        });

        switch (dateFilter.option) {
            case 'today': {
                const isToday = invoiceDate.getTime() === today.getTime();
                console.log('Today check:', isToday);
                return isToday;
            }
            case 'yesterday': {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const isYesterday = invoiceDate.getTime() === yesterday.getTime();
                console.log('Yesterday check:', isYesterday);
                return isYesterday;
            }
            case 'thisWeek': {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const isThisWeek = invoiceDate >= weekStart && invoiceDate <= today;
                console.log('This week check:', isThisWeek);
                return isThisWeek;
            }
            case 'lastWeek': {
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                const isLastWeek = invoiceDate >= lastWeekStart && invoiceDate <= lastWeekEnd;
                console.log('Last week check:', isLastWeek);
                return isLastWeek;
            }
            case 'thisMonth': {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const isThisMonth = invoiceDate >= monthStart && invoiceDate <= today;
                console.log('This month check:', isThisMonth);
                return isThisMonth;
            }
            case 'lastMonth': {
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                const isLastMonth = invoiceDate >= lastMonthStart && invoiceDate <= lastMonthEnd;
                console.log('Last month check:', isLastMonth);
                return isLastMonth;
            }
            case 'custom': {
                if (dateFilter.customDate) {
                    const customDate = new Date(dateFilter.customDate);
                    customDate.setHours(0, 0, 0, 0);
                    const isCustomDate = invoiceDate.getTime() === customDate.getTime();
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
    const sortInvoices = (invoices) => {
      return [...invoices].sort((a, b) => {
        // Use createdAt if available, otherwise fall back to invoiceDate
        const dateA = new Date(a.createdAt || a.invoiceDate);
        const dateB = new Date(b.createdAt || b.invoiceDate);
        
        // Convert totals to numbers before comparison
        const amountA = Number(a.total) || 0;
        const amountB = Number(b.total) || 0;
        
        switch(sortOrder) {
          case 'latest':
            return dateB - dateA; // Newest first (by createdAt)
          case 'oldest':
            return dateA - dateB; // Oldest first (by createdAt)
          case 'amount-high':
            return amountB - amountA; // Highest amount first
          case 'amount-low':
            return amountA - amountB; // Lowest amount first
          default:
            return dateB - dateA; // Default to latest (by createdAt)
        }
      });
    };
    const getFilteredInvoices = () => {
      // First apply date filter
      const dateFilteredInvoices = filterInvoicesByDate(invoices);
      console.log('Date filtered invoices:', dateFilteredInvoices);

      // Then apply status filter
      const statusFilteredInvoices = dateFilteredInvoices.filter(
          (invoice) => selectedStatus === "all" || invoice.paymentStatus === selectedStatus
      );
      console.log('Status filtered invoices:', statusFilteredInvoices);

      // Then apply search filter if there's a search query
      const searchFilteredInvoices = searchQuery
        ? statusFilteredInvoices.filter(invoice => {
            // Convert search query to lowercase for case-insensitive search
            const query = searchQuery.toLowerCase();
            
            // Check each field for a match
            return (
              // Search in invoiceNumber
              (invoice.invoiceNumber?.toLowerCase().includes(query)) ||
              // Search in customer name (both direct and nested)
              (invoice.customerName?.toLowerCase().includes(query)) ||
              (invoice.customer?.customerName?.toLowerCase().includes(query)) ||
              // Search in email (both direct and nested)
              (invoice.email?.toLowerCase().includes(query)) ||
              (invoice.customer?.email?.toLowerCase().includes(query)) ||
              // Search in formatted date strings
              (new Date(invoice.invoiceDate).toLocaleDateString().includes(query)) ||
              (new Date(invoice.dueDate).toLocaleDateString().includes(query))
            );
          })
        : statusFilteredInvoices;
      console.log('Search filtered invoices:', searchFilteredInvoices);

      // Finally sort the results
      return sortInvoices(searchFilteredInvoices);
    };
    const handleSortChange = (order) => {
      setSortOrder(order);
    };

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value.toLowerCase());
    };
    
    const toggleInvoiceSelection = (id) => {
      setSelectedInvoices(prev =>
          prev.includes(id)
              ? prev.filter(invoiceId => invoiceId !== id)
              : [...prev, id]
      );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-gray-900">
        <span className='text-sm sm:t-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="p-2 min-h-[100%] h-auto dark:bg-gray-900 items-center transition-colors duration-300">
 
        <div className="py-6">
          <DateDropdown onDateFilterChange={handleDateFilterChange} />
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 text-black dark:text-white">
          <div className="p-4 rounded-lg shadow-md border-l-4 border-blue-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none bg-white dark:bg-gray-800">
            <h3 className="text-md font-medium text-blue-600 dark:text-blue-400">Total Invoices</h3>
            <p className="text-2xl font-bold text-black dark:text-white">{getFilteredCounts().total}</p>
          </div>
          <div className="p-4 rounded-lg shadow-md border-l-4 border-green-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none bg-white dark:bg-gray-800">
            <h3 className="text-md font-medium text-green-600 dark:text-green-400">Paid</h3>
            <p className="text-2xl font-bold text-black dark:text-white">{getFilteredCounts().paid}</p>
          </div>
          <div className="p-4 rounded-lg shadow-md border-l-4 border-yellow-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none bg-white dark:bg-gray-800">
            <h3 className="text-md font-medium text-yellow-500 dark:text-yellow-400">Pending</h3>
            <p className="text-2xl font-bold text-black dark:text-white">{getFilteredCounts().pending}</p>
          </div>
          <div className="p-4 rounded-lg shadow-md border-l-4 border-red-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none bg-white dark:bg-gray-800">
            <h3 className="text-md font-medium text-red-500 dark:text-red-400">Cancelled</h3>
            <p className="text-2xl font-bold text-black dark:text-white">{getFilteredCounts().cancelled}</p>
          </div>
          <div className="p-4 rounded-lg shadow-md border-l-4 border-violet-500 transition-transform duration-200 ease-in-out hover:scale-95 hover:shadow-none bg-white dark:bg-gray-800">
            <h3 className="text-md font-medium text-violet-600 dark:text-violet-400">Overdue</h3>
            <p className="text-2xl font-bold text-black dark:text-white">{getFilteredCounts().overdue}</p>
          </div>
        </div>
  
        <div className="flex flex-col md:flex-col xl:flex-row justify-between items-start md:items-center mb-6 gap-4 text-black dark:text-white">
          <div className="flex flex-col sm:flex-row lg:ml-4 text-sm sm:flex-col sm:items-center gap-2">
            <SortDropdown onSortChange={handleSortChange} />
            <div className="flex rounded-lg items-center gap-2">
              <FilterDropdown selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
              <div className="text-sm sm:text-md font-medium text-gray-700 dark:text-gray-300">
                Total: {getFilteredInvoices().length} <span className="text-gray-700 dark:text-gray-400">/{getFilteredCounts().total} ▼</span>
              </div>
            </div>
          </div>
  
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mr-4">
            {/* search option */}
            <div className="relative lg:w-84">
              <input
                type="text"
                placeholder="Search by name, InvoiceId, date, email"
                value={searchQuery}
                autoComplete="off"
                onChange={handleSearchChange}
                className="pl-4 pr-10 py-2 lg:w-84 border border-blue-600 dark:border-blue-400 rounded-md text-sm sm:text-md w-full transition-colors duration-300 bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
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
            {/* create invoice button */}
            <Link href="/admin/sales/createInvoice">
              <button className="px-4 py-2 rounded-md text-sm sm:text-md font-medium flex items-center gap-1 justify-center transition-colors duration-300 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Invoice
              </button>
            </Link>
            {/* Export */}
            <div className="w-[36px] h-[36px] border-1 rounded-md flex justify-center items-center transition-colors duration-300 border-gray-300 dark:border-gray-600">
              <Dropdown
                options={[
                  { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2" /> },
                  { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2" /> },
                  { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2" /> },
                ]}
                exportData={getExportData()}
                exportFileName="Sales-entries"
                filters={getCurrentFilters()}
              />
            </div>
          </div>
        </div>
  
        <div className="h-[580px] border-1 rounded-lg shadow-md overflow-scroll hide-scrollbar transition-colors duration-300 bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 text-black dark:text-white">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="sticky top-0">
              <tr className="bg-blue-100 dark:bg-gray-700">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Invoice No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Customer Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Email Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Due Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Total Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {getFilteredInvoices().map((invoice) => {
                const matchingCustomer = customers.find(
                  (customer) => customer.customerName === invoice.customerName
                );
  
                return (
                  <tr key={invoice._id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-blue-500">
                      <Link
                        href={{
                          pathname: "/admin/sales/showInvoice",
                          query: { id: invoice._id },
                        }}
                      >
                        <span className="mr-1">
                          <ScrollText size={16} className="inline text-blue-500 dark:text-blue-400" />
                        </span>
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                      <span className="mr-1">
                        <User size={16} className="inline text-blue-500 dark:text-blue-400" />
                      </span>
                      {invoice.customer?.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                      <span className="mr-1">
                        <Mail size={16} className="inline text-blue-500 dark:text-blue-400" />
                      </span>
                      {invoice.customer?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                      {invoice.total}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-md ${
                        statusColors[invoice.paymentStatus?.toLowerCase()] || "text-black dark:text-gray-100"
                      }`}
                    >
                      {invoice.paymentStatus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      
    </div>
  );
}

export default page;
