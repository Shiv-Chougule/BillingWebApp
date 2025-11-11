"use client";

import { useState } from "react";

export default function OutstandingAmountSelector({
  enteredAmount,
  setEnteredAmount,
  updatedInvoices,
  setUpdatedInvoices,
  dropdownRef2,
  selectedCustomer,
  selectedInvoice,
  filteredInvoices,
  handleInvoiceSelect,
  onPay,
  onInvoicesUpdate
}) {
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [markedInvoices, setMarkedInvoices] = useState([]);
  const [adjustedInvoiceTotals, setAdjustedInvoiceTotals] = useState({});
  const [deductedFromInvoices, setDeductedFromInvoices] = useState({});
  const [hideUnchecked, setHideUnchecked] = useState(false);

  const handleCheckboxChange = (invoice) => {
    const invoiceId = invoice.id;
    const originalTotal = parseFloat(invoice.total);
    const currentAmount = parseFloat(outstandingAmount);

    const isMarked = markedInvoices.includes(invoiceId);

    if (isMarked) {
      // ✅ Uncheck logic
      const deducted = parseFloat(deductedFromInvoices[invoiceId]) || 0;

      setOutstandingAmount((currentAmount + deducted).toFixed(2));
      setMarkedInvoices((prev) => prev.filter((id) => id !== invoiceId));

      setAdjustedInvoiceTotals((prev) => {
        const updated = { ...prev };
        delete updated[invoiceId];
        return updated;
      });

      setDeductedFromInvoices((prev) => {
        const updated = { ...prev };
        delete updated[invoiceId];
        return updated;
      });

      // Show unchecked checkboxes when unchecking an invoice
      setHideUnchecked(false);
    } else {
      // ✅ Check logic
      let deductedAmount = 0;
      let newOutstanding = currentAmount;
      let newInvoiceTotal = originalTotal;

      if (originalTotal <= currentAmount) {
        // Full deduction
        deductedAmount = originalTotal;
        newOutstanding = currentAmount - originalTotal;
        newInvoiceTotal = originalTotal;
      } else {
        // Partial deduction
        deductedAmount = currentAmount;
        newOutstanding = 0;
        newInvoiceTotal = originalTotal - currentAmount;
      }

      setOutstandingAmount(newOutstanding.toFixed(2));
      setMarkedInvoices((prev) => [...prev, invoiceId]);
      setAdjustedInvoiceTotals((prev) => ({
        ...prev,
        [invoiceId]: newInvoiceTotal.toFixed(2),
      }));
      setDeductedFromInvoices((prev) => ({
        ...prev,
        [invoiceId]: deductedAmount.toFixed(2),
      }));

      // Hide unchecked checkboxes when outstanding reaches 0
      if (newOutstanding <= 0) {
        setHideUnchecked(true);
      }
    }
    // After updating state, prepare the updated invoices array
    const updated = markedInvoices.map(id => ({
      id,
      total: adjustedInvoiceTotals[id] || filteredInvoices.find(inv => inv.id === id)?.total
    }));

    // Call the parent's callback with the updated array
    if (onInvoicesUpdate) {
      onInvoicesUpdate(updated);
    }
  };

  const handlePay = () => {
    if (markedInvoices.length === 0) {
      alert("Please select at least one invoice");
      return;
    }
    
    // Prepare the array of updated invoices
    const paymentData = {
      enteredAmount: parseFloat(enteredAmount),
      updatedInvoices: markedInvoices.map(invoiceId => ({
        id: invoiceId,
        total: adjustedInvoiceTotals[invoiceId] || 
              filteredInvoices.find(inv => inv.id === invoiceId)?.total
      }))
    };

    // Send data to parent component
    if (onPay) {
      onPay(paymentData);
    }

    console.log("Payment data:", paymentData);
    
    
  };

  // Filter invoices based on hideUnchecked state
  const visibleInvoices = hideUnchecked 
    ? filteredInvoices.filter(invoice => markedInvoices.includes(invoice.id))
    : filteredInvoices;

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 text-sm sm:text-lg">
      {/* Outstanding Amount input field */}
      <div className="flex flex-col items-start gap-2 sm:gap-4 mb-4">
        <label htmlFor="outstandingAmount" className="font-medium text-gray-700">
          Outstanding Amount:
        </label>
        <input
          id="outstandingAmount"
          type="text"
          value={enteredAmount || ''}
          onChange={(e) => {
            setOutstandingAmount(e.target.value);
            setEnteredAmount(e.target.value);
            setMarkedInvoices([]);
            setAdjustedInvoiceTotals({});
            setDeductedFromInvoices({});
            setHideUnchecked(false);
            if (onInvoicesUpdate) {
              onInvoicesUpdate([]);
            }
          }}
          placeholder="Enter amount"
          className="border w-full rounded px-3 py-1"
        />
        <span className="font-semibold sm:text-xl text-blue-700">
          ₹{parseFloat(outstandingAmount || 0).toFixed(2)}
        </span>
      </div>

      {/* Invoice Table Display */}
      {!selectedInvoice && selectedCustomer && (
        <div
          ref={dropdownRef2}
          className=" h-full overflow-scroll border rounded-lg hide-scrollbar"
        >
          {visibleInvoices.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th className="hidden sm:table-cell px-4 py-2 text-left font-semibold text-gray-700">
                    Invoice Name
                  </th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Mark</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {visibleInvoices.map((invoice) => {
                  const invoiceId = invoice.id;
                  const isMarked = markedInvoices.includes(invoiceId);
                  const displayTotal =
                    invoiceId in adjustedInvoiceTotals
                      ? adjustedInvoiceTotals[invoiceId]
                      : invoice.total;

                  return (
                    <tr
                      key={invoiceId}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleInvoiceSelect(invoice)}
                    >
                      <td className="hidden sm:table-cell px-4 py-2 text-gray-800">{invoice.name}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        ₹{parseFloat(displayTotal).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={isMarked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleCheckboxChange(invoice)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-2 text-gray-500">
              {hideUnchecked 
                ? "All available invoices have been marked"
                : `No invoices found for <b>${selectedCustomer?.name}</b>`}
            </div>
          )}
        </div>
      )}
      
      {/* Buttons */}
      <div className="flex justify-end mt-6">
      
        <button
          onClick={handlePay}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={!enteredAmount || parseFloat(enteredAmount) <= 0}
        >
          Pay
        </button>
      </div>
    </div>
  );
}