'use client';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

const Overview = ({ stock }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-4xl mx-auto">
      <div className="flex justify-end items-start mb-4">
        <Link 
          href={`/admin/stocks/createStock?id=${stock._id}`}
          className="text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline"
        >
          <Pencil className="w-4 h-4 mr-1" />
          Edit Item
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-x-4">
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Item Name</dt>
            <dd className="text-gray-900 dark:text-white">{stock.name}</dd>
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Item Type</dt>
            <dd className="text-gray-900 dark:text-white">{stock.type || '—'}</dd>
          </div>
          <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-x-4">
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Item Code</dt>
            <dd className="text-gray-900 dark:text-white">{stock.itemCode || '—'}</dd>
            <dt className="font-semibold text-gray-700 dark:text-gray-300">HSN Code</dt>
            <dd className="text-gray-900 dark:text-white">{stock.HSNCode || '—'}</dd>
          </div>
          <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-x-4">
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Category</dt>
            <dd className="text-gray-900 dark:text-white">{stock.category || '—'}</dd>
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Account</dt>
            <dd className="text-gray-900 dark:text-white">{stock.account || '—'}</dd>
          </div>
          <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-x-4">
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Quantity</dt>
            <dd className="text-black dark:text-white font-semibold">{stock.quantity || '0'}</dd>
            <dt className="font-semibold text-gray-700 dark:text-gray-300">Selling Price</dt>
            <dd className="text-black dark:text-white font-semibold">
              {stock.sellingPrice ? `₹${stock.sellingPrice.toLocaleString()}` : '₹0.00'}
            </dd>
          </div>
          <div className="py-4 grid grid-cols-1 gap-x-4">
            <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Metadata</dt>
            <dd className="text-gray-500 dark:text-gray-400">
              Created: {new Date(stock.createdAt).toLocaleString()} | 
              Last Updated: {new Date(stock.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Overview;