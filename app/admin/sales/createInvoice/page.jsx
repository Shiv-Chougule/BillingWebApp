'use client';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import CreateCustomer from '../../../../components/customer/CreateCustomer';
import CreateItem from '../../../../components/stocks/CreateItem';
import { ChartNoAxesCombined, CircleUser, ChevronDown, X } from 'lucide-react';
import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

// Form validation schema
const formSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required')
});

const generateInvoiceNumber = () => {
 
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.getTime().toString().slice(-4);
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INV-${datePart}-${timePart}-${randomPart}`;
};
export default function AccountForm() {
  const [salesperson, setSalesperson] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [terms, setTerms] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [isPaymentModeOpen, setIsPaymentModeOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('');

  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);
  const [invoiceDate, setInvoiceDate] = useState(today.toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(oneMonthLater.toISOString().split("T")[0]);
  
  const [adjustment, setAdjustment] = useState(0);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [discount, setDiscount] = useState(0);
  const dropdownRefs = useRef([]);
  const inputRefs = useRef([]);
  const customerDropdownRef = useRef(null);
  const paymentStatusDropdownRef = useRef(null);
  const paymentModeDropdownRef = useRef(null);
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId'); 

  // Customer search dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Stocks search dropdown state
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchStockQuery, setSearchStockQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockName, setStockName] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);

  const [invalidFields, setInvalidFields] = useState(new Set());
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());

  const validateForm = () => {
    const requiredFields = {
      customer: selectedCustomer,
    };

   // Items state
   
    const newInvalidFields = new Set();
  
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value?.toString().trim()) {
        newInvalidFields.add(field);
      }
    });
  
    setInvalidFields(newInvalidFields);
    return newInvalidFields.size === 0;
  };

  // Items state - moved before handleClickOutside
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

// Then define handleClickOutside
const handleClickOutside = useCallback((event) => {
  // For customer dropdown
  if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
    setIsDropdownOpen(false);
  }

   // For payment status dropdown
   if (paymentStatusDropdownRef.current && !paymentStatusDropdownRef.current.contains(event.target)) {
    setIsPaymentStatusOpen(false);
  }

   // For payment mode dropdown
   if (paymentModeDropdownRef.current && !paymentModeDropdownRef.current.contains(event.target)) {
    setIsPaymentModeOpen(false);
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
)}
}, [items]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

   // Improved dropdown positioning effect
   useEffect(() => {
    const updateDropdownPositions = () => {
      items.forEach((item, index) => {
        if (item.isStockDropdownOpen && !item.selectedStock) {
          const inputEl = inputRefs.current[index];
          const dropdownEl = dropdownRefs.current[index];
          
          if (!inputEl || !dropdownEl) return;
          
          const inputRect = inputEl.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          // Calculate available space
          const spaceBelow = viewportHeight - inputRect.bottom;
          const spaceAbove = inputRect.top;
          
          // Set dropdown width (match input width)
          dropdownEl.style.width = `${inputRect.width}px`;
          
          // Position horizontally (align with input)
          let left = inputRect.left;
          if (left + inputRect.width > viewportWidth) {
            left = viewportWidth - inputRect.width - 16;
          }
          dropdownEl.style.left = `${left}px`;
          
          // Position vertically (prefer below, show above if not enough space)
          if (spaceBelow > 200 || spaceBelow > spaceAbove) {
            dropdownEl.style.top = `${inputRect.bottom + window.scrollY + 4}px`;
            dropdownEl.style.bottom = 'auto';
          } else {
            dropdownEl.style.top = 'auto';
            dropdownEl.style.bottom = `${viewportHeight - inputRect.top + window.scrollY + 4}px`;
          }
        }
      });
    };

    updateDropdownPositions();

    const handleScrollResize = () => {
      updateDropdownPositions();
    };

    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [items]);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/customers');
        
        let customerData = Array.isArray(response.data) 
          ? response.data 
          : response.data.customers || [];
        
        const formattedCustomers = customerData.map(item => ({
          _id: item._id,
          customerName: item.customerName,
          companyName: item.companyName,
          email: item.email,
          phone: item.phone
        }));
        
        setCustomers(formattedCustomers);
        setFilteredCustomers(formattedCustomers);

        // If customerId exists in URL, find and select that customer
        if (customerId) {
          const customerToSelect = formattedCustomers.find(
            customer => customer._id === customerId
          );
          if (customerToSelect) {
            setSelectedCustomer(customerToSelect);
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    fetchCustomers();
  }, [customerId]); 
  
  // Filter customers based on search query
  useEffect(() => {
    if (!Array.isArray(customers)) {
      console.error('Customers data is not an array:', customers);
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
      const nameMatch = customer.customerName?.toLowerCase().includes(searchTerm);
      const emailMatch = customer.email?.toLowerCase().includes(searchTerm);
      const phoneMatch = customer.phone?.includes(searchQuery);
      return nameMatch || emailMatch || phoneMatch;
    });
  
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
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
              price: stock.sellingPrice,
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
    
    // Ensure items have all required fields
    const itemsWithValidation = items.map(item => ({
      name: item.name || 'Unnamed Item', 
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      gst: Number(item.gst) || 0,
      amount: calculateAmount(item), // Ensure this is calculated
      discount: Number(item.discount) || 0,
      stockId: item.selectedStock?.id 
    }));
  
    // Calculate totalPaid based on payment status
    const totalPaid = paymentStatus === 'paid' ? total : 0;
  
    const invoiceData = {
      customer: selectedCustomer._id,
      invoiceNumber: invoiceNumber,
      salesperson: salesperson || '',
      orderNumber: orderNumber || '',
      subject: subject || '',
      paymentStatus: paymentStatus, // Use the paymentStatus state
      terms: terms || '',
      invoiceDate: new Date(invoiceDate), // Ensure Date object
      dueDate: new Date(dueDate), // Ensure Date object
      items: itemsWithValidation,
      subTotal: Number(subTotal),
      adjustment: Number(adjustment) || 0,
      discount: Number(discount) || 0,
      total: Number(total),
      totalPaid: Number(totalPaid), // Set based on payment status
    };
  
    try {
      // Send the invoice data to backend - backend will handle stock updates
      const response = await axios.post('/api/invoices', invoiceData);
      console.log('Invoice saved:', response.data);
      
      // If payment status is 'paid', automatically create a payment record
      if (paymentStatus === 'paid') {
        console.log('Payment status is paid, creating automatic payment...');
        await handlePaymentCreation(response.data, total, invoiceNumber, invoiceDate);
      }
      
      alert('Invoice submitted successfully and stock updated!');
  
      // Refresh stocks data to reflect the updated quantities
      const stocksResponse = await axios.get('/api/stocks');
      setStocks(stocksResponse.data.items || []);
      setFilteredStocks(stocksResponse.data.items || []);
      window.location.href = '/admin/sales';
    } catch (error) {
      console.error('Error submitting invoice:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to submit invoice');
    }
  };
  
  // Improved Payment creation function with better error handling
const handlePaymentCreation = async (invoiceData, totalAmount, invoiceNumber, invoiceDate) => {
  try {
    const customerName = selectedCustomer?.customerName || selectedCustomer?.name || 'Unknown Customer';
    
    const paymentData = {
      customerName: customerName,
      outstandingAmount: parseFloat(totalAmount),
      bankCharges: 0,
      paymentDate: invoiceDate,
      paymentMode: paymentMode || 'Cash',
      payment: `PAY-${Date.now()}`,
      referenceNumber: invoiceNumber || `REF-${Date.now()}`,
      notes: `${invoiceNumber}`,
      markedInvoices: [{
        invoiceId: invoiceData._id || invoiceData.id,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        originalAmount: parseFloat(totalAmount),
        amountPaid: parseFloat(totalAmount),
        remainingAmount: 0
      }],
      totalPaid: parseFloat(totalAmount)
    };

    console.log('Creating auto-payment with data:', paymentData);
    
    // Only create the payment record - no need to update invoice since it's already 'paid'
    const paymentResponse = await axios.post('/api/payments', paymentData);
    console.log('Payment submitted successfully:', paymentResponse.data);

    // REMOVE THIS REDUNDANT CALL - Invoice is already created as 'paid'
    // The error is happening here because the API expects { id: ... } not { invoiceId: ... }
    
    return paymentResponse.data;
    
  } catch (error) {
    console.error('Payment creation error:', error.response?.data || error.message);
    alert('Invoice created successfully! Payment record creation failed - please create payment manually.');
    return null;
  }
};

  const {
    register,
    formState: {  },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentStatus: 'Pending',
    }
  });

  // Update your item dropdown JSX
  const renderItemDropdown = (item, index) => {
    return (
      <div className="relative">
        {item.selectedStock ? (
          <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
            <span className="text-gray-900 dark:text-white">{item.selectedStock.name}</span>
            <button 
              type="button" 
              onClick={() => handleClearStockSelection(item.id)}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              autoComplete='off'
              value={searchStockQuery}
              onChange={(e) => {
                setSearchStockQuery(e.target.value);
                toggleStockDropdown(item.id, true);
              }}
              onFocus={() => toggleStockDropdown(item.id, true)}
              placeholder="Search or select Item"
              className='min-w-72 sm:w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
            />
            <button 
              type="button" 
              onClick={() => toggleStockDropdown(item.id)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              <ChevronDown size={20} />
            </button>
          </>
        )}
        
        {item.isStockDropdownOpen && !item.selectedStock && (
          <Portal>
            <div 
              ref={(el) => {
                if (el) {
                  dropdownRefs.current[index] = el;
                }
              }}
              className="fixed z-[1001] bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl"
            >
              <div className="max-h-60 overflow-auto hide-scrollbar">
                {filteredStocks.length > 0 ? (
                  <ul>
                    {filteredStocks.map((stock) => (
                      <li
                        key={stock.id}
                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white"
                        onClick={() => handleStockSelect(stock, item.id)}
                      >
                        <div>
                          <p className="font-medium">{stock.name}</p>
                          {stock.sellingPrice && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Price: ₹{stock.sellingPrice}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    No items found
                  </div>
                )}
              </div>
              <div 
                className="sticky bottom-0 px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-gray-600 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer rounded-b-md"
                onClick={() => {
                  setShowCreateItem(true);
                  toggleStockDropdown(item.id, false);
                }}
              >
                + Create new Item
              </div>
            </div>
          </Portal>
        )}
      </div>
    );
  };

  // Update your customer dropdown JSX
  const renderCustomerDropdown = () => {
    return (
      <div ref={customerDropdownRef} className=''>
        <label htmlFor="customer" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
          Customer Name <span className='text-red-600'>*</span>
        </label>
        <div className="relative">
          {selectedCustomer ? (
            <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
              <span className="text-gray-900 dark:text-white">{selectedCustomer.customerName}</span>
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
                id="customer"
                type="text"
                autoComplete='off'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search or select a Customer"
                className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  invalidFields.has('customer') 
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
          
          {isDropdownOpen && !selectedCustomer && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl flex flex-col max-h-60">
              <div className="overflow-y-auto flex-grow rounded-md hide-scrollbar">
                {filteredCustomers.length > 0 ? (
                  <ul>
                    {filteredCustomers.map((customer) => (
                      <li
                        key={customer._id}
                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <CircleUser size={16} className="text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium">{customer.customerName}</p>
                          {customer.companyName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{customer.companyName}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    No customers found
                  </div>
                )}
              </div>
              <div 
                className="sticky bottom-0 px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-gray-600 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer rounded-md"
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
      </div>
    );
  };

  const renderPaymentStatusDropdown = () => {
    return (
      <div ref={paymentStatusDropdownRef} className=''>
        <label htmlFor="paymentStatus" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Status <span className='text-red-600'>*</span>
        </label>
        <div className="relative">
          <div 
            className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 cursor-pointer"
            onClick={() => setIsPaymentStatusOpen(!isPaymentStatusOpen)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-gray-900 dark:text-white capitalize">{paymentStatus}</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-500 dark:text-gray-400 transition-transform ${
                isPaymentStatusOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
          
          {/* Dropdown Options */}
          {isPaymentStatusOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl">
              <div className="overflow-y-auto max-h-60 rounded-md hide-scrollbar">
                <ul>
                  <li
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600"
                    onClick={() => {
                      setPaymentStatus('pending');
                      setIsPaymentStatusOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="font-medium">Pending</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment not yet received</p>
                    </div>
                  </li>
                  <li
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 text-gray-900 dark:text-white"
                    onClick={() => {
                      setPaymentStatus('paid');
                      setIsPaymentStatusOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">Paid</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment received</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderPaymentModeDropdown = () => {
    if (paymentStatus !== 'paid') {
      return null; // Don't render if payment status is not 'paid'
    }
  
    return (
      <div  ref={paymentModeDropdownRef}  className=''>
        <label htmlFor="paymentMode" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Mode <span className='text-red-600'>*</span>
        </label>
        <div className="relative">
          <div 
            className="flex items-center justify-between w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 cursor-pointer"
            onClick={() => setIsPaymentModeOpen(!isPaymentModeOpen)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                paymentMode === 'Credit Card' ? 'bg-blue-500' :
                paymentMode === 'Bank Transfer' ? 'bg-purple-500' :
                paymentMode === 'Cash' ? 'bg-green-500' :
                paymentMode === 'UPI' ? 'bg-indigo-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-gray-900 dark:text-white">
                {paymentMode || 'Select payment mode'}
              </span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-500 dark:text-gray-400 transition-transform ${
                isPaymentModeOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
          
          {/* Dropdown Options */}
          {isPaymentModeOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-blue-500 dark:border-blue-600 rounded-md shadow-xl">
              <div className="overflow-y-auto max-h-60 rounded-md hide-scrollbar">
                <ul>
                  <li
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600"
                    onClick={() => {
                      setPaymentMode('Credit Card');
                      setIsPaymentModeOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pay with credit card</p>
                    </div>
                  </li>
                  <li
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600"
                    onClick={() => {
                      setPaymentMode('Bank Transfer');
                      setIsPaymentModeOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Direct bank transfer</p>
                    </div>
                  </li>
                  <li
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600"
                    onClick={() => {
                      setPaymentMode('Cash');
                      setIsPaymentModeOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">Cash</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pay with cash</p>
                    </div>
                  </li>
                  <li
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 text-gray-900 dark:text-white"
                    onClick={() => {
                      setPaymentMode('UPI');
                      setIsPaymentModeOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">UPI payment</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className='relative p-2 sm:p-6 bg-white dark:bg-gray-900'>
      <div className="my-6 max-w-6xl mx-auto p-2 sm:p-6 bg-white dark:bg-gray-800 border-1 rounded-lg shadow-md">
        <h1 className="mb-2 sm:mb-4 text-2xl font-bold text-gray-800 dark:text-white">Create Invoice</h1>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Business Information Section */}
          <section className="space-y-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
            <div className='w-full flex flex-col gap-2 sm:gap-8'>
              {renderCustomerDropdown()}
              
              <div className=''>
                <label htmlFor="invoiceNumber" className="block text-md font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Invoice Number <span className='text-red-600'>*</span>
                </label>
                <input
                  id="invoiceNumber"
                  type="text"
                  autoComplete='off'
                  value={invoiceNumber}
                  readOnly
                  className="w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>

               {/* Salesperson */}
               {/* <div className=''>
                <label htmlFor="salesperson" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salesperson <span className='text-red-600'>*</span>
                </label>
                <input
                  id="salesperson"
                  autoComplete='off'
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div> */}

              {/* Order Number */}
              {/* <div className=''>
                <label htmlFor="ordernumber" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Number
                </label>
                <input
                  id="ordernumber"
                  type="text"
                  autoComplete='off'
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    invalidFields.has('orderNumber') 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div> */}

              {/* Payment Status - Custom Styled Dropdown */}
              {renderPaymentStatusDropdown()}
              {renderPaymentModeDropdown()}
            </div>
            
            <div className='w-full flex flex-col gap-2 sm:gap-8'>
              
              {/* Invoice date */}
              <div className='w-full sm:mt-2'>
                <p className='text-md text-gray-700 dark:text-gray-300'>Invoice Date <span className='text-red-600'>*</span> </p>
                <input
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)} 
                  type="date"
                  autoComplete='off'
                  className="w-full text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              
              {/* Due date */}
              <div className='w-full'>
                <p className='text-md text-gray-700 dark:text-gray-300'>Due Date <span className='text-red-600'>*</span></p>
                <input
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  type="date"
                  autoComplete='off'
                  className="w-full text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
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
                  placeholder="let your customer know what this Invoice is about"
                  className="w-full px-4 py-2 border-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
             
              {/* Terms of Delivery */}
              {/* <div className=''>
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
              </div> */}
              
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
                        {renderItemDropdown(item, index)}
                        </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          min="1"
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
              <div className="sm:block max-w-[400px] mt-4 flex flex-col gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Customer Notes</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Thanks for your business."
                  />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>will be displayed on the Invoice</p>
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
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Customer Notes</label>
                  <textarea
                    autoComplete='off'
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Thanks for your business."
                  />
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>will be displayed on the Invoice</p>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className='w-full flex justify-end'>
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300">
              Create Invoice
            </button>
            <button
              type="button"
              className="ml-2 sm:ml-4 bg-gray-50 dark:bg-gray-700 border-1 border-gray-300 dark:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200 text-blue-600 dark:text-blue-400 font-medium py-2 px-4 rounded-md transition duration-300">
              Close
            </button>
          </div>
        </form>
      </div>
      
      {/* Create Customer Modal */}
      {showCreateCustomer && (
        <div className="absolute top-0 sm:left-20 lg:left-40 2xl:left-120 mt-4 border-2 border-blue-500 dark:border-blue-600 shadow-lg shadow-blue-300 dark:shadow-blue-900 rounded-md bg-white dark:bg-gray-800">
          <CreateCustomer 
            onClose={() => setShowCreateCustomer(false)}
            onSuccess={(newCustomer) => {
              setCustomers(prev => [...prev, newCustomer]);
              setFilteredCustomers(prev => [...prev, newCustomer]);
              handleCustomerSelect(newCustomer);
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