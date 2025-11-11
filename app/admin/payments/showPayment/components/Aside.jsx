'use client';
import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { ScrollText, Plus } from 'lucide-react';

function Aside({payments, paymentId, setPaymentId}) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter payments based on search query 
  const filteredpayments = payments.filter(payment => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Check customer name
    const customerNameMatch = (payment.customerName || '').toLowerCase().includes(searchLower);
    
    // Check payment number
    const paymentNumberMatch = (payment.paymentNumber || '').toLowerCase().includes(searchLower);
    
    // Check payment date
    const paymentDate = new Date(payment.paymentDate);
    const formattedDate = paymentDate.toLocaleDateString().toLowerCase();
    const dateMatch = formattedDate.includes(searchLower);
    
    // Check total paid amount
    const totalPaidMatch = (payment.outstandingAmount?.toString() || '').includes(searchLower);
    
    return customerNameMatch || paymentNumberMatch || dateMatch || totalPaidMatch;
  });

  // Scroll to active payment when paymentId changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [paymentId]);

  const getTotalRowCount = () => {
    return payments.length;
  };
      
  return (
    <div className='relative h-full flex flex-col overflow-hidden col-span-3'>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700 space-x-2">
        <div className="w-full relative">
          <input 
            type="text" 
            placeholder="Search by name,date,amount,payment-No " 
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-2 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-blue-400 dark:border-blue-600 rounded-md text-sm sm:text-md w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Link href="/admin/payments/updatePayment">
          <button className="h-10 w-10 flex justify-center items-center rounded-md text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
            <Plus/>
          </button>
        </Link>
      </div>
      
      {/* Scrolling section */}
      <div className='h-full w-full flex flex-col overflow-auto hide-scrollbar'>
        {filteredpayments.length > 0 ? (
          filteredpayments.map((payment) => {
            const isActive = payment._id === paymentId;
            return (
              <div
                key={payment._id}
                ref={isActive ? activeRef : null}
                onClick={() => setPaymentId(payment._id)}
                className={`h-auto w-full py-2 flex cursor-pointer border-b border-gray-300 dark:border-gray-700 ${
                  isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-blue-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className='w-16 flex justify-center items-center'>
                  <ScrollText className='text-blue-400 dark:text-blue-300' />
                </div>
                <div className='w-full pr-4 text-sm'>
                  <p className='text-black dark:text-white'>{payment.customerName}</p>
                  <p className='text-blue-800 dark:text-blue-300'>{payment.paymentNumber}</p>
                  <p className='text-black dark:text-white'>Paid Amount - {payment.totalPaid}</p>
                  <p className='text-black dark:text-white'>{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  <div className='w-full h-8 my-2 flex space-x-4 justify-end'>
                    <button className='
                      px-3 py-1.5
                      rounded-lg
                      shadow-lg
                      hover:scale-110
                      active:scale-92
                      transition-all
                      duration-200
                      transform
                      origin-center
                      border border-blue-500 dark:border-blue-400
                      text-gray-900 dark:text-white
                      bg-white dark:bg-gray-800
                      hover:bg-gray-50 dark:hover:bg-gray-700
                    '>
                      Draft
                    </button>
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
                    '>
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No payments found</p>
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