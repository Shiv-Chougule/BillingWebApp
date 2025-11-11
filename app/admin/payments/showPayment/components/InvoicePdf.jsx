import React, {useState, useEffect} from "react";
import axios from 'axios';
import { toWords } from 'number-to-words';
import { Download, Printer } from 'lucide-react';

const PaymentPdf = ({payments, paymentID}) => {
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  
  useEffect(() => {
    if (payments && paymentID) {
      // Find payment - handle both object ID format and string ID
      const foundPayment = payments.find(pay => {
        const payId = pay._id?.['$oid'] || pay._id;
        return payId === paymentID;
      });
      setPayment(foundPayment);
    }
    setLoading(false);
  }, [payments, paymentID]);

  if (loading) {
    return <div className="text-center p-8">Loading payment details...</div>;
  }

  if (!payment) {
    return <div className="text-center p-8">No payment selected or payment not found</div>;
  }

  // Safe date formatting
  const formatDate = (dateString, options = {}) => {
    const {
      locale = 'en-GB', // Changed to UK locale for day/month/year
      separator = '/',
      fallback = 'N/A',
      allowInvalid = false,
      minDate = null,
      maxDate = null,
      includeTime = false,
      timeFormat = '24h' // '24h' or '12h'
    } = options;
  
    // 1. Input validation and filtering
    if (!dateString) return fallback;
    
    // Filter out non-string inputs (except Date objects and numbers)
    if (typeof dateString !== 'string' && 
        !(dateString instanceof Date) && 
        typeof dateString !== 'number') {
      console.warn('Invalid date input type:', typeof dateString);
      return fallback;
    }
  
    // Filter out empty strings and whitespace-only strings
    if (typeof dateString === 'string' && dateString.trim() === '') {
      return fallback;
    }
  
    // Filter out obviously invalid date strings
    if (typeof dateString === 'string') {
      const trimmedDate = dateString.trim();
      
      // Filter out common invalid patterns
      const invalidPatterns = [
        /^undefined$/i,
        /^null$/i,
        /^NaN$/i,
        /^Invalid Date$/i,
        /^\d{4}-\d{2}-\d{2}.*[a-zA-Z]{3,}.*$/ // Dates with text in middle
      ];
      
      if (invalidPatterns.some(pattern => pattern.test(trimmedDate))) {
        console.warn('Invalid date pattern:', trimmedDate);
        return fallback;
      }
  
      // Filter out incomplete dates
      if (trimmedDate.length < 6) { // Minimum: YY-MM-DD
        console.warn('Date string too short:', trimmedDate);
        return fallback;
      }
    }
  
    try {
      let date;
      
      // 2. Parse the date with different strategies
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'number') {
        // Filter out unrealistic timestamps
        if (dateString < 0 || dateString > 253402300799999) { // Year 9999
          console.warn('Unrealistic timestamp:', dateString);
          return fallback;
        }
        date = new Date(dateString);
      } else {
        // String parsing with multiple strategies
        const parsedDate = new Date(dateString);
        
        // Additional parsing for ISO-like strings without timezone
        if (isNaN(parsedDate.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          date = new Date(dateString + 'T00:00:00.000Z');
        } else {
          date = parsedDate;
        }
      }
  
      // 3. Date validity filtering
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date object');
      }
  
      // Filter out unrealistic dates (before 1900 or after 2100)
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) {
        console.warn('Date outside reasonable range:', year);
        if (!allowInvalid) return fallback;
      }
  
      // 4. Range filtering
      if (minDate) {
        const min = new Date(minDate);
        if (!isNaN(min.getTime()) && date < min) {
          console.warn('Date before minimum allowed:', date);
          return fallback;
        }
      }
  
      if (maxDate) {
        const max = new Date(maxDate);
        if (!isNaN(max.getTime()) && date > max) {
          console.warn('Date after maximum allowed:', date);
          return fallback;
        }
      }
  
      // 5. Format as day/month/year
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const yearFull = date.getFullYear();
  
      let formattedDate = `${day}${separator}${month}${separator}${yearFull}`;
  
      // 6. Add time if requested
      if (includeTime) {
        let hours = date.getHours();
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let seconds = String(date.getSeconds()).padStart(2, '0');
        
        let timeString;
        if (timeFormat === '12h') {
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12; // Convert 0 to 12 for 12h format
          timeString = `${hours}:${minutes} ${ampm}`;
        } else {
          hours = String(hours).padStart(2, '0');
          timeString = `${hours}:${minutes}:${seconds}`;
        }
        
        formattedDate += ` ${timeString}`;
      }
  
      return formattedDate;
  
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString);
      return fallback;
    }
  };
  
  // Alternative implementation using toLocaleDateString with UK locale
  const formatDateUK = (dateString, options = {}) => {
    const {
      separator = '/',
      fallback = 'N/A',
      includeTime = false
    } = options;
  
    if (!dateString) return fallback;
  
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return fallback;
      }
  
      // Use UK locale for day/month/year format
      let formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
      // Replace default separator if different one is requested
      if (separator !== '/') {
        formattedDate = formattedDate.replace(/\//g, separator);
      }
  
      if (includeTime) {
        const timeString = date.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        formattedDate += ` ${timeString}`;
      }
  
      return formattedDate;
  
    } catch (error) {
      console.error('Date formatting error:', error);
      return fallback;
    }
  };
  
  // Pre-configured formats for common use cases
  const DateFormats = {
    // Basic day/month/year formats
    dmy: (dateString, separator = '/') => 
      formatDate(dateString, { separator }),
    
    dmyDashed: (dateString) => 
      formatDate(dateString, { separator: '-' }),
    
    dmyDotted: (dateString) => 
      formatDate(dateString, { separator: '.' }),
    
    // With time
    dmyWithTime: (dateString, separator = '/') => 
      formatDate(dateString, { separator, includeTime: true }),
    
    dmyWith12hTime: (dateString, separator = '/') => 
      formatDate(dateString, { separator, includeTime: true, timeFormat: '12h' }),
    
    // UK locale-based formatting
    uk: (dateString) => formatDateUK(dateString),
    ukWithTime: (dateString) => formatDateUK(dateString, { includeTime: true })
  };
  
  
  // Helper function for relative dates
  const formatRelativeDate = (date) => {
    const now = new Date();
    const diffInMs = date - now;
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  
    if (Math.abs(diffInDays) === 0) {
      return 'Today';
    } else if (Math.abs(diffInDays) === 1) {
      return diffInDays > 0 ? 'Tomorrow' : 'Yesterday';
    } else if (Math.abs(diffInDays) < 7) {
      return `${Math.abs(diffInDays)} days ${diffInDays > 0 ? 'ahead' : 'ago'}`;
    } else if (Math.abs(diffInDays) < 30) {
      const weeks = Math.round(Math.abs(diffInDays) / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ${diffInDays > 0 ? 'ahead' : 'ago'}`;
    } else {
      return date.toLocaleDateString();
    }
  };
  

  // Safe amount formatting
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '0.00';
    const num = Number(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Safe amount in words conversion
  const getAmountInWords = (amount) => {
    try {
      const num = Number(amount);
      if (isNaN(num) || num === 0) return 'Zero';
      return toWords(num) + ' only';
    } catch (error) {
      console.error('Amount to words conversion error:', error);
      return 'Amount conversion failed';
    }
  };

  const amountInWords = getAmountInWords(payment.totalPaid);
  const paymentDate = formatDate(payment.paymentDate);
  
  // Calculate totals safely
  const totalPaid = payment.markedInvoices 
    ? payment.markedInvoices.reduce((sum, invoice) => sum + (Number(invoice.amountPaid) || 0), 0)
    : (Number(payment.totalPaid) || 0);

  return (
    <div className="w-full mx-auto bg-white shadow-md p-6 mt-10 text-gray-700">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold mt-8">Payment Receipt</h2>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Dell</h1>
          <p className="text-sm">Kora, Bengaluru , Karnataka</p>
          <p className="text-sm">[IND] - India - | admin@dell.com</p>
        </div>
      </div>
      
      <hr className="mb-4 border-2 border-gray-300" />
      
      <div className="flex justify-between text-sm my-6 flex-wrap gap-4">
        <div>
          <p className="flex flex-col gap-2">
            <span>Receipt No:</span>
            <span className="text-black font-medium">
              {payment.paymentNumber || 'N/A'}
            </span>
          </p>
        </div>
        <div>
          <p className="flex flex-col gap-2">
            <span>Customer:</span>
            <span className="text-black font-medium">
              {payment.customerName || payment.customer?.name || 'N/A'}
            </span>
          </p>
        </div>
        <div>
          <p className="flex flex-col gap-2">
            <span className="text-gray-800">Date:</span>
            <span className="text-black font-medium">{paymentDate}</span>
          </p>
        </div>
      </div>

      <div className="border border-gray-300 rounded">
        <div className="bg-gray-50 border-b border-gray-300 p-3 font-semibold">
          Payment Details
        </div>
        <div className="p-3 space-y-4 text-sm">
          <div className="flex justify-between">
            <span>Payment Mode</span>
            <span className="font-medium">{payment.paymentMode || 'N/A'}</span>
          </div>
         
          <div className="flex justify-between">
            <span>Amount Received</span>
            <span className="font-semibold">
              ₹ {formatAmount(payment.totalPaid)}
            </span>
          </div>
         
          <hr className="border-gray-300"/>
          <div className="flex justify-between mb-4 flex-wrap">
            <span>Amount in words:</span>
            <span className="italic text-right max-w-md">{amountInWords}</span>
          </div>
        </div>
      </div>

      {payment.markedInvoices && payment.markedInvoices.length > 0 && (
        <div className="border border-gray-300 rounded mt-6">
          <div className="bg-gray-50 border-b border-gray-300 p-3 font-semibold">
            Applied Invoices
          </div>
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-300"> 
                    <th className="text-left pb-2">Invoice No</th>
                    <th className="text-left pb-2">Date</th>
                    <th className="text-right pb-2">Total Amount</th>
                    <th className="text-right pb-2">Amount Paid</th>
                    <th className="text-right pb-2">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.markedInvoices.map((invoice, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3">
                        {invoice?.invoiceId?.invoiceNumber || payment.notes || 'N/A'}
                      </td>
                      <td className="py-3">
                        {invoice?.invoiceId?.invoiceDate 
                          ? formatDate(invoice.invoiceId.invoiceDate) 
                          : formatDate(payment?.paymentDate) || 'N/A'
                        }
                      </td>
                      <td className="text-right py-3">
                        ₹ {formatAmount(invoice.originalAmount)}
                      </td>
                      <td className="text-right py-3">
                        ₹ {formatAmount(invoice.amountPaid)}
                      </td>
                      <td className="text-right py-3">
                        ₹ {formatAmount(invoice.remainingAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-64 border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Paid:</span>
                  <span className="font-semibold">
                    ₹ {formatAmount(totalPaid)}
                  </span>
                </div>
                {payment.markedInvoices.some(inv => inv.remainingAmount > 0) && (
                  <div className="flex justify-between mt-1">
                    <span className="font-medium">Total Outstanding:</span>
                    <span className="font-semibold">
                      ₹ {formatAmount(payment.markedInvoices.reduce((sum, invoice) => 
                        sum + (Number(invoice.remainingAmount) || 0), 0))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-16 text-sm text-center flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <hr className="mb-2 border-1 border-gray-300" />
          <p className="font-medium">Authorized Signatory</p>
        </div>
        <div className="flex-1 min-w-[200px]">
          <hr className="mb-2 border-1 border-gray-300" />
          <p className="font-medium">Recipient's Signature</p>
        </div>
      </div>
      
      <hr className="border-gray-300 mt-8 mb-2"/>
      <p className="text-center text-xs text-gray-500">
        This is a computer generated receipt and does not require physical signature.
      </p>
      
      {payment.notes && (
        <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
          <p className="font-semibold mb-2">Notes:</p>
          <p className="text-sm"></p>
        </div>
      )}
    </div>
  );
};

export default PaymentPdf;