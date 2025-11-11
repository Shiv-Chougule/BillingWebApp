'use client';
import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { User, Plus } from 'lucide-react';

function Aside({vendors, vendorId, setVendorId}) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeRef = useRef(null);

  // Debug: Log vendors data to verify structure
  // useEffect(() => {
  //   console.log('vendors data:', vendors);
  // }, [vendors]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Enhanced filter function with better null checks
  const filteredvendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase().trim();
    
    // Safely check each field with proper null checks
    const fieldsToSearch = [
      vendor.vendorName || '',
      vendor.companyName || '',
      vendor.email || '',
      vendor.phone ? vendor.phone.replace(/\D/g, '') : ''
    ];
    
    return fieldsToSearch.some(field => 
      field.toLowerCase().includes(searchLower)
    );
  });

  // Rest of your component remains the same...
  // Scroll to active vendor when vendorId changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [vendorId]);

  return (
    <div className='relative h-full flex flex-col overflow-hidden col-span-3'>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700 space-x-2">
        <div className="w-full relative">
          <input 
            type="text" 
            placeholder="Search by name, company, email, or phone" 
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-2 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-blue-400 dark:border-blue-500 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Link href="/admin/vendor/createVendor">
          <button className="h-10 w-10 flex justify-center items-center rounded-md text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
            <Plus/>
          </button>
        </Link>
      </div>
      
      {/* Debug: Show search query */}
      {searchQuery && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 text-xs text-gray-900 dark:text-yellow-200">
          Searching for: "{searchQuery}" | Found: {filteredvendors.length} results
        </div>
      )}
      
      {/* Scrolling section */}
      <div className='h-full w-full flex flex-col overflow-auto hide-scrollbar'>
        {filteredvendors.length > 0 ? (
          filteredvendors.map((vendor) => {
            const isActive = vendor._id === vendorId;
            return (
              <div
                key={vendor._id}
                ref={isActive ? activeRef : null}
                onClick={() => setVendorId(vendor._id)}
                className={`h-auto w-full py-6 px-2 flex cursor-pointer border-b border-gray-300 dark:border-gray-700 ${
                  isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-blue-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className='w-16 flex justify-center items-center'>
                  <User className='text-blue-400 dark:text-blue-300' />
                </div>
                <div className='w-full pr-4'>
                  <p className='text-black dark:text-white text-md'>{vendor.vendorName || 'No name'}</p>
                  <p className='text-blue-800 dark:text-blue-300 text-sm'>{vendor.companyName || 'No company'}</p>
                  {vendor.email && <p className='text-gray-600 dark:text-gray-400 text-xs'>{vendor.email}</p>}
                  {vendor.phone && <p className='text-gray-600 dark:text-gray-400 text-xs'>{vendor.phone}</p>}
                </div>
                <span className='text-blue-500 dark:text-blue-400 mr-2'>Active</span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No vendors found</p>
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