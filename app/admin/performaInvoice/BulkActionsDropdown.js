'use client';
import React from 'react';
import axios from 'axios';
import { ArrowUpDown} from 'lucide-react';

const BulkActionsDropdown = ({ selectedInvoices }) => {
  console.log('Selected Invoice Objects:', selectedInvoices);

  const handleSubmit = async () => {
    try {
      // Process each selected invoice
      const invoicePromises = selectedInvoices.map(async (invoice) => {
        // Prepare items data
        const itemsWithValidation = invoice.items.map(item => ({
          name: item.name || 'Unnamed Item',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          gst: Number(item.gst) || 0,
          amount: (Number(item.quantity) || 1) * (Number(item.price) || 0),
          discount: Number(item.discount) || 0
        }));

        // Prepare invoice data
        const invoiceData = {
          customer: invoice.customer?._id || invoice.customer,
          invoiceNumber: invoice.invoiceNumber,
          salesperson: invoice.salesperson || '',
          orderNumber: invoice.orderNumber || '',
          subject: invoice.subject || '',
          paymentStatus: "pending",
          terms: invoice.terms || '',
          invoiceDate: new Date(invoice.invoiceDate),
          dueDate: new Date(invoice.dueDate),
          items: itemsWithValidation,
          subTotal: Number(invoice.subTotal) || 0,
          adjustment: Number(invoice.adjustment) || 0,
          discount: Number(invoice.discount) || 0,
          total: Number(invoice.total) || 0,
          totalPaid: 0,
          convertedFromPerforma: invoice._id // Track which performa invoice this came from
        };

        // Submit to API
        return axios.post('/api/invoices', invoiceData);
      });

      // Execute all requests
      const responses = await Promise.all(invoicePromises);
      console.log('All invoices submitted:', responses.map(r => r.data));
      
      alert(`${selectedInvoices.length} invoices converted to sales successfully!`);
      // You might want to refresh the page or parent component here
      
    } catch (error) {
      console.error('Error submitting invoices:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to submit invoices');
    }
  };

  return (
    <div className="relative inline-block text-left">
        <button 
          onClick={handleSubmit}
          className="p-1 text-gray-500 hover:text-green-500 relative group"
          aria-label="Convert to Sales"
        >
          <ArrowUpDown size={20} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Convert to Sales
          </span>
        </button>
    </div>
  );
};

export default BulkActionsDropdown;