// hooks/useAdminData.js
import { useAdminData } from '../contexts/AdminDataContext';

export const useInvoices = () => {
  const { invoices, fetchInvoices, loading, errors } = useAdminData();
  return { 
    invoices, 
    refreshInvoices: fetchInvoices, 
    isLoading: loading.invoices, 
    error: errors.invoices 
  };
};

export const usePayments = () => {
  const { payments, fetchPayments, loading, errors } = useAdminData();
  return { 
    payments, 
    refreshPayments: fetchPayments, 
    isLoading: loading.payments, 
    error: errors.payments 
  };
};

export const useCustomers = () => {
  const { customers, fetchCustomers, loading, errors } = useAdminData();
  return { 
    customers, 
    refreshCustomers: fetchCustomers, 
    isLoading: loading.customers, 
    error: errors.customers 
  };
};

export const useStocks = () => {
  const { stocks, fetchStocks, loading, errors } = useAdminData();
  return { 
    stocks, 
    refreshStocks: fetchStocks, 
    isLoading: loading.stocks, 
    error: errors.stocks 
  };
};

export const usePurchase = () => {
  const { purchase, fetchPurchase, loading, errors } = useAdminData();
  return { 
    purchase, 
    refreshPurchase: fetchPurchase, 
    isLoading: loading.purchase, 
    error: errors.purchase 
  };
};

export const useVendor = () => {
  const { vendor, fetchVendor, loading, errors } = useAdminData();
  return { 
    vendor, 
    refreshVendor: fetchVendor, 
    isLoading: loading.vendor, 
    error: errors.vendor 
  };
};

export const useExpenses = () => {
  const { expenses, fetchExpenses, loading, errors } = useAdminData();
  return { 
    expenses, 
    refreshExpenses: fetchExpenses, 
    isLoading: loading.expenses, 
    error: errors.expenses 
  };
};

export const useBank = () => {
  const { bank, fetchBank, loading, errors } = useAdminData();
  return { 
    bank, 
    refreshBank: fetchBank, 
    isLoading: loading.bank, 
    error: errors.bank 
  };
};

// Optional: A hook that returns all data and functions
export const useAllAdminData = () => {
  const { 
    invoices, 
    payments, 
    customers, 
    stocks, 
    purchase, 
    vendor, 
    expenses, 
    bank,
    dark, // Make sure this is included
    fetchInvoices,
    fetchPayments,
    fetchCustomers,
    fetchStocks,
    fetchPurchase,
    fetchVendor,
    fetchExpenses,
    fetchBank,
    refreshAllData,
    loading,
    errors,
    isLoading,
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
    setTheme // Make sure this is included
  } = useAdminData();
  
  return {
    invoices, 
    payments, 
    customers, 
    stocks, 
    purchase, 
    vendor, 
    expenses, 
    bank,
    dark, // This should come from context
    fetchInvoices,
    fetchPayments,
    fetchCustomers,
    fetchStocks,
    fetchPurchase,
    fetchVendor,
    fetchExpenses,
    fetchBank,
    refreshAllData,
    loading,
    errors,
    isLoading: isLoading(),

    // FIX: These methods need to accept and pass the month parameter
    getTotalRevenue: (month = null) => getTotalRevenue(month),
    getReceivedAmount: (month = null) => getReceivedAmount(month),
    getDueAmount: (month = null) => getDueAmount(month),
    getTotalCustomers: (month = null) => getTotalCustomers(month),
    getTotalProducts,
    getTotalServices,
    getOutOfStockItems,
    getLowStockItems,
    getTotalVendors: (month = null) => getTotalVendors(month),
    getPendingInvoices: (month = null) => getPendingInvoices(month),
    getOverdueInvoices: (month = null) => getOverdueInvoices(month),
    getTotalExpenses: (month = null) => getTotalExpenses(month),
    getNetProfit: (month = null) => getNetProfit(month),
    getProfitMargin: (month = null) => getProfitMargin(month),
    setTheme
  };
};