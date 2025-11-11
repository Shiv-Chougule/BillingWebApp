import { useState } from 'react';

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState('All');

  const invoices = [
    {
      id: 1,
      date: '24/03/2025',
      invoiceNumber: 'INV/2025/00001',
      orderNumber: '-',
      amount: '29.00',
      status: 'Not Valid/Draft'
    },
    {
      id: 2,
      date: '25/03/2025',
      invoiceNumber: 'INV/2025/00002',
      orderNumber: '1234',
      amount: '43.20',
      status: 'Not Valid/Draft'
    },
    {
      id: 3,
      date: '08/04/2025',
      invoiceNumber: 'INV/2025/00003',
      orderNumber: '-',
      amount: '89.00',
      status: 'Not Valid/Draft'
    }
  ];

  const filteredInvoices = statusFilter === 'All' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === statusFilter);

  return (
    <div className="container px-4 py-8 text-black">
      <div className="flex justify-between items-center mb-2">
        
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md flex items-center">
          <span>+</span>
          <span className="ml-1">New</span>
        </button>
      </div>
      <hr className='border-gray-300 my-2'/>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className='bg-blue-50'>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 font-semibold uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 font-semibold uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 font-semibold uppercase tracking-wider">Invoice Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 font-semibold uppercase tracking-wider">Order Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 font-semibold uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}