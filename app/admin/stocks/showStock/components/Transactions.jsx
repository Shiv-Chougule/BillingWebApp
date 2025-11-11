'use client';

import { useState, useEffect } from 'react';

const Transactions = ({ stock }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState({
    sales: false,
    purchases: false
  });
  const [error, setError] = useState({
    sales: null,
    purchases: null
  });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(prev => ({ ...prev, sales: true }));
        setError(prev => ({ ...prev, sales: null }));
        
        // Fetch invoices that reference this stock ID
        const response = await fetch(`/api/invoices?stockId=${stock._id}`);
        if (!response.ok) throw new Error('Failed to fetch sales');
        
        const data = await response.json();
        // Extract items that match the stock ID from each invoice
        const salesWithStockItems = data.invoices?.flatMap(invoice => {
          const stockItems = invoice.items.filter(item => 
            item.stockId === stock._id || invoice.stock === stock._id
          );
          return stockItems.map(item => ({
            ...item,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            customerName: invoice.customer?.customerName || 
                         `${invoice.customer?.firstName} ${invoice.customer?.lastName}` || 
                         invoice.customer?.companyName || 'Unknown Customer',
            status: invoice.paymentStatus,
            date: invoice.invoiceDate
          }));
        }) || [];
        
        setSales(salesWithStockItems);
      } catch (err) {
        setError(prev => ({ ...prev, sales: err.message }));
        console.error('Error fetching sales:', err);
      } finally {
        setLoading(prev => ({ ...prev, sales: false }));
      }
    };

    const fetchPurchases = async () => {
      try {
        setLoading(prev => ({ ...prev, purchases: true }));
        setError(prev => ({ ...prev, purchases: null }));
        
        // Fetch purchases that reference this stock ID
        const response = await fetch(`/api/purchase?stockId=${stock._id}`);
        if (!response.ok) throw new Error('Failed to fetch purchases');
        
        const data = await response.json();
        // Extract items that match the stock ID from each purchase
        const purchasesWithStockItems = data.purchases?.flatMap(purchase => {
          const stockItems = purchase.items.filter(item => 
            item.itemId === stock._id || purchase.stock === stock._id
          );
          return stockItems.map(item => ({
            ...item,
            purchaseOrder: purchase.purchaseOrder,
            purchaseDate: purchase.purchaseDate,
            vendorName: purchase.vendor?.vendorName || 
                       purchase.vendor?.companyName || 
                       'Unknown Vendor',
            status: purchase.paymentStatus,
            date: purchase.purchaseDate
          }));
        }) || [];
        
        setPurchases(purchasesWithStockItems);
      } catch (err) {
        setError(prev => ({ ...prev, purchases: err.message }));
        console.error('Error fetching purchases:', err);
      } finally {
        setLoading(prev => ({ ...prev, purchases: false }));
      }
    };

    if (stock?._id) {
      fetchSales();
      fetchPurchases();
    }
  }, [stock._id]);

  const calculateSaleTotal = (sale) => {
    // Use the amount field if available, otherwise calculate from price and quantity
    if (sale.amount) return sale.amount;
    return (sale.price * sale.quantity).toFixed(2);
  };
  
  const calculatePurchaseTotal = (purchase) => {
    // Use the amount field if available, otherwise calculate from price and quantity
    if (purchase.amount) return purchase.amount;
    return (purchase.price * purchase.quantity).toFixed(2);
  };

  const renderContent = () => {
    if (activeTab === 'sales') {
      return (
        <>
          {loading.sales ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          ) : error.sales ? (
            <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded">
              Error loading sales: {error.sales}
            </div>
          ) : sales.length > 0 ? (
            <div className="relative h-[500px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-auto h-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
                  <thead className="bg-blue-100 dark:bg-blue-900/30 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Date</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Invoice No</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Customer</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Qty</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Price</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Total</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {sales.map((sale, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                          {sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{sale.invoiceNumber || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{sale.customerName || 'Unknown Customer'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{sale.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">₹{sale.price}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                          ₹{calculateSaleTotal(sale)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                            sale.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                            sale.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 
                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {sale.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded">No sales found for this item</p>
          )}
        </>
      );
    } else {
      return (
        <>
          {loading.purchases ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          ) : error.purchases ? (
            <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded">
              Error loading purchases: {error.purchases}
            </div>
          ) : purchases.length > 0 ? (
            <div className="relative h-[500px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-auto h-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
                  <thead className="bg-green-100 dark:bg-green-900/30 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Date</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">PO Number</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Supplier</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Qty</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Unit Cost</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Total</th>
                      <th className="px-4 py-2 font-medium text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {purchases.map((purchase, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                          {purchase.date ? new Date(purchase.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{purchase.purchaseOrder || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{purchase.vendorName || 'Unknown Vendor'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{purchase.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">₹{purchase.price}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                          ₹{calculatePurchaseTotal(purchase)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                            purchase.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                            purchase.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 
                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {purchase.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded">No purchases found for this item</p>
          )}
        </>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-sm p-4 max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Transaction History for {stock.name}</h2>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'sales' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('sales')}
        >
          Sales
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'purchases' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchases
        </button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default Transactions;