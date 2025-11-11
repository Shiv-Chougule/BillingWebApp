'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DateDropdown from '../../../../../components/dateDropdown/DateDropdown';
import FilterDropdown from '../../../../../components/FilterDropdown/FilterDropdown';

export default function InvoicesView({ customer }) {
  const [statusFilter, setStatusFilter] = useState('all'); // Changed from typeFilter to statusFilter
  const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/invoices?customerId=${customer._id}`);
        const data = await response.json();
        setInvoices(data?.invoices || []);
      } catch (error) {
        console.error('Fetch error:', error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, [customer._id]);

  const filterInvoicesByDate = (invoices) => {
    if (dateFilter.option === 'all') {
      return invoices;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate);
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

  const getFilteredInvoices = () => {
    // First apply date filter
    const dateFilteredInvoices = filterInvoicesByDate(invoices);

    // Then apply status filter
    const now = new Date();
    return dateFilteredInvoices.filter(invoice => {
      const isPaid = invoice.total === invoice.totalPaid;
      const isOverdue = new Date(invoice.dueDate) < now && invoice.total > invoice.totalPaid;
      const isPending = !isPaid && !isOverdue;

      switch (statusFilter) {
        case 'paid':
          return isPaid;
        case 'pending':
          return isPending;
        case 'overdue':
          return isOverdue;
        case 'cancelled':
          return false; // You might need to add a cancelled status to your invoices
        default:
          return true;
      }
    });
  };

  const handleDateFilterChange = (option, customDate) => {
    setDateFilter({ option, customDate });
  };

  // Calculate total summary values
  const totalInvoices = invoices.length;
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.totalPaid, 0);
  const totalOutstanding = invoices.reduce((sum, invoice) => {
    return sum + (invoice.total - invoice.totalPaid);
  }, 0);

  // Get the filtered invoices
  const filteredInvoices = getFilteredInvoices();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-800 dark:text-gray-200">
          Invoices for {customer.customerName || `${customer.firstName} ${customer.lastName}`}
        </h2>
        {/* <Link href={`/admin/invoices/create?customerId=${customer._id}`}>
          <button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            + New Invoice
          </button>
        </Link> */}
      </div>
    
      {/* Customer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Total Invoices</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalInvoices}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Total Paid</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalPaid.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Outstanding</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalOutstanding.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <FilterDropdown 
          selectedStatus={statusFilter}
          setSelectedStatus={setStatusFilter}
        />
        <DateDropdown onDateFilterChange={handleDateFilterChange} />
      </div>
    
      {/* Invoices Table */}
      <div className="relative h-[500px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hide-scrollbar">
        <div className="overflow-auto hide-scrollbar h-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-50 dark:bg-blue-900/20 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const isPaid = invoice.total === invoice.totalPaid;
                  const isOverdue = new Date(invoice.dueDate) < new Date() && !isPaid;
                  const status = isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending';
    
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        <Link href={`/admin/invoices/${invoice._id}`}>
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{invoice.totalPaid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{(invoice.total - invoice.totalPaid).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status === 'paid' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : status === 'overdue'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {status === 'paid' 
                            ? 'Paid' 
                            : status === 'overdue'
                              ? 'Overdue' 
                              : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {invoices.length === 0 
                          ? 'No invoices found for this customer.' 
                          : 'No invoices match your filters.'}
                      </p>
                      <Link 
                        href={`/admin/sales/createInvoice?customerId=${customer._id}`}
                        className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        + Create New Invoice
                      </Link>
                      <Link 
                        href={`/admin/performaInvoice/createInvoice?customerId=${customer._id}`}
                        className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        + Create Performa Invoice
                      </Link>
                    </div>
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