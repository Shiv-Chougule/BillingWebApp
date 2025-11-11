'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { User, Mail, FileText, Upload, Phone, Building2, UserRoundPen, Trash2 } from 'lucide-react';
import DateDropdown from '../../../components/dateDropdown/DateDropdown';
import Dropdown from '../../../components/customerExport/CustomerExport';
import { useAllAdminData } from '../../../hooks/useAdminData';

function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentData, setPaymentData] = useState({});
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState({ option: 'all', customDate: '' });
     const { dark } = useAllAdminData();

    const getExportData = () => {
        return getFilteredCustomers().map(customer => ({
            customerName: customer.customerName,
            companyName: customer.companyName,
            email: customer.email,
            phone: customer.phone,
            totalPaid: paymentData[customer._id]?.totalPaid || 0,
            totalAmount: paymentData[customer._id]?.totalAmount || 0,
            paymentRatio: paymentData[customer._id]?.display || 'N/A'
        }));
    };
    
    // Update getCurrentFilters for customer-specific filters
    const getCurrentFilters = () => ({
        dateFilter: dateFilter.option,
        searchTerm: searchQuery
    });

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data.customers);
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setLoading(false);
        }
    };
    
    const calculatePaymentRatio = async (customerId) => {
        try {
            const response = await fetch(`/api/invoices?customerId=${customerId}`);
            const data = await response.json();
            
            if (!data.invoices || data.invoices.length === 0) {
                return { 
                    totalPaid: 0, 
                    totalAmount: 0, 
                    display: 'N/A' 
                };
            }
        
            const totalAmount = data.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
            const totalPaid = data.invoices.reduce((sum, invoice) => sum + (invoice.totalPaid || 0), 0);
            
            return {
                totalPaid,
                totalAmount,
                display: totalAmount === 0 ? '0%' : `${((totalPaid / totalAmount) * 100).toFixed(2)}%`
            };
        } catch (error) {
            console.error('Error calculating payment ratio:', error);
            return { 
                totalPaid: 0, 
                totalAmount: 0, 
                display: 'Error' 
            };
        }
    };

    useEffect(() => {
        const fetchPaymentData = async () => {
            const data = {};
            for (const customer of customers) {
                data[customer._id] = await calculatePaymentRatio(customer._id);
            }
            setPaymentData(data);
        };
    
        if (customers.length > 0) {
            fetchPaymentData();
        }
    }, [customers]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDateFilterChange = (option, customDate) => {
        setDateFilter({ option, customDate });
    };

    const filterCustomersByDate = (customers) => {
        if (dateFilter.option === 'all') return customers;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return customers.filter(customer => {
            const customerDate = new Date(customer.createdAt || customer.dateAdded);
            customerDate.setHours(0, 0, 0, 0);

            switch (dateFilter.option) {
                case 'today':
                    return customerDate.getTime() === today.getTime();
                case 'yesterday': {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return customerDate.getTime() === yesterday.getTime();
                }
                case 'thisWeek': {
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    return customerDate >= weekStart && customerDate <= today;
                }
                case 'lastWeek': {
                    const lastWeekStart = new Date(today);
                    lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                    const lastWeekEnd = new Date(today);
                    lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                    return customerDate >= lastWeekStart && customerDate <= lastWeekEnd;
                }
                case 'thisMonth': {
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    return customerDate >= monthStart && customerDate <= today;
                }
                case 'lastMonth': {
                    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    return customerDate >= lastMonthStart && customerDate <= lastMonthEnd;
                }
                case 'custom': {
                    if (dateFilter.customDate) {
                        const customDate = new Date(dateFilter.customDate);
                        customDate.setHours(0, 0, 0, 0);
                        return customerDate.getTime() === customDate.getTime();
                    }
                    return true;
                }
                default:
                    return true;
            }
        });
    };

    const getFilteredCustomers = () => {
      const dateFilteredCustomers = filterCustomersByDate(customers);
  
      return searchQuery
          ? dateFilteredCustomers.filter(customer => 
              customer.customerName.toLowerCase().includes(searchQuery) ||
              (customer.companyName?.toLowerCase().includes(searchQuery)) ||
              (customer.email?.toLowerCase().includes(searchQuery)) ||
              (customer.phone?.includes(searchQuery))
            )
          : dateFilteredCustomers;
  };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    
    const handleEdit = (customerId) => {
        window.location.href = `/admin/customers/createCustomer?id=${customerId}`;
    };
    
    const handleDelete = async (customerId) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                const response = await fetch(`/api/customers?id=${customerId}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    setCustomers(prevCustomers => 
                        prevCustomers.filter(customer => customer._id !== customerId)
                      );
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
            <div className="flex justify-center items-center h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-300">
                <span className='text-sm sm:t-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
            </div>
        );
    }
    
    return (
        <div className="pb-6 h-[100%] overflow-hidden bg-gray-200 dark:bg-gray-900 items-center transition-colors duration-300">
            <div className="px-2 py-6">
                <div className="text-black dark:text-white flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col lg:flex-row items-center gap-2">
                        <DateDropdown onDateFilterChange={handleDateFilterChange} />
                        <span className="text-sm sm:text-md font-medium text-gray-700 dark:text-gray-300">
                            Total {getFilteredCustomers().length} / {customers.length} ▼
                        </span>
                    </div>
                    
                    <div className='flex space-x-2'>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name,company,email,phone"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-blue-600 dark:border-blue-400 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            
                            <Link href="/admin/customers/createCustomer">
                                <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm sm:text-md font-medium flex items-center gap-1 justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Customer
                                </button>
                            </Link>
                        </div>
                        {/* export pdf dropdown menu */}
                        <div className="w-[36px] h-[36px] border-1 border-blue-400 dark:border-blue-500 rounded-md flex justify-center items-center bg-white dark:bg-gray-800">
                        <Dropdown
                            options={[
                            { label: "Export PDF", icon: <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                            { label: "Export CSV", icon: <Upload className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                            { label: "Export XLSX", icon: <Upload className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" /> },
                            ]}
                            exportData={getExportData()}
                            exportFileName="Customer-entries"
                            filters={getCurrentFilters()}
                        />
                        </div>
                    </div>
                    
                </div>
    
                <div className="h-[780px] bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg shadow flex flex-col transition-colors duration-300">
                    <div className="overflow-auto flex justify-between hide-scrollbar"> 
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative"> 
                            <thead className="bg-blue-100 dark:bg-blue-900/30 sticky top-0">
                                <tr className='bg-blue-100 dark:bg-blue-900/30'>
                                    <th className="w-[20%] pl-4 px-1 text-left py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Name</th>
                                    <th className="w-[20%] px-2 text-left py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Company</th>
                                    <th className="w-[20%] px-2 text-left py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Email</th>
                                    <th className="w-[10%] px-2 text-left py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Phone</th>
                                    <th className="w-[20%] px-2 text-center py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pay</th> 
                                    <th className="w-[10%] px-2 text-left py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y text-sm divide-gray-200 dark:divide-gray-700">
                                {getFilteredCustomers().length > 0 ? (
                                    getFilteredCustomers().map((customer) => (
                                        <tr key={customer._id} className='hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200'>
                                            <td className="w-[20%] pl-4 px-2 py-4 text-left text-blue-500 dark:text-blue-400">
                                                <Link href={`/admin/customers/showCustomer?id=${customer._id}`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200">
                                                    <User size={16} className='inline text-blue-500 dark:text-blue-400 mr-1' /> {customer.customerName}
                                                </Link>
                                            </td>
                                            <td className="w-[20%] px-2 py-4 text-left text-gray-900 dark:text-gray-100">
                                                <Building2 size={16} className='inline text-blue-500 dark:text-blue-400 mr-1' /> {customer.companyName}
                                            </td>
                                            <td className="w-[20%] px-2 py-4 text-left text-gray-900 dark:text-gray-100">
                                                <Mail size={16} className='inline text-blue-500 dark:text-blue-400 mr-1' /> {customer.email}
                                            </td>
                                            <td className="w-[10%] px-2 py-4 text-left text-gray-900 dark:text-gray-100"> 
                                                <Phone size={16} className='inline text-blue-500 dark:text-blue-400 mr-1' /> {customer.phone}
                                            </td>
                                            <td className="w-[20%] px-2 py-4 text-center text-gray-900 dark:text-gray-100">
                                                {paymentData[customer._id]?.totalAmount === 0 ? (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                                                ) : (
                                                    <span className="text-sm text-black dark:text-white">
                                                        {paymentData[customer._id]?.totalPaid || 0} / {paymentData[customer._id]?.totalAmount || 0}
                                                    </span>
                                                )}
                                            </td>
                                            <td className='w-[10%] px-2 py-4 text-left'>
                                                <button 
                                                    onClick={() => handleEdit(customer._id)}
                                                    className='p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200'
                                                    title="Edit Customer"
                                                >
                                                    <UserRoundPen size={16} className='text-blue-500 dark:text-blue-400' />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer._id)}
                                                    className='ml-2 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200'
                                                    title="Delete Customer"
                                                >
                                                    <Trash2 size={16} className='text-red-500 dark:text-red-400' />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            {searchQuery ? 
                                                `No customers found matching "${searchQuery}"` : 
                                                'No customers found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerList;