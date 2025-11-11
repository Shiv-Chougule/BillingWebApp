'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminDataContext = createContext();

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}

export function AdminDataProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [purchase, setPurchase] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    
    if (savedTheme) {
      // Use saved theme preference
      setDark(savedTheme === 'dark');
    } else {
      // Or detect system preference if no saved preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(systemPrefersDark);
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin-theme', dark ? 'dark' : 'light');
    
    // Optional: Apply theme class to document root for global CSS control
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const setTheme = (theme = null) => {
    if (theme === 'dark' || theme === 'light') {
      setDark(theme === 'dark');
    } else {
      // Toggle if no specific theme provided
      setDark(prev => !prev);
    }
  };

  // Individual fetch functions for each endpoint
  const fetchInvoices = async () => {
    const key = 'invoices';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/invoices');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch invoices');
      }
      
      let invoicesData = [];
      
      if (Array.isArray(data)) {
        invoicesData = data;
      } else if (data.invoices) {
        invoicesData = data.invoices;
      } else if (Array.isArray(data.data)) {
        invoicesData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        invoicesData = data.data;
      } else {
        invoicesData = data;
      }
      
      setInvoices(invoicesData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setInvoices([]);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };


  const fetchPayments = async () => {
    const key = 'payments';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/payments');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch payments');
      }
      
      let paymentsData = [];
      
      // Standardized data extraction like other methods
      if (Array.isArray(data)) {
        paymentsData = data;
      } else if (Array.isArray(data.payments)) {
        paymentsData = data.payments;
      } else if (Array.isArray(data.data)) {
        paymentsData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        paymentsData = data.data;
      } else if (typeof data === 'object' && data !== null) {
        // If it's a single object, wrap it in an array
        paymentsData = [data];
      } else {
        paymentsData = [];
      }
      
      setPayments(paymentsData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setPayments([]); // Always set to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Enhanced fetchPurchase with better debugging
  const fetchPurchase = async () => {
    const key = 'purchase';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/purchase');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw purchase API response:", data);
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch purchase');
      }
      
      let purchaseData = [];
      
      // More robust data extraction
      if (Array.isArray(data)) {
        purchaseData = data;
      } else if (Array.isArray(data.purchases)) {
        purchaseData = data.purchases;
      } else if (Array.isArray(data.data)) {
        purchaseData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        purchaseData = data.data;
      } else if (typeof data === 'object' && data !== null) {
        // If it's a single object, wrap it in an array
        purchaseData = [data];
      } else {
        purchaseData = [];
      }
      
      console.log("Processed purchase data:", purchaseData);
      setPurchase(purchaseData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching purchase:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setPurchase([]); // Always set to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchCustomers = async () => {
    const key = 'customers';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/customers');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch customers');
      }
      
      let customersData = [];
      
      if (Array.isArray(data)) {
        customersData = data;
      } else if (data.customers) {
        customersData = data.customers;
      } else if (Array.isArray(data.data)) {
        customersData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        customersData = data.data;
      } else {
        customersData = data;
      }
      
      setCustomers(customersData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setCustomers([]);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchStocks = async () => {
    const key = 'stocks';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/stocks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch stocks');
      }
      
      let stocksData = [];
      
      if (Array.isArray(data)) {
        stocksData = data;
      } else if (data.items) {
        stocksData = data.items;
      } else if (Array.isArray(data.data)) {
        stocksData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        stocksData = data.data;
      } else {
        stocksData = data;
      }
      
      setStocks(stocksData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setStocks([]);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // const fetchPurchase = async () => {
  //   const key = 'purchase';
  //   setLoading(prev => ({ ...prev, [key]: true }));
    
  //   try {
  //     const response = await fetch('/api/purchase');
      
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
      
  //     const data = await response.json();
  //     console.log("Fetched purchases:", data);
  //     if (data && (data.error || data.success === false)) {
  //       throw new Error(data.error || data.message || 'Failed to fetch purchase');
  //     }
      
  //     let purchaseData = [];
      
  //     if (Array.isArray(data)) {
  //       purchaseData = data;
  //     } else if (Array.isArray(data.data)) {
  //       purchaseData = data.data;
  //     } else if (data.success && Array.isArray(data.data)) {
  //       purchaseData = data.data;
  //     } else {
  //       purchaseData = data;
  //     }
      
  //     setPurchase(purchaseData);
  //     setErrors(prev => ({ ...prev, [key]: null }));
      
  //   } catch (error) {
  //     console.error('Error fetching purchase:', error);
  //     setErrors(prev => ({ ...prev, [key]: error.message }));
  //     setPurchase([]);
  //   } finally {
  //     setLoading(prev => ({ ...prev, [key]: false }));
  //   }
  // };

  const fetchVendor = async () => {
    const key = 'vendor';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/vendor');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch vendor');
      }
      
      let vendorData = [];
      
      if (Array.isArray(data)) {
        vendorData = data;
      } else if (data.vendors) {
        vendorData = data.vendors;
      } else if (Array.isArray(data.data)) {
        vendorData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        vendorData = data.data;
      } else {
        vendorData = data;
      }
      
      setVendor(vendorData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching vendor:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setVendor([]);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchExpenses = async () => {
    const key = 'expenses';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch expenses');
      }
      
      let expensesData = [];
      
      if (Array.isArray(data)) {
        expensesData = data;
      } else if (Array.isArray(data.data)) {
        expensesData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        expensesData = data.data;
      } else {
        expensesData = data;
      }
      
      setExpenses(expensesData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setExpenses([]);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchBank = async () => {
    const key = 'bank';
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch('/api/bank');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || data.message || 'Failed to fetch bank');
      }
      
      let bankData = [];
      
      if (Array.isArray(data)) {
        bankData = data;
      } else if (Array.isArray(data.data)) {
        bankData = data.data;
      } else if (data.success && Array.isArray(data.data)) {
        bankData = data.data;
      } else {
        bankData = data;
      }
      
      setBank(bankData);
      setErrors(prev => ({ ...prev, [key]: null }));
      
    } catch (error) {
      console.error('Error fetching bank:', error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      setBank([]);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Refresh all data
  const refreshAllData = () => {
    fetchInvoices();
    fetchPayments();
    fetchCustomers();
    fetchStocks();
    fetchPurchase();
    fetchVendor();
    fetchExpenses();
    fetchBank();
  };

  // Load initial data
  useEffect(() => {
    refreshAllData();
  }, []); // Load all data initially

  // Add this helper function near the top of your calculation functions section
  const isDateInMonth = (dateString, targetMonth) => {
    // Handle null/undefined cases
    if (targetMonth === null || targetMonth === undefined) return true;
    if (!dateString) return false;
    
    // Ensure targetMonth is a number
    const monthNumber = Number(targetMonth);
    if (isNaN(monthNumber)) return true; // If month is invalid, don't filter
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      return date.getMonth() === monthNumber;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return false;
    }
  };

  // Calculation helper functions

// Add this debugging version of one function to test
const getTotalRevenue = (month = null) => {
 // console.log('🔍 getTotalRevenue called with month:', month, 'type:', typeof month);
  
  let filteredInvoices = invoices;
  //let month = parseInt(month);

  if (month !== null && month !== '') {
    //console.log('📅 Filtering invoices for month:', month);
    filteredInvoices = invoices.filter(invoice => {
      const isInMonth = isDateInMonth(invoice?.invoiceDate, month);
     // console.log(`📊 Invoice date: ${invoice?.date}, in target month ${month}:`, isInMonth);
      return isInMonth;
    });
    //console.log(`✅ After filtering: ${filteredInvoices.length} invoices for month ${month}`);
  } else {
    //console.log('🌍 No month filter applied, using all invoices:', invoices.length);
  }
  
  const result = filteredInvoices.reduce((sum, invoice) => sum + (invoice?.total || 0), 0);
 //console.log(`💰 Total revenue result: ${result}`);
  return result;
};

  const getReceivedAmount = (month = null) => {
    let filteredPayments = payments;
    
    if (month !== null && month !== '') {
      filteredPayments = payments.filter(payment => isDateInMonth(payment?.paymentDate, month));
    }
    
    return filteredPayments.reduce((sum, payment) => sum + (payment?.totalPaid || 0), 0);
  };

  const getDueAmount = (month = null) => {
    let filteredInvoices = invoices;
    
    if (month !== null && month !== '') {
      filteredInvoices = invoices.filter(invoice => isDateInMonth(invoice?.invoiceDate, month));
    }
    
    return filteredInvoices
      .filter(inv => inv && inv?.total !== inv?.totalPaid)
      .reduce((sum, inv) => {
        const total = inv?.total || 0;
        const totalPaid = inv?.totalPaid || 0;
        const dueAmount = total - totalPaid;
        return sum + dueAmount;
      }, 0);
  };

  const getPendingInvoices = (month = null) => {
    let filteredInvoices = invoices;
    
    if (month !== null && month !== '') {
      filteredInvoices = invoices.filter(invoice => isDateInMonth(invoice?.invoiceDate, month));
    }
    
    return filteredInvoices.filter(inv => {
      return inv?.total !== inv?.totalPaid;
    }).length;
  };

  const getTotalExpenses = (month = null) => {
    let filteredExpenses = expenses;
    
    if (month !== null && month !== '') {
      filteredExpenses = expenses.filter(expense => isDateInMonth(expense?.date, month));
    }
    
    return filteredExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0);
  };

  const getNetProfit = (month = null) => {
    return getTotalRevenue(month) - getTotalExpenses(month);
  };

  const getProfitMargin = (month = null) => {
    const revenue = getTotalRevenue(month);
    if (revenue === 0) return 0;
    return Number(((getNetProfit(month) / revenue) * 100).toFixed(2));
  };

  const getOverdueInvoices = (month = null) => {
    let filteredInvoices = invoices;
    
    if (month !== null) {
      filteredInvoices = invoices.filter(invoice => 
        isDateInMonth(invoice?.date, month)
      );
    }
    
    return filteredInvoices.filter(inv => inv?.status === 'overdue').length;
  };

  const getTotalCustomers = (month = null) => {
    return customers?.length || 0;
  };

  const getTotalVendors = (month = null) => {
    return vendor?.length || 0;
  };

  
  const getTotalProducts = () => {
    return stocks.filter(item => item?.category === 'product').length;
  };

  const getTotalServices = () => {
    return stocks.filter(item => item?.category === 'services').length;
  };

  const getOutOfStockItems = () => {
    return stocks.filter(item => item?.quantity <= 0).length;
  };

  const getLowStockItems = () => {
    return stocks.filter(item => item?.quantity > 0 && item?.quantity <= 10).length;
  };


 




  // const setTheme = (theme = null) => {
   
  //     setDark(!dark);
    
  // };

  const value = {
    // Data
    invoices,
    payments,
    customers,
    stocks,
    purchase,
    vendor,
    expenses,
    bank,
    dark,
    setTheme,
    // Loading states
    loading,
    
    // Errors
    errors,
    
    // Fetch functions
    fetchInvoices,
    fetchPayments,
    fetchCustomers,
    fetchStocks,
    fetchPurchase,
    fetchVendor,
    fetchExpenses,
    fetchBank,
    refreshAllData,
    
    // Helper function to check if any data is loading
    isLoading: () => Object.values(loading).some(status => status === true),
    
    // Calculation functions
    getTotalRevenue,
    getReceivedAmount,
    getDueAmount,
    getTotalCustomers,
    getTotalProducts,
    getTotalServices,
    getOutOfStockItems,
    getLowStockItems,
    getTotalVendors,
    getPendingInvoices,
    getOverdueInvoices,
    getTotalExpenses,
    getNetProfit,
    getProfitMargin,
    setTheme
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}