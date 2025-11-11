'use client';
import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { ScrollText, Plus } from 'lucide-react';

function Aside({products, productId, setProductId}) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    return ( 
      (product.name?.toLowerCase().includes(query)) ||
      (product.category?.toLowerCase().includes(query)) ||
      (product.HSNCode?.toLowerCase().includes(query)) ||
      (product.itemCode?.toLowerCase().includes(query)) ||
      (product.type?.toLowerCase().includes(query))
    );
  });

  // Scroll to active product when productId changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [productId]);

  return (
    <div className='relative h-full flex flex-col overflow-hidden col-span-3'>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700 space-x-2">
        <div className="w-full relative">
          <input 
            type="text" 
            placeholder="Search name, category, HSN code..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-2 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-blue-400 dark:border-blue-600 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Link href="/admin/stocks/createStock">
          <button className="h-10 w-10 flex justify-center items-center rounded-md text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer">
            <Plus/>
          </button>
        </Link>
      </div>
      
      {/* Scrolling section */}
      <div className='h-full w-full flex flex-col overflow-auto hide-scrollbar'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const isActive = product._id === productId;
            return (
              <div
                key={product._id}
                ref={isActive ? activeRef : null}
                onClick={() => setProductId(product._id)}
                className={`h-auto w-full py-2 flex justify-center cursor-pointer border-b border-gray-300 dark:border-gray-700 ${
                  isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-blue-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className='w-[50%] pl-4 space-y-1'>
                  <p className='text-black dark:text-white font-medium text-md'>{product.name}</p>
                  <p className='text-blue-800 dark:text-blue-300 text-sm'>Category: {product.category}</p>
                  <p className='text-black dark:text-white text-sm'>Price: ₹{product.sellingPrice}</p>
                  <p className='text-black dark:text-white text-sm'>Qty: {product.quantity}</p>
                </div>
                <div className='w-[50%]'>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>HSN: {product.HSNCode}</p>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Item Code: {product.itemCode}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No products found</p>
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