"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { ArrowLeft, CircleUser, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const formSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  outstandingAmount: z.string().min(1, 'Outstanding amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount'),
  // bankCharges: z.string().min(1, 'Bank charges field is required')
  //   .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount'),
  paymentDate: z.string().min(1, 'Payment Date is required'),  
  paymentMode: z.string().min(1, 'Payment mode field is required'),
  payment: z.string().min(1, 'Payment is required'),
  // referenceNumber: z.string().min(1, 'ReferenceNumber field is required'),
  notes: z.string().min(1, 'Notes are required')
});

export default function ReceivePaymentForm() {
    // State declarations
    const [remainingAmount, setRemainingAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [markedInvoices, setMarkedInvoices] = useState([]);
    const [adjustedInvoiceTotals, setAdjustedInvoiceTotals] = useState({});
    const [deductedFromInvoices, setDeductedFromInvoices] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchQueryInvoice, setSearchQueryInvoice] = useState('');
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [isInvoiceDropdownOpen, setIsInvoiceDropdownOpen] = useState(false);
    const [updatedAmounts, setUpdatedAmounts] = useState([]);
    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null); 
    
    // Form hook initialization
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      trigger,
      watch
    } = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        payment: `PAY-${Date.now()}`
      }
    });

    const handleInputChange = (fieldName, value) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
      setValue(fieldName, value, { shouldValidate: true });
    };

    // Sync form values with state
    useEffect(() => {
      setValue('payment', `PAY-${Date.now()}`);
    }, [setValue]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef1.current && !dropdownRef1.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
        if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
          setIsInvoiceDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Fetch customers
    useEffect(() => {
      const fetchCustomers = async () => {
        try {
          const response = await axios.get('/api/customers');
          let customerData = Array.isArray(response.data) 
            ? response.data 
            : response.data.customers || response.data.data || [];
          
          const formattedCustomers = customerData.map(item => ({
            id: item._id || item.id,
            name: item?.customerName || item.name || 'No Name',
            companyName: item?.companyName || item.companyName || '',
            email: item.mail || item.mail || ''
          }));
          
          setCustomers(formattedCustomers);
          setFilteredCustomers(formattedCustomers);
        } catch (error) {
          console.error('Error fetching customers:', error);
        }
      };
      
      fetchCustomers();
    }, []);
    // Fetch invoices
    useEffect(() => {
      const fetchInvoices = async () => {
        try {
          const response = await axios.get('/api/invoices');
          let invoiceData = Array.isArray(response.data) 
            ? response.data 
            : response.data.invoices || response.data.data || [];
          
          // Filter invoices to only include those with paymentStatus: 'pending'
          const pendingInvoices = invoiceData.filter(item => 
            item.paymentStatus === 'pending' || item.paymentStatus === 'Pending'
          );
          
          // Fetch customer details for each PENDING invoice only
          const invoicesWithCustomers = await Promise.all(
            pendingInvoices.map(async (item) => {
              try {
                // Fetch customer details if not populated
                let customerDetails = item.customer;
                if (typeof item.customer === 'string') {
                  const customerResponse = await axios.get(`/api/customers/${item.customer}`);
                  customerDetails = customerResponse.data;
                }
                
                return {
                  id: item._id || item.id,
                  invoiceNumber: item.invoiceNumber || 'No Number', // FIXED: Changed from paymentStatus to invoiceNumber
                  customerId: customerDetails._id,
                  customerName: customerDetails?.customerName || customerDetails?.name || 'No Name',
                  companyName: customerDetails?.companyName || '',
                  email: customerDetails?.email || customerDetails?.mail || '',
                  invoiceDate: item?.invoiceDate || 'N/A',
                  total: item?.total || 0,
                  paymentStatus: item.paymentStatus || 'pending' // Keep track of payment status
                };
              } catch (error) {
                console.error('Error fetching customer details:', error);
                return {
                  id: item._id || item.id,
                  invoiceNumber: item.invoiceNumber || 'No Number',
                  customerId: null,
                  customerName: 'Unknown Customer',
                  companyName: '',
                  email: '',
                  invoiceDate: item?.invoiceDate || 'N/A',
                  total: item?.total || 0,
                  paymentStatus: item.paymentStatus || 'pending'
                };
              }
            })
          );
          
          setInvoices(invoicesWithCustomers);
          setFilteredInvoices(invoicesWithCustomers);
        } catch (error) {
          console.error('Error fetching invoices:', error);
        }
      };
      
      fetchInvoices();
    }, []);
    // Filter customers
    useEffect(() => {
      if (!Array.isArray(customers)) {
        setFilteredCustomers([]);
        return;
      }
    
      if (searchQuery.trim() === '') {
        setFilteredCustomers(customers);
        return;
      }
    
      const filtered = customers.filter(customer => {
        if (!customer) return false;
        const searchTerm = searchQuery.toLowerCase();
        const nameMatch = customer.name?.toLowerCase().includes(searchTerm);
        const emailMatch = customer.email?.toLowerCase().includes(searchTerm);
        return nameMatch || emailMatch;
      });
    
      setFilteredCustomers(filtered);
    }, [searchQuery, customers]);

    // Filter invoices
    useEffect(() => {
      if (!Array.isArray(invoices)) {
        setFilteredInvoices([]);
        return;
      }
    
      let filtered = invoices;
    
      if (selectedCustomer) {
        filtered = filtered.filter(invoice => 
          invoice.customerId === selectedCustomer.id
        );
      }
    
      if (searchQueryInvoice.trim() !== '') {
        filtered = filtered.filter(invoice => {
          const searchTerm = searchQueryInvoice.toLowerCase();
          const nameMatch = invoice.customerName?.toLowerCase().includes(searchTerm);
          const companyMatch = invoice.companyName?.toLowerCase().includes(searchTerm);
          const amountMatch = invoice.total?.toString().includes(searchQueryInvoice);
          return nameMatch || companyMatch || amountMatch;
        });
      }
    
      setFilteredInvoices(filtered);
    }, [searchQueryInvoice, invoices, selectedCustomer]);

    const handleCustomerSelect = (customer) => {
      setValue('customerName', customer.name, { shouldValidate: true });
      setSelectedCustomer(customer);
      setIsDropdownOpen(false);
      setSearchQuery('');
      
      if (Array.isArray(invoices)) {
        const customerInvoices = invoices.filter(invoice => 
          invoice.customerId === customer.id
        );
        setFilteredInvoices(customerInvoices);
      }
    };

    const handleClearSelection = () => {
      setValue('customerName', '', { shouldValidate: true });
      setSelectedCustomer(null);
      setIsDropdownOpen(true);
    };
    const handleCheckboxChange = (invoice) => {
      const invoiceId = invoice.id;
      const originalTotal = parseFloat(invoice.total);
      const currentOutstandingAmount = parseFloat(watch('outstandingAmount') || 0);
      const currentRemainingAmount = parseFloat(remainingAmount || currentOutstandingAmount);
      const isMarked = markedInvoices.includes(invoiceId);
    
      if (isMarked) {
        // When unchecking - restore the original amount
        const amountPaid = parseFloat(deductedFromInvoices[invoiceId] || 0);
        const newRemainingAmount = (parseFloat(remainingAmount) + amountPaid).toFixed(2);
        
        setRemainingAmount(newRemainingAmount);
        setMarkedInvoices(prev => prev.filter(id => id !== invoiceId));
        
        setAdjustedInvoiceTotals(prev => {
          const updated = { ...prev };
          delete updated[invoiceId];
          return updated;
        });
        
        setDeductedFromInvoices(prev => {
          const updated = { ...prev };
          delete updated[invoiceId];
          return updated;
        });
    
        setUpdatedAmounts(prev => prev.filter(item => item.invoiceId !== invoiceId));
        
        // If no checkboxes are selected after unchecking this one, clear the outstanding amount
        if (markedInvoices.length === 1) { // This was the last checked invoice
          setValue('outstandingAmount', '', { shouldValidate: true });
          setRemainingAmount('');
        }
      } else {
        // If no outstanding amount is set yet, set it to the invoice total
        if (currentOutstandingAmount <= 0) {
          setValue('outstandingAmount', originalTotal.toFixed(2), { shouldValidate: true });
          setRemainingAmount(originalTotal.toFixed(2));
        }
    
        // Calculate how much we can deduct from this invoice
        const amountToDeduct = Math.min(originalTotal, currentRemainingAmount || originalTotal);
        const newInvoiceTotal = (originalTotal - amountToDeduct).toFixed(2);
        const newRemainingAmount = ((currentRemainingAmount || originalTotal) - amountToDeduct).toFixed(2);
    
        setRemainingAmount(newRemainingAmount);
        setMarkedInvoices(prev => [...prev, invoiceId]);
        
        setAdjustedInvoiceTotals(prev => ({
          ...prev,
          [invoiceId]: newInvoiceTotal,
        }));
        
        setDeductedFromInvoices(prev => ({
          ...prev,
          [invoiceId]: amountToDeduct,
        }));
        
        setUpdatedAmounts(prev => [
          ...prev.filter(item => item.invoiceId !== invoiceId),
          {
            invoiceId,
            originalAmount: originalTotal,
            amountPaid: amountToDeduct,
            remainingAmount: parseFloat(newInvoiceTotal)
          }
        ]);
      }
    };

    const onSubmit = async (data) => {
      try {
        // Calculate total paid amount from all marked invoices
        const totalPaid = markedInvoices.reduce((sum, invoiceId) => {
          return sum + parseFloat(deductedFromInvoices[invoiceId] || 0);
        }, 0);

        const paymentData = {
          customerName: data.customerName,
          outstandingAmount: parseFloat(data.outstandingAmount),   
          bankCharges: 0, 
          paymentDate: new Date(paymentDate).toISOString(), 
          paymentMode: data.paymentMode,
          payment: data.payment, 
          referenceNumber: '0',
          notes: data.notes,
          markedInvoices: markedInvoices.map(invoiceId => {
            const invoice = invoices.find(inv => inv.id === invoiceId);
            return {
              invoiceId,
              originalAmount: parseFloat(invoice.total), // Original invoice amount
              amountPaid: parseFloat(deductedFromInvoices[invoiceId] || 0), // Amount paid against this invoice
              remainingAmount: parseFloat(adjustedInvoiceTotals[invoiceId] || invoice.total) // Remaining amount
            };
          }),
          totalPaid: totalPaid
        };

        console.log('Submitting payment:', paymentData);
        
        // 1. First create the payment record
        const paymentResponse = await axios.post('/api/payments', paymentData);
        console.log('Payment submitted:', paymentResponse.data);

        // 2. Update each invoice with the payment amount
        if (markedInvoices.length > 0) {
          try {
            const invoiceUpdates = await Promise.all(
              markedInvoices.map(async (invoiceId) => {
                try {
                  const amountPaid = parseFloat(deductedFromInvoices[invoiceId] || 0);
                  const response = await axios.put('/api/invoices', {
                    id: invoiceId,
                    amountPaid: amountPaid // Send the payment amount to be added to totalPaid
                  });
                  return response.data;
                } catch (error) {
                  console.error(`Error updating invoice ${invoiceId}:`, error);
                  return null;
                }
              })
            );
            console.log('Invoices updated:', invoiceUpdates.filter(Boolean));
            window.location.href = '/admin/payments';
          } catch (error) {
            console.error('Error updating invoices:', error);
            throw error; // Re-throw to trigger the catch block below
          }
        }

        alert('Payment submitted successfully!');
        resetForm();

      } catch (error) {
        console.error('Payment submission failed:', error.response?.data || error.message);
        alert(`Payment failed: ${error.response?.data?.error || error.message}`);
      }
    };
    
    const resetForm = () => {
      setValue('customerName', '');
      setSelectedCustomer(null);
      setRemainingAmount('');
      setMarkedInvoices([]);
      setAdjustedInvoiceTotals({});
      setDeductedFromInvoices({});
      setUpdatedAmounts([]); 
    };
   
      useEffect(() => {
        // Set today's date as default in format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        setPaymentDate(today);
        setValue('paymentDate', today, { shouldValidate: true });
      }, [setValue]);
  return (
    <div className="w-8xl h-[100%] mx-auto p-2 sm:p-6 bg-gray-200 dark:bg-gray-900">
      <div className="w-8xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md rounded-lg">
        <h2 className="text-xl font-bold my-6 text-blue-600 dark:text-blue-400 flex">
          <ArrowLeft size={20} className="mt-1 mx-2" />
          Receive Payment
        </h2>
        <hr className="border-1 border-gray-300 dark:border-gray-700"/>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="relative max-w-xl lg:max-w-2xl">
            {/* Customer Name */}
            <div ref={dropdownRef1} className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
              <label htmlFor="customerName" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Customer Name <span className="text-red-500">*</span>
              </label>
  
              <div className="relative w-full lg:w-[500px]">
                {selectedCustomer ? (
                  <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                    <span className="text-gray-900 dark:text-white">{selectedCustomer.name}</span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id="customerName"
                      type="text"
                      autoComplete="off"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onBlur={() => trigger('customerName')}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search or select a Customer"
                      className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.customerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </>
                )}
  
                {isDropdownOpen && !selectedCustomer && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl hide-scrollbar">
                    {filteredCustomers.length > 0 ? (
                      <ul>
                        {filteredCustomers.map((customer) => (
                          <li
                            key={customer.id}
                            className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <CircleUser size={16} className="text-gray-500 dark:text-gray-400" />
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              {customer.companyName && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {customer.companyName}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No customers found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
  
            {/* Outstanding Amount */}
            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
              <label htmlFor="outstandingAmount" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Outstanding Amount <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <input
                  {...register('outstandingAmount')}
                  id="outstandingAmount"
                  type="text"
                  autoComplete="off"
                  value={markedInvoices.length > 0 ? 
                    (watch('outstandingAmount') || '') : 
                    (remainingAmount || watch('outstandingAmount') || '')
                  }
                  onChange={(e) => {
                    if (markedInvoices.length === 0) {
                      setRemainingAmount(e.target.value);
                      setValue('outstandingAmount', e.target.value, { shouldValidate: true });
                    }
                  }}
                  onBlur={() => trigger('outstandingAmount')}
                  placeholder="Enter amount"
                  readOnly={markedInvoices.length > 0}
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.outstandingAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    markedInvoices.length > 0 ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
  
            {selectedCustomer && (
              filteredInvoices.length > 0 ? (
                <div ref={dropdownRef2} className="min-w-[260px] p-2 sm:p-4 md:p-6 lg:p-8 text-sm sm:text-lg sm:w-auto mt-4 border-1 border-blue-500 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700">
                  {/* Invoice Table Display */}
                  <div className="h-full overflow-scroll border border-gray-300 dark:border-gray-600 rounded-lg hide-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-blue-50 dark:bg-gray-600 sticky top-0">
                        <tr>
                          <th className="hidden sm:table-cell px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                            Invoice Number
                          </th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Mark</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-100 dark:divide-gray-600">
                        {filteredInvoices.map((invoice) => {
                          const invoiceId = invoice.id;
                          const isMarked = markedInvoices.includes(invoiceId);
                          const displayTotal =
                            invoiceId in adjustedInvoiceTotals
                              ? adjustedInvoiceTotals[invoiceId]
                              : invoice.total;
  
                          return (
                            <tr
                              key={invoiceId}
                              className="hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer"
                            >
                              <td className="hidden sm:table-cell text-sm px-4 py-2 text-gray-800 dark:text-gray-300">{invoice.invoiceNumber}</td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {new Date(invoice.invoiceDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                ₹{parseFloat(displayTotal).toFixed(2)}
                              </td>
                              <td className="px-4 py-2">
                                {(parseFloat(remainingAmount) > 0 || isMarked || watch('outstandingAmount') === '') ? (
                                  <input
                                    type="checkbox"
                                    checked={isMarked}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => handleCheckboxChange(invoice)}
                                    className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-800"
                                  />
                                ) : (
                                  <span className="text-gray-400"></span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:gap-4 mb-4">
                    {markedInvoices.length > 0 && (
                      <span className="font-semibold sm:text-xl text-blue-700 dark:text-blue-400">
                        <span className="text-black dark:text-white">Remaining: </span> 
                        ₹{parseFloat(remainingAmount || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-1 border-blue-500 dark:border-blue-600 rounded-md p-4 bg-white dark:bg-gray-700">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    No invoices found for this customer
                  </p>
                </div>
              )
            )}
  
            {/* Bank Charges */}
            <div className="hidden my-4 lg:w-full">
              <label htmlFor="bankCharges" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Bank Charges (if any) <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <input
                  {...register('bankCharges')}
                  id="bankCharges"
                  type="text"
                  autoComplete="off"
                  onChange={(e) => {
                    setValue('bankCharges', e.target.value, { shouldValidate: true });
                  }}
                  onBlur={() => trigger('bankCharges')}
                  placeholder="Enter bank charges"
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.bankCharges ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.bankCharges && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankCharges.message}</p>
                )}
              </div>
            </div>
  
            {/* Payment Date */}
            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
              <label htmlFor="paymentDate" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <input
                  id="paymentDate"
                  type="date"
                  autoComplete="off"
                  value={paymentDate}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setPaymentDate(dateValue);
                    setValue('paymentDate', dateValue, { shouldValidate: true });
                  }}
                  onBlur={() => trigger('paymentDate')}
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.paymentDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.paymentDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentDate.message}</p>
                )}
              </div>
            </div>
  
            {/* Payment Mode */}
            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
              <label htmlFor="paymentMode" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <select
                  {...register('paymentMode')}
                  id="paymentMode"
                  autoComplete="off"
                  onChange={(e) => {
                    setValue('paymentMode', e.target.value, { shouldValidate: true });
                  }}
                  onBlur={() => trigger('paymentMode')}
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.paymentMode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select payment mode</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
                {errors.paymentMode && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentMode.message}</p>
                )}
              </div>
            </div>
  
            {/* Payment Number */}
            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between">
              <label htmlFor="payment" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Payment # <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <input
                  {...register('payment')}
                  id="payment"
                  type="text"
                  autoComplete="off"
                  readOnly
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                {errors.payment && (
                  <p className="text-red-500 text-sm mt-1">{errors.payment.message}</p>
                )}
              </div>
            </div>
  
            {/* ReferenceNumber Number */}
            <div className="my-4 lg:w-full hidden">
              <label htmlFor="referenceNumber" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                ReferenceNumber # <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <input
                  {...register('referenceNumber')}
                  id="referenceNumber"
                  type="text"
                  autoComplete="off"
                  onChange={(e) => {
                    setValue('referenceNumber', e.target.value, { shouldValidate: true });
                  }}
                  onBlur={() => trigger('referenceNumber')}
                  placeholder="Enter referenceNumber number"
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.referenceNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.referenceNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.referenceNumber.message}</p>
                )}
              </div>
            </div>
  
            {/* Notes */}
            <div className="my-4 lg:w-full flex flex-col lg:flex-row justify-between items-center">
              <label htmlFor="notes" className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                Notes <span className="text-red-500">*</span>
              </label>
              <div className="w-full lg:w-[500px]">
                <textarea
                  {...register('notes')}
                  id="notes"
                  autoComplete="off"
                  onChange={(e) => {
                    setValue('notes', e.target.value, { shouldValidate: true });
                  }}
                  onBlur={() => trigger('notes')}
                  placeholder="Enter any additional notes"
                  rows="3"
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.notes ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>
  
          {/* Submit Button */}
          <div className="w-full flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-700 text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Submit
            </button>
            <Link href="">
              <button
                className="border-2 mx-2 sm:mx-4 border-gray-200 dark:border-gray-600 text-black dark:text-white p-2 sm:px-6 sm:py-2 rounded-lg hover:text-blue-700 dark:hover:text-blue-400 transition"
              >
                Close
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>

  );
}