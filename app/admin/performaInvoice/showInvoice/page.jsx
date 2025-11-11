'use client';
import React, {useState, useEffect, useRef} from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import Aside from './components/Aside';
import Pdf from './components/Invoice';
import { Forward, FileText } from 'lucide-react';

function page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get('id'); 
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/performaInvoice');
        const data = await response.json();
        setInvoices(data?.invoices || []);
        
        // If no invoice is selected but we have invoices, redirect to first one
        if (!invoiceId && data?.invoices?.length > 0) {
          router.replace(`/admin/performaInvoice/showInvoice?id=${data.invoices[0]._id}`);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, [invoiceId, router]); 
  
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
    return <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
              <span className='text-sm sm:text-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
           </div>;
  }

  // Find the selected invoice by ID
  const selectedInvoice = invoices.find(inv => inv._id === invoiceId);

  return (
    <div className='border-t border-gray-300 dark:border-gray-700 w-full h-[92vh] lg:grid grid-cols-10 bg-white dark:bg-gray-900'>
      {/* Aside */}
      <div className='print:hidden h-full col-span-2 overflow-auto hide-scrollbar border-r border-gray-300 dark:border-gray-700'>
        <Aside 
          invoices={invoices} 
          invoiceId={invoiceId} 
          setInvoiceId={(id) => router.replace(`/admin/performaInvoice/showInvoice?id=${id}`)}
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
          {selectedInvoice ? (
            <Pdf invoices={invoices} invoiceID={invoiceId} />
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-500 dark:text-gray-400">Select an invoice to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default page;

 