import React, { useEffect, useState } from "react";
import Link from 'next/link';
export default function InvoicesTable({ vendor }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch(`/api/purchase?vendorId=${vendor._id}`); // or change backend to use 'vendor'
        
        if (!response.ok) throw new Error('Failed to fetch purchases');
        
        const result = await response.json(); 
        console.log('API response:', result);
        
        // Handle different response structures
        if (result.success) {
          // Check if data exists or use purchases array
          const purchasesData = result.data || result.purchases || [];
          setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
        
      } catch (err) {
        setError(err.message);
        setPurchases([]);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (vendor?._id) {
      fetchPurchases();
    }
  }, [vendor?._id]);

  if (loading) {
    return <div className="p-6 text-black dark:text-white">Loading invoices...</div>;
  }

  if (error) {
    return <div className="p-6 text-black dark:text-white text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="p-6 text-black dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Invoices of {vendor.vendorName}</h2>
        {/* <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Status: <strong>All</strong></span>
          <Link
            href={`/admin/purchase/createPurchase?vendorId=${vendor._id}`}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <span>New Purchase</span>
          </Link>
        </div> */}
      </div>

      {purchases.length === 0 ? (
        <div className="border border-gray-300 dark:border-gray-700 rounded p-4 text-center bg-white dark:bg-gray-900">
          No purchases found for this vendor
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-100 dark:bg-blue-900/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wider">#</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wider">PURCHASE DATE</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wider">DUE DATE</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wider">PURCHASE NUMBER</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wider">AMOUNT</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {purchases.map((purchase, index) => (
                <tr 
                  key={purchase._id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {new Date(purchase.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a 
                      href="#" 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline transition-colors duration-150"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add your click handler here
                        console.log('View purchase:', purchase._id);
                      }}
                    >
                      {purchase.purchaseOrder}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${purchase.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      purchase.paymentStatus === 'paid' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : purchase.paymentStatus === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

