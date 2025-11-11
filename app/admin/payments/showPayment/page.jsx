'use client';
import React, {useState, useEffect} from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import Aside from './components/Aside';
import Pdf from './components/InvoicePdf';
import { Forward, IndianRupee, FileText, ChartNoAxesCombined, CircleUser, ScrollText } from 'lucide-react';

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('id');
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        const data = await response.json();
        
        // Updated data extraction to match new API structure
        const paymentsData = data?.data || data?.payments || [];
        setPayments(paymentsData);

        // Extract and store invoice IDs
        const extractedInvoiceIds = paymentsData.flatMap(payment => 
          payment.markedInvoices
            ?.filter(invoice => invoice?.invoiceId) // Filter out null/undefined invoiceIds
            ?.map(invoice => {
              // Handle both string and ObjectId formats
              if (typeof invoice.invoiceId === 'string') {
                return invoice.invoiceId;
              } else if (invoice.invoiceId?._id) {
                return invoice.invoiceId._id;
              } else if (invoice.invoiceId?.$oid) {
                return invoice.invoiceId.$oid;
              }
              return null;
            }) 
            .filter(id => id !== null) || []
        );
        
        // Remove duplicates and store in invoices state
        const uniqueInvoiceIds = [...new Set(extractedInvoiceIds)];
        setInvoices(uniqueInvoiceIds);

        // If no payment is selected but we have payments, redirect to first one
        if (!paymentId && paymentsData.length > 0) {
          const firstPaymentId = paymentsData[0]._id || paymentsData[0]._id?.$oid;
          if (firstPaymentId) {
            router.replace(`/admin/payments/showPayment?id=${firstPaymentId}`);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setPayments([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [paymentId, router]);

  const handlePrint = () => {
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.print();
    setTimeout(() => {
      document.body.style.overflow = originalBodyOverflow;
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <span className='text-sm sm:text-lg md:text-[60px] font-bold text-blue-500 dark:text-blue-400'>Loading...</span>
      </div>
    );
  }
  
  // Find the selected payment by ID - handle both object and string IDs
  const selectedPayment = payments.find(payment => {
    const paymentIdValue = payment._id?._id || payment._id?.$oid || payment._id;
    return paymentIdValue === paymentId;
  });
  
  return (
    <div className='border-t border-gray-300 dark:border-gray-700 w-full h-[92vh] lg:grid grid-cols-10 bg-white dark:bg-gray-900'>
      {/* Aside */}
      <div className='print:hidden h-full hidden sm:block col-span-2 overflow-auto hide-scrollbar border-r border-gray-300 dark:border-gray-700'>
        <Aside 
          payments={payments} 
          paymentId={paymentId} 
          setPaymentId={(id) => router.replace(`/admin/payments/showPayment?id=${id}`)}
        />
      </div>
      
      {/* Main */}
      <div className='w-full h-full col-span-8 border-b-gray-300 dark:border-b-gray-700 overflow-auto'>
        <div className='print:hidden sticky top-0 z-10 bg-white dark:bg-gray-900'>
          <div className='h-10 w-full text-black dark:text-white text-sm flex justify-start border-b border-gray-300 dark:border-gray-700'>
            <div className='p-2 flex justify-between items-center gap-1 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white border-l border-r border-gray-300 dark:border-gray-600'>
              <button 
                onClick={handlePrint}
                className='p-2 flex justify-between items-center gap-1 cursor-pointer'
              >
                <FileText size={16} /><span>PDF</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className='p-6 bg-gray-100 dark:bg-gray-800 flex justify-center items-center'>
          {selectedPayment ? (
            <Pdf payments={payments} paymentID={paymentId} />
          ) : (
            <div className="text-center p-8">
              <p className="text-lg text-gray-500 dark:text-gray-400">Select a payment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;