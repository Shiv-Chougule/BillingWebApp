'use client';
import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { ScrollText, Plus } from 'lucide-react';

function Aside({purchases, purchaseId, setPurchaseId}) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeRef = useRef(null);
 
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter purchases based on search query
  const filteredpurchases = purchases.filter(purchase => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const purchaseDateStr = new Date(purchase.purchaseDate).toLocaleDateString();
    const dueDateStr = purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString() : '';
    
    return (
      (purchase.purchaseNumber?.toLowerCase().includes(query)) ||
      (purchase.vendor?.vendorName?.toLowerCase().includes(query)) ||
      (purchase.vendorName?.toLowerCase().includes(query)) || // Fallback if not nested
      (purchase.vendor?.email?.toLowerCase().includes(query)) ||
      (purchase.email?.toLowerCase().includes(query)) || // Fallback if not nested
      (purchaseDateStr.includes(query)) ||
      (dueDateStr.includes(query)) ||
      (purchase.total?.toString().includes(query)) // Also search amount
    );
  });

  // Scroll to active purchase when purchaseId changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [purchaseId]);

  return (
    <div className='relative h-full flex flex-col overflow-hidden col-span-3'>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700 space-x-2">
        <div className="w-full relative">
          <input 
            type="text" 
            placeholder="Search name, date, purchaseNumber " 
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-2 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-blue-400 dark:border-blue-600 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Link href="/admin/purchase/createPurchase">
          <button className="h-10 w-10 flex justify-center items-center rounded-md text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer">
            <Plus/>
          </button>
        </Link>
      </div>
      
      {/* Scrolling section */}
      <div className='h-full w-full flex flex-col overflow-auto hide-scrollbar'>
        {filteredpurchases.length > 0 ? (
          filteredpurchases.map((purchase) => {
            const isActive = purchase._id === purchaseId;
            return (
              <div
                key={purchase._id}
                ref={isActive ? activeRef : null}
                onClick={() => setPurchaseId(purchase._id)}
                className={`h-auto w-full py-2 flex cursor-pointer border-b border-gray-300 dark:border-gray-700 ${
                  isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-blue-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className='w-16 flex justify-center items-center'>
                  <ScrollText className='text-blue-400 dark:text-blue-300' />
                </div>
                <div className='w-full pr-4 py-4 text-sm'>
                  <p className='text-black dark:text-white'>{purchase.vendor?.vendorName }</p>
                  <p className='text-blue-800 dark:text-blue-300'>{purchase.purchaseNumber}</p>
                  <p className='text-black dark:text-white'>Amount - {purchase.total}</p>
                  <p className='text-black dark:text-white'>{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                  {/* <p className='text-black dark:text-white'>Payment Status -  {purchase.paymentStatus || 'Draft'}</p> */}
                  {/* <div className='w-full h-8 my-2 flex space-x-4 justify-end'>
                  {purchase.paymentStatus?.toLowerCase() !== 'paid' && (
                    <button className='
                      px-3 py-1.5
                      rounded-lg
                      text-white
                      bg-blue-500 dark:bg-blue-600
                      shadow-lg
                      hover:scale-110
                      active:scale-92
                      transition-all
                      duration-200
                      transform
                      origin-center
                      border border-blue-500 dark:border-blue-700
                      hover:bg-blue-600 dark:hover:bg-blue-700
                      cursor-pointer
                    '>
                      Pay
                    </button>
                    )}
                  </div> */}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No purchases found</p>
            {searchQuery && (
              <p className="text-sm">for "{searchQuery}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Aside;