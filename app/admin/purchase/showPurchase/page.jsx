'use client';
import React, {useState, useEffect} from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import Aside from './components/Aside';
import Pdf from './components/Invoice';
import { Forward, FileText } from 'lucide-react';

function page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const purchaseId = searchParams.get('id');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        
        const response = await fetch('/api/purchase');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle both response formats
        const purchasesData = data.data || data.purchases || [];
        setPurchases(purchasesData);
        
        if (!purchaseId && purchasesData.length > 0) {
          router.replace(`/admin/purchase/showPurchase?id=${purchasesData[0]._id}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPurchases();
  }, [purchaseId, router]); 
  
  const handlePrint = () => {
    // Store original body overflow style
    const originalBodyOverflow = document.body.style.overflow;
    
    // Temporarily hide scrollbars for printing 
    document.body.style.overflow = 'hidden';
    
    // Trigger print
    window.print();
    
    // Restore original body overflow style after a short delay
    setTimeout(() => {
      document.body.style.overflow = originalBodyOverflow;
    }, 500);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
              <span className='textext-sm sm:t-lg md:text-[60px] font-bold text-blue-500'>Loading...</span>
           </div>;
  }

  // Find the selected purchase by ID
  const selectedpurchase = purchases.find(inv => inv._id === purchaseId);

  return (
    <div className='border-t border-gray-300 dark:border-gray-700 w-full h-[92vh] lg:grid grid-cols-10 bg-white dark:bg-gray-900'>
      {/* Aside */}
      <div className='print:hidden h-full col-span-2 overflow-auto hide-scrollbar border-r border-gray-300 dark:border-gray-700'>
        <Aside 
          purchases={purchases} 
          purchaseId={purchaseId} 
          setPurchaseId={(id) => router.replace(`/admin/purchase/showPurchase?id=${id}`)}
        />
      </div>
      
      {/* Main */}
      <div className='w-full h-full col-span-8 border-b-gray-300 dark:border-b-gray-700 bg-gray-100 dark:bg-gray-800'>
        <div className='print:hidden h-10 w-full text-black dark:text-white text-sm flex justify-start border-b border-gray-300 dark:border-gray-700'>
          <div className='p-2 flex justify-between items-center gap-1 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white border-l border-r border-gray-300 dark:border-gray-600'>
            <button 
              onClick={handlePrint}
              className='p-2 flex justify-between items-center gap-1 cursor-pointer'
            >
              <FileText size={16} /><span>PDF</span>
            </button>
          </div>
        </div>
        <div className='p-6 bg-gray-100 dark:bg-gray-800 flex justify-center items-center'>
          {selectedpurchase ? (
            <Pdf purchases={purchases} purchaseID={purchaseId} />
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-500 dark:text-gray-400">Select a purchase to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default page;

 