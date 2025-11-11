'use client'
import React, {useState, useEffect} from 'react'
import Link from 'next/link';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import SortDropdown from '../../../components/sortDropdown/SortDropdown';
import Dropdown from '../../../components/paymentExport/PaymentExport';
import { User, ScrollText, FileText, Upload } from 'lucide-react';

function page() {
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState({ payments: true });
    const [errors, setErrors] = useState({ payments: null });
    const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
    const [sortOrder, setSortOrder] = useState('latest');

    const getExportData = () => {
      return getFilteredInvoices().map(invoice => ({
          date: invoice.paymentDate || invoice.date,
          paymentNumber: invoice.paymentNumber || invoice.payment || 'N/A',
          customerName: invoice.customerName || invoice.customer?.name || 'N/A',
          paymentMode: invoice.paymentMode || invoice.mode || 'N/A',
          paidAmount: invoice.markedInvoices ? 
              invoice.markedInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0) : 
              0
      }));
    };
  
    // Get current filters for PDF report
    const getCurrentFilters = () => ({
      dateFilter: dateFilter.option,
      searchTerm: searchQuery
    });

    const fetchPayments = async () => {
      const key = 'payments';
      setLoading(prev => ({ ...prev, [key]: true }));
      
      try {
        const response = await fetch('/api/payments', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched payments:", data);
        
        if (data && (data.error || data.success === false)) {
          throw new Error(data.error || data.message || 'Failed to fetch payments');
        }
        
        let paymentsData = [];
        
        if (Array.isArray(data)) {
          paymentsData = data;
        } else if (data.payments) {
          paymentsData = data.payments;
        } else if (Array.isArray(data.data)) {
          paymentsData = data.data;
        } else if (data.success && Array.isArray(data.data)) {
          paymentsData = data.data;
        } else {
          paymentsData = data;
        }
        
        setInvoices(paymentsData);
        setFilteredInvoices(paymentsData);
        setErrors(prev => ({ ...prev, [key]: null }));
        
      } catch (error) {
        console.error('Error fetching payments:', error);
        setErrors(prev => ({ ...prev, [key]: error.message }));
        setInvoices([]);
        setFilteredInvoices([]);
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    };

    useEffect(() => {
      fetchPayments();
    }, []);

    const handleDateFilterChange = (option, customDate) => {
      setDateFilter({ option, customDate });
    };

    const filterInvoicesByDate = (invoices) => {
      if (dateFilter.option === 'all') {
        return invoices;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.paymentDate || invoice.date);
        invoiceDate.setHours(0, 0, 0, 0);

        switch (dateFilter.option) {
          case 'today':
            return invoiceDate.getTime() === today.getTime();
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return invoiceDate.getTime() === yesterday.getTime();
          }
          case 'thisWeek': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return invoiceDate >= weekStart && invoiceDate <= today;
          }
          case 'lastWeek': {
            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
            const lastWeekEnd = new Date(today);
            lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
            return invoiceDate >= lastWeekStart && invoiceDate <= lastWeekEnd;
          }
          case 'thisMonth': {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return invoiceDate >= monthStart && invoiceDate <= today;
          }
          case 'lastMonth': {
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            return invoiceDate >= lastMonthStart && invoiceDate <= lastMonthEnd;
          }
          case 'custom': {
            if (dateFilter.customDate) {
              const customDate = new Date(dateFilter.customDate);
              customDate.setHours(0, 0, 0, 0);
              return invoiceDate.getTime() === customDate.getTime();
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
        const dateA = new Date( a.createdAt || a.paymentDate);
        const dateB = new Date( b.createdAt || b.paymentDate);
        
        const amountA = Number(a.outstandingAmount) || 0;
        const amountB = Number(b.outstandingAmount) || 0;
        
        switch(sortOrder) {
          case 'latest':
            return dateB - dateA;
          case 'oldest':
            return dateA - dateB;
          case 'amount-high':
            return amountB - amountA;
          case 'amount-low':
            return amountA - amountB;
          default:
            return dateB - dateA;
        }
      });
    };

    const getFilteredInvoices = () => {
      // First apply date filter
      const dateFilteredInvoices = filterInvoicesByDate(invoices);

      // Then apply search filter directly to date filtered invoices
      const searchFilteredInvoices = searchQuery
        ? dateFilteredInvoices.filter(invoice => {
            const searchLower = searchQuery.toLowerCase();
            
            // Check customer name
            const customerNameMatch = (invoice.customerName || invoice.customer?.name || '')
              .toLowerCase().includes(searchLower);
            
            // Check payment number
            const paymentNumberMatch = (invoice.paymentNumber || '')
              .toLowerCase().includes(searchLower);
            
            // Check payment date
            const formattedDate = formatDate(invoice.paymentDate || invoice.date);
            const dateMatch = formattedDate.toLowerCase().includes(searchLower);
            
            return customerNameMatch || paymentNumberMatch || dateMatch;
          })
        : dateFilteredInvoices;

      // Finally sort the results
      return sortInvoices(searchFilteredInvoices);
    };

    const handleSortChange = (order) => {
      setSortOrder(order);
    };

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };

    const toggleInvoiceSelection = (id) => {
      setSelectedInvoices(prev =>
        prev.includes(id) 
          ? prev.filter(invoiceId => invoiceId !== id)
          : [...prev, id]
      );
    };

    const selectAllInvoices = () => {
      const filtered = getFilteredInvoices();
      if (selectedInvoices.length === filtered.length) {
        setSelectedInvoices([]);
      } else {
        setSelectedInvoices(filtered.map(invoice => invoice._id || invoice.id));
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      } catch (e) {
        return 'Invalid date';
      }
    };

    if (loading.payments) {
      return <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-300">
                <span className='text-sm sm:t-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
             </div>;
    }

    return (
      <div className="p-2 h-[100%] bg-gray-200 dark:bg-gray-900 items-center transition-colors duration-300">
        <div className="px-2">  
          <div className="py-2">
              <DateDropdown onDateFilterChange={handleDateFilterChange} />
          </div>
          
          <div className="text-black dark:text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex flex-col sm:flex-row rounded-lg sm:items-center gap-2">
                    <div className='flex gap-1 items-center'>
                    <SortDropdown onSortChange={handleSortChange} />
                    </div>
                  </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search by Customer, Payment#, Date" 
                        className="pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-400 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  </div>
                  <div className='w-auto'>
                      <Link href="/admin/payments/updatePayment">
                          <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-1 justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span>Update Payment</span>
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
                      exportFileName="Payments-entries"
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
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Payment Number
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
                    Payment Mode
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm sm:text-md font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Paid Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredInvoices().length > 0 ? (
                  getFilteredInvoices().map((invoice) => (
                    <tr key={invoice._id || invoice.id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.paymentDate || invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-blue-500 dark:text-blue-400">
                        <Link 
                          href={{
                            pathname: '/admin/payments/showPayment',
                            query: { id: invoice._id }
                          }} 
                          className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          <span className="mr-1">
                            <ScrollText size={16} className="inline text-blue-500 dark:text-blue-400" />
                          </span>
                          {invoice.paymentNumber || invoice.payment || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                        <span className="mr-1">
                          <User size={16} className="inline text-blue-500 dark:text-blue-400" />
                        </span>
                        {invoice.customerName || invoice.customer?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                        {invoice.paymentMode || invoice.mode || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-gray-100">
                        {invoice.markedInvoices ? (
                          `₹${invoice.markedInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)}`
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm sm:text-md text-gray-500 dark:text-gray-400">
                      {searchQuery ? 
                        `No payments found matching "${searchQuery}"` : 
                        errors.payments ? 
                        `Error loading payments: ${errors.payments}` : 
                        'No payments found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
}

export default page