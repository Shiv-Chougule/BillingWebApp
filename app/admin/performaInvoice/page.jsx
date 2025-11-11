'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../Sidebar/page';
import FilterDropdown from '../../../components/FilterForPerforma/FilterForPerforma';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import SortDropdown from '../../../components/sortDropdown/SortDropdown';
import { ScrollText, User, XCircle, ArrowUpDown, Trash2, Mail, Funnel} from 'lucide-react';

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
    const [showBulkActions, setShowBulkActions] = useState(false);

    const statusColors = {
      'Pending Approval': 'text-amber-700',
      'Cancelled': 'text-gray-500',
      'Converted to Sales': 'text-blue-500'
    };

    useEffect(() => {
      setShowBulkActions(selectedInvoices.length > 0);
    }, [selectedInvoices]);
    
    // Add this function to handle canceling invoices
    const handleCancelInvoices = async (invoices) => {
      try {
        const invoiceIds = invoices.map(invoice => invoice._id);
        await updateInvoiceStatus("Cancelled", invoiceIds);
      } catch (error) {
        console.error('Error cancelling invoices:', error);
      }
    };
    
    
    useEffect(() => {
      const fetchInvoices = async () => {
        try {
          const response = await fetch('/api/performaInvoice');
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
          paid: filteredInvoices.filter(invoice => invoice.performaStatus === "Converted to Sales").length,
          pending: filteredInvoices.filter(invoice => invoice.performaStatus === "Pending Approval").length,
          cancelled: filteredInvoices.filter(invoice => invoice.performaStatus === "Cancelled").length,
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
    const dateA = new Date(a.invoiceDate);
    const dateB = new Date(b.invoiceDate);
    
    // Convert totals to numbers before comparison
    const amountA = Number(a.total) || 0;
    const amountB = Number(b.total) || 0;
    
    switch(sortOrder) {
      case 'latest':
        return dateB - dateA; // Newest first
      case 'oldest':
        return dateA - dateB; // Oldest first
      case 'amount-high':
        return amountB - amountA; // Highest amount first
      case 'amount-low':
        return amountA - amountB; // Lowest amount first
      default:
        return dateB - dateA; // Default to latest
      }
    });
  };
    const getFilteredInvoices = () => {
      // First apply date filter
      const dateFilteredInvoices = filterInvoicesByDate(invoices);
      console.log('Date filtered invoices:', dateFilteredInvoices);

      // Then apply status filter
      const statusFilteredInvoices = dateFilteredInvoices.filter(
          (invoice) => selectedStatus === "all" || invoice.performaStatus === selectedStatus
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
    
    const toggleInvoiceSelection = (invoice) => {
      setSelectedInvoices(prev =>
        prev.some(selected => selected._id === invoice._id)
          ? prev.filter(selected => selected._id !== invoice._id)
          : [...prev, invoice]
      );
    };

    const selectAllInvoices = () => {
      const filteredInvoices = getFilteredInvoices();
      if (selectedInvoices.length === filteredInvoices.length) {
        setSelectedInvoices([]);
      } else {
        setSelectedInvoices(filteredInvoices);
      }
    };
  const updateInvoiceStatus = async (newStatus, invoiceIds) => {
    try {
      const response = await fetch('/api/performaInvoice', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceIds,
          PerformaStatus: newStatus
        }),
      });
  
      if (response.ok) {
        // Update local state
        setInvoices(prevInvoices => 
          prevInvoices.map(invoice => 
            invoiceIds.includes(invoice._id) 
              ? { ...invoice, performaStatus: newStatus }
              : invoice
          )
        );
        setSelectedInvoices([]); // Clear selection
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };
  const handleCancelInvoice = async (invoiceId) => {
    try {
      await updateInvoiceStatus("Cancelled", [invoiceId]);
    } catch (error) { 
      console.error('Error cancelling invoice:', error);
    }
  };
  // Add this validation before attempting conversion
const canConvertToSales = (invoice) => {
  if (invoice.performaStatus === "Converted to Sales") {
    alert('This invoice has already been converted to sales.');
    return false;
  }
  
  if (invoice.performaStatus === "Cancelled") {
    alert('Cancelled invoices cannot be converted to sales.');
    return false;
  }
  return true;
};
// Add this to your frontend component
const checkStockReferences = () => {
  invoices.forEach(invoice => {
    console.log(`Invoice ${invoice.invoiceNumber}:`, {
      hasStock: !!invoice.stock,
      stockId: invoice.stock?._id || invoice.stock,
      customer: invoice.customer?.customerName
    });
  });
};

// Call it in useEffect or when needed
useEffect(() => {
  if (invoices.length > 0) {
    checkStockReferences();
  }
}, [invoices]);
const debugInvoiceStructure = (invoice) => {
  console.log('Invoice structure:', {
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    stock: invoice.stock,
    stockType: typeof invoice.stock,
    stockIsObject: typeof invoice.stock === 'object',
    stockIsString: typeof invoice.stock === 'string',
    stockHasId: invoice.stock?._id ? true : false,
    customer: invoice.customer,
    items: invoice.items
  });
};
// Then modify your button click handler:
const handleConvertClick = async (invoice) => {
  if (!canConvertToSales(invoice)) return;
  
  if (confirm(`Convert invoice ${invoice.invoiceNumber} to sales?`)) {
    await handleConvertToSales(invoice);
  }
};
  const handleConvertToSales = async (invoice) => {
    try {
      debugInvoiceStructure(invoice);
      const stockId = invoice.stock?._id || invoice.stock;
    
      if (!stockId) {
        alert('This invoice is missing stock information and cannot be converted.');
        return;
      }
  
      // Prepare items data with proper validation
      const itemsWithValidation = invoice.items.map(item => ({
        name: item.name || 'Unnamed Item',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        gst: Number(item.gst) || 0,
        discount: Number(item.discount) || 0,
        amount: (Number(item.quantity) || 1) * (Number(item.price) || 0),
        stockId: item.stockId || null // Include stockId if available
      }));
  
      // Calculate proper totals
      const subTotal = itemsWithValidation.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
      
      const gstTotal = itemsWithValidation.reduce((sum, item) => 
        sum + (item.price * item.quantity * item.gst / 100), 0);
      
      const total = subTotal + gstTotal + 
        (Number(invoice.adjustment) || 0) - 
        (Number(invoice.discount) || 0);
  
      // Prepare invoice data matching API expectations
      const invoiceData = {
        customer: invoice.customer?._id || invoice.customer,
        stock: stockId,
        invoiceNumber: invoice.invoiceNumber,
        salesperson: invoice.salesperson || '',
        orderNumber: invoice.orderNumber || '',
        subject: invoice.subject || `Converted from Performa Invoice ${invoice.invoiceNumber}`,
        paymentStatus: "pending",
        terms: invoice.terms || '',
        invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        items: itemsWithValidation,
        subTotal: subTotal,
        adjustment: Number(invoice.adjustment) || 0,
        discount: Number(invoice.discount) || 0,
        total: total,
        totalPaid: 0,
        convertedFromPerforma: invoice._id
      };
  
      console.log('Sending invoice data:', invoiceData);
  
      // Submit to API
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        // Update performa invoice status
        await updateInvoiceStatus("Converted to Sales", [invoice._id]);
        alert('Invoice converted to sales successfully!');
      } else {
        throw new Error(responseData.error || 'Failed to convert invoice');
      }
    } catch (error) {
      console.error('Error converting invoice:', error);
      alert(error.message || 'Failed to convert invoice. Please check console for details.');
    }
  };
  const handleDeleteInvoice = async (invoiceId, invoiceNumber) => {
    if (confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      try {
        const response = await fetch(`/api/performaInvoice?id=${invoiceId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const result = await response.json();
          setInvoices(prevInvoices => 
            prevInvoices.filter(invoice => invoice._id !== invoiceId)
          );
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Failed to delete invoice'}`);
        }
      } catch (error) {
        console.error('Delete invoice error:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <span className='text-sm sm:text-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>
          Loading...
        </span>
      </div>
    );
  }
  
  return (
    <div className="pb-6 h-[200%] sm:h-[150%] lg:h-[100%] bg-gray-200 dark:bg-gray-900 items-center">
      <div className='px-2'>
        <div className="py-6">
          <DateDropdown onDateFilterChange={handleDateFilterChange} />
        </div>
    
        <div className="text-black dark:text-white grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-blue-500
            transition-transform duration-200 ease-in-out 
            hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
            <h3 className="text-md font-medium text-blue-600 dark:text-blue-400">Total Performa Invoices</h3>
            <p className="text-2xl font-bold dark:text-white">{getFilteredCounts().total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-green-500
            transition-transform duration-200 ease-in-out 
            hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
            <h3 className="text-md font-medium text-green-600 dark:text-green-400">Converted To Sales</h3>
            <p className="text-2xl font-bold dark:text-white">{getFilteredCounts().paid}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-yellow-500
            transition-transform duration-200 ease-in-out 
            hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
            <h3 className="text-md font-medium text-yellow-500 dark:text-yellow-400">Pending Approval</h3>
            <p className="text-2xl font-bold dark:text-white">{getFilteredCounts().pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-red-500
            transition-transform duration-200 ease-in-out 
            hover:scale-95 hover:shadow-none dark:hover:bg-gray-700">
            <h3 className="text-md font-medium text-red-500 dark:text-red-400">Cancelled Invoices</h3>
            <p className="text-2xl font-bold dark:text-white">{getFilteredCounts().cancelled}</p>
          </div>
        </div>
        
        <div className="text-black dark:text-white flex flex-col md:flex-col xl:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row lg:ml-4 text-sm sm:text-col items-center gap-2">
            <SortDropdown onSortChange={handleSortChange} />
            <div className="flex flex-col sm:flex-row rounded-lg items-center gap-2">
              <FilterDropdown selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
              <div className="text-sm sm:text-md font-medium text-gray-700 dark:text-gray-300">
                Total: {getFilteredInvoices().length} <span className="text-gray-700 dark:text-gray-400">/{getFilteredCounts().total} ▼</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* search option */}
            <div className="relative lg:w-84">
              <input
                type="text"
                placeholder="Search by name, InvoiceId, date, email"
                value={searchQuery}
                autoComplete='off'
                onChange={handleSearchChange}
                className="pl-4 pr-10 py-2 lg:w-84 bg-gray-50 dark:bg-gray-700 border border-blue-600 dark:border-blue-500 rounded-md text-sm sm:text-md w-full text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
      
            <Link href="/admin/performaInvoice/createInvoice">
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm sm:text-md font-medium flex items-center gap-1 justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Performa Invoice
              </button>
            </Link>
          </div>
        </div>
        
        <div className="h-[480px] bg-white dark:bg-gray-800 text-black dark:text-white border-1 border-blue-200 dark:border-gray-700 rounded-lg shadow-md overflow-scroll hide-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800 sticky top-0">
              <tr className='bg-blue-100 dark:bg-gray-700'>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice No</th>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer Name</th>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Validity Date</th>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-sm sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {getFilteredInvoices().map((invoice) => {
                const matchingCustomer = customers.find(
                  (customer) => customer.customerName === invoice.customerName
                );
  
                return (
                  <tr key={invoice._id} className='hover:bg-gray-200 dark:hover:bg-gray-700'>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-white">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-blue-500 dark:text-blue-400">
                      <Link  
                        href={{
                          pathname: '/admin/performaInvoice/showInvoice',
                          query: { id: invoice._id }
                        }}>
                        <span className="mr-1"><ScrollText size={16} className='inline text-blue-500 dark:text-blue-400'/></span>
                        {invoice.invoiceNumber}
                      </Link>  
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-white">
                      <span className="mr-1"><User size={16} className='inline text-blue-500 dark:text-blue-400'/></span>
                      {invoice.customer?.customerName}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-white">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-white">
                      {invoice.total}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-md ${statusColors[invoice.performaStatus] || 'text-black dark:text-white'}`}>
                      {invoice.performaStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-md text-gray-900 dark:text-white">
                      <div className="flex space-x-2">
                        {/* Cancel Invoice Button */}
                        <button 
                          onClick={() => handleCancelInvoice(invoice._id)}
                          className="p-1 text-purple-600 dark:text-purple-400 hover:text-gray-500 dark:hover:text-gray-300 relative group"
                          aria-label="Cancel Invoice"
                          disabled={invoice.performaStatus === "Cancelled"}
                        >
                          <XCircle size={20} />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-600 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Cancel Invoice
                          </span>
                        </button>
                        {/* Convert to Sales Button */}
                        <button 
                          onClick={() => handleConvertClick(invoice)}
                          className="p-1 text-green-600 dark:text-green-400 hover:text-gray-500 dark:hover:text-gray-300 relative group"
                          aria-label="Convert to Sales"
                          disabled={invoice.performaStatus === "Converted to Sales"}
                        >
                          <ArrowUpDown size={20} />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-600 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Convert to Sales
                          </span>
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice._id, invoice.invoiceNumber)}
                          className="p-1 text-red-500 dark:text-red-400 hover:text-gray-500 dark:hover:text-gray-300 relative group"
                          aria-label="Delete Invoice"
                        >
                          <Trash2 size={20} />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-600 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Delete Invoice
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default page;
