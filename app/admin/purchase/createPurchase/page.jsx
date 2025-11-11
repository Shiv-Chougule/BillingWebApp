'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import CreateVendor from '../../../../components/vendor/CreateVendor';
import { ChevronDown, CircleUser, X, ShoppingCart } from 'lucide-react';
import ReactDOM from 'react-dom'; 
import { ItemDropdown } from './ItemDropdown';
const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

// Form validation schema
// Updated form validation schema with only required fields
const formSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  purchaseOrder: z.string().min(1, 'Purchase order is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(
    z.object({
      name: z.string().min(1, 'Item name is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price cannot be negative')
    })
  ).min(1, 'At least one item is required')
});

const generatePurchaseNumber = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.getTime().toString().slice(-4);
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `PUR-${datePart}-${timePart}-${randomPart}`;
};

export default function AccountForm() {
  const [vendorName, setVendorName] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState(generatePurchaseNumber());
  const [salesperson, setSalesperson] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [terms, setTerms] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [adjustment, setAdjustment] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');

  const dropdownRef = useRef(null);
  const inputRefs = useRef([]);
  const dropdownRefs = useRef([]);

  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendorId');
  const [invalidFields, setInvalidFields] = useState(new Set());

  // Vendor search dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Stocks search dropdown state
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchStockQuery, setSearchStockQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockName, setStockName] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);

  // Items state
 // First declare all state variables at the top
    const [items, setItems] = useState([
      { 
        id: 1, 
        name: '', 
        quantity: '', 
        price: '', 
        gst: 0,
        isStockDropdownOpen: false,
        selectedStock: null 
      }
    ]);

    // Then declare the click outside handler
    const handleClickOutside = useCallback((event) => {
      // For vendor dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      // For stock dropdowns
      let clickedOutsideAllStockDropdowns = true;
      items.forEach((item, index) => {
        const inputEl = inputRefs.current[index];
        const dropdownEl = dropdownRefs.current[index];
        if (inputEl?.contains(event.target) || dropdownEl?.contains(event.target)) {
          clickedOutsideAllStockDropdowns = false;
        }
      });

      if (clickedOutsideAllStockDropdowns) {
        setItems(prevItems => 
          prevItems.map(item => ({ ...item, isStockDropdownOpen: false }))
        );
      }
    }, [items]); // Add items as dependency

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [handleClickOutside]);

  const validateForm = () => {
    const requiredFields = {
      vendor: selectedVendor,
      purchaseOrder,
    };
  
    const newInvalidFields = new Set();
  
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value?.toString().trim()) {
        newInvalidFields.add(field);
      }
    });
  
    setInvalidFields(newInvalidFields);
    return newInvalidFields.size === 0;
  };


  // Fetch vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('/api/vendor');
        let vendorData = Array.isArray(response.data) 
          ? response.data 
          : response.data.vendors || response.data.data || [];
        
        const formattedVendors = vendorData.map(item => ({
          id: item._id || item.id,
          vendorName: item.vendorName || 'No Name',
          companyName: item.companyName || '',
          email: item.email || '',
          phone: item.phone || '',
          firstName: item.firstName || '',
          lastName: item.lastName || '',
        }));
        
        setVendors(formattedVendors);
        setFilteredVendors(formattedVendors);

        // If vendorId exists in URL, find and select that vendor
        if (vendorId) {
          const vendorToSelect = formattedVendors.find(
            vendor => vendor.id === vendorId
          );
          if (vendorToSelect) {
            setSelectedVendor(vendorToSelect);
            setVendorName(vendorToSelect.vendorName);
          }
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]);
        setFilteredVendors([]);
      }
    };
    fetchVendors();
  }, [vendorId]);

  // Filter vendors based on search query
  useEffect(() => {
    if (!Array.isArray(vendors)) {
      console.error('Vendors data is not an array:', vendors);
      setFilteredVendors([]);
      return;
    }
  
    if (searchQuery.trim() === '') {
      setFilteredVendors(vendors);
      return;
    }
  
    const filtered = vendors.filter(vendor => {
      if (!vendor) return false;
      const searchTerm = searchQuery.toLowerCase();
      const nameMatch = vendor.vendorName?.toLowerCase().includes(searchTerm);
      const companyMatch = vendor.companyName?.toLowerCase().includes(searchTerm);
      const emailMatch = vendor.email?.toLowerCase().includes(searchTerm);
      const phoneMatch = vendor.phone?.includes(searchQuery);
      return nameMatch || companyMatch || emailMatch || phoneMatch;
    });
  
    setFilteredVendors(filtered);
  }, [searchQuery, vendors]);

  const handleVendorSelect = (vendor) => {
    setVendorName(vendor.vendorName);
    setSelectedVendor(vendor);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    setVendorName('');
    setSelectedVendor(null);
    setIsDropdownOpen(true);
  };

  // Fetch stocks from API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get('/api/stocks');
        const responseData = response?.data?.items || [];
        
        const formattedStocks = responseData.map((item) => ({
          id: item?.id || item?._id || `temp-${Date.now()}`,
          name: item?.name || 'Unnamed Product',
          quantity: Number(item?.quantity) || 0,
          category: item?.category || 'Uncategorized',
          sellingPrice: Number(item?.sellingPrice || item?.price || 0)
        }));

        setStocks(formattedStocks);
        setFilteredStocks(formattedStocks);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setStocks([]);
        setFilteredStocks([]);
      }
    };

    fetchStocks();
  }, []);

  // Filter stocks based on search query
  useEffect(() => {
    if (!Array.isArray(stocks)) {
      console.error('Stocks data is not an array:', stocks);
      setFilteredStocks([]);
      return;
    }

    if (searchStockQuery.trim() === '') {
      setFilteredStocks(stocks);
      return;
    }

    const filtered = stocks.filter(stock => {
      if (!stock) return false;
      const searchTerm = searchStockQuery.toLowerCase();
      const nameMatch = stock.name?.toLowerCase().includes(searchTerm);
      const categoryMatch = stock.category?.toLowerCase().includes(searchTerm);
      const sellingPriceMatch = String(stock.rate).includes(searchStockQuery);
      const quantityMatch = String(stock.quantity).includes(searchStockQuery);
      return nameMatch || categoryMatch || sellingPriceMatch || quantityMatch;
    });

    setFilteredStocks(filtered);
  }, [searchStockQuery, stocks]);

  const toggleStockDropdown = (itemId, isOpen) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, isStockDropdownOpen: isOpen !== undefined ? isOpen : !item.isStockDropdownOpen }
          : item
      )
    );
  };

  const handleStockSelect = (stock, itemId) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              name: stock.name,
              selectedStock: stock,
              isStockDropdownOpen: false
            } 
          : item
      )
    );
    setSearchStockQuery('');
  };

  const handleClearStockSelection = (itemId) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              name: '',
              price: 0,
              selectedStock: null
            } 
          : item
      )
    );
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];

    if (field === 'name') {
      updatedItems[index][field] = value || '';
    } else {
      let parsedValue = parseFloat(value);
      updatedItems[index][field] = isNaN(parsedValue) ? 0 : parsedValue;
    }

    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      name: '', 
      quantity: '', 
      price: '', 
      gst: 0,
      isStockDropdownOpen: false,
      selectedStock: null
    }]);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateAmount = (item) => {
    const quantity = isNaN(item.quantity) ? 0 : item.quantity;
    const price = isNaN(item.price) ? 0 : item.price;
    const gst = isNaN(item.gst) ? 0 : item.gst;

    const gstAmount = (price * quantity) * (gst / 100);
    return (price * quantity) + gstAmount;
  };

  const calculateGSTBreakdown = () => {
    const gstSummary = {};

    items.forEach((item) => {
      const gstRate = parseFloat(item.gst);
      if (gstRate === 0 || !item.quantity || !item.price) return;

      const amount = parseFloat(item.price) * parseFloat(item.quantity);
      const gstAmount = (amount * gstRate) / 100;
      const cgstAmount = gstAmount / 2;
      const sgstAmount = gstAmount / 2;

      if (!gstSummary[gstRate]) {
        gstSummary[gstRate] = {
          cgst: 0,
          sgst: 0,
          total: 0
        };
      }
      gstSummary[gstRate].cgst += cgstAmount;
      gstSummary[gstRate].sgst += sgstAmount;
      gstSummary[gstRate].total += gstAmount;
    });

    return gstSummary;
  };

  const gstBreakdown = calculateGSTBreakdown();
  const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const gstTotal = Object.values(gstBreakdown).reduce((sum, {total}) => sum + total, 0);
  const discountAmount = (subTotal * discount) / 100;
  const total = subTotal + gstTotal + (isNaN(adjustment) ? 0 : parseFloat(adjustment)) - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Please fill all required fields');
      return;
    }
  
    // Prepare items data for the purchase
    const itemsWithValidation = items.map(item => ({
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
      gst: Number(item.gst) || 0,
      amount: calculateAmount(item),
      itemId: item.selectedStock?.id
    }));
  
    const purchaseData = {
      vendor: selectedVendor.id,
      purchaseOrder,
      purchaseDate: new Date(purchaseDate),
      dueDate: new Date(dueDate),
      items: itemsWithValidation,
      // Optional fields
      salesperson: salesperson || "",
      referenceNumber: referenceNumber || "",
      subject: subject || "",
      terms: terms || "",
      subTotal: Number(subTotal),
      adjustment: Number(adjustment) || 0,
      discount: Number(discount) || 0,
      total: Number(total),
      paymentStatus: "pending",
      totalPaid: 0,
      termsAndConditions: termsAndConditions || "",
      vendorNotes: vendorNotes || ""
    };
  
    try {
      // Create the purchase record (stock updates are handled in the API)
      const response = await axios.post('/api/purchase', purchaseData);
      console.log('Purchase saved:', response.data);
      
      // Create expense record for the purchase
      const expenseData = {
        category: 'stocks purchases', // You can set a default category or make it dynamic
        date: new Date(purchaseDate), // Use purchase date for expense date
        amount: Number(total), // Use the total purchase amount
        paymentMethod: 'credit', // Default to credit since it's a purchase
        description: `Purchase from ${selectedVendor.vendorName}`,
        invoiceID: purchaseOrder, // Use purchase order as invoice ID
        purchaseReference: response.data.id // Link to the purchase record
      };
  
      await axios.post('/api/expenses', expenseData);
      console.log('Expense record created for purchase');
      
      alert('Purchase submitted successfully and recorded as expense!');
  
      // Refresh stock data to reflect the updated quantities
      const stocksResponse = await axios.get('/api/stocks');
      setStocks(stocksResponse.data.items || []);
      setFilteredStocks(stocksResponse.data.items || []);
      window.location.href = '/admin/purchase';
    } catch (error) {
      console.error('Error submitting purchase:', error.response?.data || error.message);
      setSubmitError(error.response?.data?.error || 'Failed to submit purchase. Please try again.');
    }
  };

  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className='relative p-2 sm:p-6 bg-white dark:bg-gray-900'>
      <div className="my-6 max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-1">
        <h1 className="mb-2 sm:mb-4 text-2xl font-bold text-gray-800 dark:text-white">Create Purchase</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Business Information Section */}
          <section className="space-y-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
            <div className='w-full flex flex-col gap-2 sm:gap-8'>
              {/* Vendor Name */}
              <div ref={dropdownRef} className=''>
                <label htmlFor="vendorName" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vendor Name <span className='text-red-600'>*</span>
                </label>
                <div className="relative">
                  {selectedVendor ? (
                    <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                      <span className="text-gray-900 dark:text-white">{selectedVendor.vendorName}</span>
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
                        id="vendorName"
                        type="text"
                        autoComplete='off'
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Search or select a vendor"
                        className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          invalidFields.has('vendor') 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                        }`}
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
                  
                  {isDropdownOpen && !selectedVendor && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl flex flex-col max-h-60">
                      {/* Scrollable list container */}
                      <div className="overflow-y-auto flex-grow rounded-md hide-scrollbar">
                        {filteredVendors.length > 0 ? (
                          <ul>
                            {filteredVendors.map((vendor) => (
                              <li
                                key={vendor.id}
                                className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white"
                                onClick={() => handleVendorSelect(vendor)}
                              >
                                <CircleUser size={16} className="text-gray-500 dark:text-gray-400" />
                                <div>
                                  <p className="font-medium">{vendor.vendorName}</p>
                                  {vendor.companyName && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{vendor.companyName}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            No vendors found
                          </div>
                        )}
                      </div>
                      
                      {/* Sticky footer */}
                      <div 
                        className="sticky bottom-0 px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-gray-600 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer rounded-md"
                        onClick={() => {
                          setShowCreateVendor(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        + Create new vendor
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Reference Number */}
              <div className='hidden'>
                <label htmlFor="referenceNumber" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reference Number <span className='text-red-600'>*</span>
                </label>
                <input
                  id="referenceNumber"
                  type="text"
                  autoComplete='off'
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    invalidFields.has('referenceNumber') 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
              
              {/* Terms of Delivery */}
              <div className=''>
                <label htmlFor="terms" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Terms of Delivery
                </label>
                <input
                  id="terms"
                  type="text"
                  autoComplete='off'
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Subject */}
              <div className='w-full'>
                <label htmlFor="subject" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  autoComplete='off'
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Let your vendor know what this purchase is about"
                  className="w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Salesperson */}
              <div className='hidden'>
                <label htmlFor="salesperson" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salesperson
                </label>
                <input
                  id="salesperson"
                  autoComplete='off'
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className='w-full flex flex-col gap-2 sm:gap-8'>
              {/* Purchase Order */}
              <div className='w-full'>
                <label htmlFor="purchaseOrder" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Order <span className='text-red-600'>*</span>
                </label>
                <input
                  id="purchaseOrder"
                  type="text"
                  autoComplete='off'
                  value={purchaseOrder}
                  onChange={(e) => setPurchaseOrder(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    invalidFields.has('purchaseOrder') 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
              
              {/* Purchase Date */}
              <div className='w-full sm:mt-2'>
                <p className='text-md text-gray-700 dark:text-gray-300'>Purchase Date</p>
                <input
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  type="date"
                  autoComplete='off'
                  className="w-full text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              
              {/* Expected Date */}
              <div className='w-full'>
                <p className='text-md text-gray-700 dark:text-gray-300'>Expected Date</p>
                <input
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  type="date"
                  autoComplete='off'
                  className="w-full text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </section>
    
          {/* Items Section */}
          <section className='text-black dark:text-white'>
            <div className="relative shadow-lg rounded-lg">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <thead className="sticky top-0 bg-blue-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left min-w-[200px]">Item Details</th>
                      <th className="px-4 py-2 text-left min-w-[100px]">Quantity</th>
                      <th className="px-4 py-2 text-left min-w-[100px]">Price</th>
                      <th className="px-4 py-2 text-left min-w-[100px]">GST %</th>
                      <th className="px-4 py-2 text-left min-w-[100px]">Amount</th>
                      <th className="px-4 py-2 text-left min-w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="dark:bg-gray-800">
                        <td className="px-4 py-2">
                          <ItemDropdown
                            item={item}
                            index={index}
                            searchStockQuery={searchStockQuery}
                            setSearchStockQuery={setSearchStockQuery}
                            toggleStockDropdown={toggleStockDropdown}
                            handleClearStockSelection={handleClearStockSelection}
                            handleStockSelect={handleStockSelect}
                            filteredStocks={filteredStocks}
                            inputRefs={inputRefs}
                            dropdownRefs={dropdownRefs}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            autoComplete='off'
                            className="border-2 border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={item.quantity}
                            onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            autoComplete='off'
                            className="border-2 border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={item.price}
                            onChange={(e) => handleChange(index, 'price', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            className="border-2 border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={item.gst}
                            onChange={(e) => handleChange(index, 'gst', e.target.value)}
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          ₹{calculateAmount(item).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400">
                          <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='bg-blue-50 dark:bg-gray-700 p-2 text-left'>
                <div
                  onClick={handleAddItem}
                  className="mr-8 text-lg text-blue-600 dark:text-blue-400 hover:underline">
                  + Add another Item
                </div>
              </div>
            </div>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 w-full gap-2 sm:gap-6'>
              {/* Terms and conditions */}
              <div className="hidden sm:block max-w-[400px] mt-4 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                  />
                </div>
    
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Vendor Notes</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Thanks for your business."
                    value={vendorNotes}
                    onChange={(e) => setVendorNotes(e.target.value)}
                  />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>will be displayed on the Purchase Order</p>
              </div>
              
              {/* Final total Amount */}
              <div className="mt-6 min-h-[180px] p-4 text-sm sm:text-md shadow-lg border-1 border-gray-300 dark:border-gray-600 rounded-lg pt-4 text-right space-y-2 bg-white dark:bg-gray-800">
                <div className='flex justify-between text-gray-700 dark:text-gray-300'>
                  <span className="">Sub Total:</span> ₹{subTotal.toFixed(2)}
                </div>
                
                {/* CGST and SGST Section */}
                {Object.keys(gstBreakdown).length > 0 ? (
                  <>
                    {Object.entries(gstBreakdown).map(([rate, amounts]) => (
                      <React.Fragment key={rate}>
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>CGST ({rate/2}%):</span> ₹{amounts.cgst.toFixed(2)}
                        </div>
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>SGST ({rate/2}%):</span> ₹{amounts.sgst.toFixed(2)}
                        </div>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>GST:</span> ₹0.00
                  </div>
                )}
    
                <div className='flex flex-wrap justify-between text-gray-700 dark:text-gray-300'>
                  <span className="">Adjustment:</span>
                  <input
                    type="number"
                    autoComplete='off'
                    className="py-1 px-2 w-[80px] sm:w-[100px] border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value || 0)}
                  />
                </div>
                <div className='relative flex flex-wrap justify-between text-gray-700 dark:text-gray-300'>
                  <span className="">Discount(%):</span>
                  <input
                    type="text"
                    min="0"
                    max="100"
                    autoComplete='off'
                    className="py-1 px-2 pr-6 w-[80px] sm:w-[100px] border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={discount}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                      setDiscount(value);
                    }}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">%</span>
                </div>
                <hr className='border-2 border-gray-300 dark:border-gray-600'/>
                <div className="flex justify-between text-sm sm:text-lg font-medium text-gray-900 dark:text-white">
                  <span>Total:</span> ₹{total.toFixed(2)}
                </div>
              </div>
              
              {/* Mobile view terms and conditions */}
              <div className="sm:hidden mt-4 flex flex-col">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Vendor Notes</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Thanks for your business."
                    value={vendorNotes}
                    onChange={(e) => setVendorNotes(e.target.value)}
                  />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>will be displayed on the Purchase Order</p>
              </div>
            </div>
          </section>
    
          {/* Submit Button */}
          {submitError && (
            <div className="text-red-600 dark:text-red-400 mb-4 text-sm">
              {submitError}
            </div>
          )}
          <div className='w-full flex justify-end'>
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300">
              Create Purchase
            </button>
            <button
              type="button"
              className="ml-2 sm:ml-4 bg-gray-50 dark:bg-gray-700 border-1 border-gray-300 dark:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200 text-blue-600 dark:text-blue-400 font-medium py-2 px-4 rounded-md transition duration-300">
              Close
            </button>
          </div>
        </form>
      </div>
      
      {/* Create Vendor Modal */}
      {showCreateVendor && (
        <div className="absolute top-0 sm:left-20 lg:left-40 2xl:left-120 mt-4 border-2 border-blue-500 dark:border-blue-600 shadow-lg shadow-blue-300 dark:shadow-blue-900 rounded-md bg-white dark:bg-gray-800">
          <CreateVendor 
            onClose={() => setShowCreateVendor(false)}
            onSuccess={(newVendor) => {
              setVendors(prev => [...prev, newVendor]);
              setFilteredVendors(prev => [...prev, newVendor]);
              handleVendorSelect(newVendor);
            }}
          />
        </div>
      )}
      {/* Create Item Modal */}
      {showCreateItem && (
        <div className="absolute top-0 sm:left-20 lg:left-40 2xl:left-120 mt-4 border-2 border-blue-500 dark:border-blue-600 shadow-lg shadow-blue-300 dark:shadow-blue-900 rounded-md bg-white dark:bg-gray-800">
          <CreateItem 
            onClose={() => setShowCreateItem(false)}
            onSuccess={(newItem) => {
              const formattedItem = {
                id: newItem._id || newItem.id,
                name: newItem.name,
                quantity: Number(newItem.quantity) || 0,
                category: newItem.category || 'Uncategorized',
                sellingPrice: Number(newItem.sellingPrice || newItem.price || 0)
              };
              
              setStocks(prev => [...prev, formattedItem]);
              setFilteredStocks(prev => [...prev, formattedItem]);
              
              // Auto-select the newly created item in the first empty item field
              const firstEmptyItemIndex = items.findIndex(item => !item.selectedStock);
              if (firstEmptyItemIndex !== -1) {
                handleStockSelect(formattedItem, items[firstEmptyItemIndex].id);
              }
            }}
          />
        </div>
      )}
    </div>
  );
} 