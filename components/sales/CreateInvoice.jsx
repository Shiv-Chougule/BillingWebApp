'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import CreateCustomer from '../../../../components/customer/CreateCustomer';
import { ChartNoAxesCombined, CircleUser, ChevronDown, X } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  customerName: z.string().min(1, 'customer name is required'),
  invoiceNumber: z.string().min(1, 'invoiceNo is required'),  
  salesperson: z.string().min(1, 'salesperson name is required'),
  orderNumber: z.string().min(1, 'Order number required'),
  country: z.string().min(1, 'Country is required'),
  subject: z.string().min(1, 'subject is required'),
  city: z.string().min(1, 'City is required'),
  businessType: z.string().min(1, 'Industry type is required'),
  gstin: z.string().min(1, 'GSTIN/UID is required'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  state: z.string().min(1, 'State is required'),
  terms: z.string().min(1, 'this is required'),
  isGstRegistered: z.enum(['Yes', 'No']),
});

export default function AccountForm() {
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [terms, setTerms] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [adjustment, setAdjustment] = useState('');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  
  // Customer search dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/customers');
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    fetchCustomers();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name);
    setSelectedCustomer(customer);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    setCustomerName('');
    setSelectedCustomer(null);
    setIsDropdownOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemsWithAmount = items.map(item => ({
      ...item,
      amount: parseFloat(calculateAmount(item).toFixed(2)),
    }));

    const invoiceData = {
      customerName,
      invoiceNumber,
      salesperson,
      orderNumber,
      subject,
      terms,
      invoiceDate,
      dueDate,
      items: itemsWithAmount,
      subTotal: parseFloat(subTotal.toFixed(2)),
      adjustment: parseFloat(adjustment),
      total: parseFloat(total.toFixed(2)),
    };
    try {
      const response = await axios.post('/api/invoices', invoiceData);
      console.log('Invoice saved:', response.data);
      alert('Invoice submitted successfully!');
    } catch (error) {
      console.error('Error submitting invoice:', error.response?.data || error.message);
    }
  };

  // ... rest of your existing state and functions ...

  return (
    <div className='relative'>
      <div className="my-6 max-w-6xl mx-auto p-2 sm:p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-2 sm:mb-4 text-2xl font-bold text-gray-800">Create Invoice</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information Section */}
          <section className="space-y-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
            <div className='w-full flex flex-col gap-2 sm:gap-8'>
              {/* Customer Name - Updated with search dropdown */}
              <div className='relative'>
                <label htmlFor="customerName" className="block text-md font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <div className="relative">
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-gray-50">
                      <span>{selectedCustomer.name}</span>
                      <button 
                        type="button" 
                        onClick={handleClearSelection}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        id="customerName"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Search or select a Customer"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        <ChevronDown size={20} />
                      </button>
                    </>
                  )}
                  
                  {isDropdownOpen && !selectedCustomer && (
                    <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                      {filteredCustomers.length > 0 ? (
                        <ul>
                          {filteredCustomers.map((customer) => (
                            <li
                              key={customer.id}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <CircleUser size={16} className="text-gray-500" />
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                {customer.email && (
                                  <p className="text-xs text-gray-500">{customer.email}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          No customers found
                        </div>
                      )}
                      <div 
                        className="px-4 py-2 border-t border-gray-200 bg-blue-50 text-blue-600 hover:underline cursor-pointer"
                        onClick={() => {
                          setShowCreateCustomer(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        + Create new Customer
                      </div>
                    </div>
                  )}
                </div>
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>
              
              {/* ... rest of your form fields ... */}
            </div>
            {/* ... rest of your form ... */}
          </section>
          {/* ... rest of your form ... */}
        </form>
      </div>
      
      {showCreateCustomer && (
        <div className="absolute top-0 sm:left-20 lg:left-40 2xl:left-120 mt-4 border-2 border-blue-500 shadow-lg shadow-blue-300 rounded-md bg-white">
          <CreateCustomer 
            onClose={() => setShowCreateCustomer(false)} 
            onCustomerCreated={(newCustomer) => {
              setCustomers([...customers, newCustomer]);
              handleCustomerSelect(newCustomer);
            }}
          />
        </div>
      )}
    </div>
  );
}