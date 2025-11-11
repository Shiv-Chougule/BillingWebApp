// components/PaymentFilterTable.jsx
import React, { useState } from "react";

export default function PaymentFilterTable() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="p-4 text-black">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select className="border rounded px-3 py-2">
        <option>This Month (Today)</option>
            <option>this week</option>
            <option>This Months</option>
            <option>This Quarter</option>
            <option>This year</option>
            <option>Yesterday</option>
            <option>Previous Week</option>
            <option>Previous Month</option>
            <option>Previous Quarter</option>
            <option>Previous Year</option>
            <option>Custom</option>
        </select>

        <select className="border rounded px-3 py-2">
          <option>Filter by Invoice</option>
          <option>Filter by Payment</option>
          <option>All</option>
        </select>

        <div className="flex items-center gap-2">
          <label>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <label>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left text-sm font-semibold">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 border-r border-gray-300">Date</th>
              <th className="px-4 py-2 border-r border-gray-300">Transaction Type</th>
              <th className="px-4 py-2 border-r border-gray-300">Transaction Details</th>
              <th className="px-4 py-2 border-r border-gray-300">Invoice Number</th>
              <th className="px-4 py-2 border-r border-gray-300">Invoice Amount</th>
              <th className="px-4 py-2">Payment Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">
                No payments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
