import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Circle, Clock, X, AlertTriangle, DollarSign } from 'lucide-react';

const MarkAs = ({ selectedInvoices, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusOptions = [
    { value: 'paid', label: 'Mark as Paid', icon: <DollarSign size={16} className="mr-2 text-green-500" /> },
    { value: 'pending', label: 'Mark as Pending', icon: <Clock size={16} className="mr-2 text-yellow-500" /> },
    { value: 'overdue', label: 'Mark as Overdue', icon: <AlertTriangle size={16} className="mr-2 text-orange-500" /> },
    { value: 'cancelled', label: 'Mark as Cancelled', icon: <X size={16} className="mr-2 text-red-500" /> }
  ];

  const toggleDropdown = () => {
    if (selectedInvoices.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleStatusSelect = (status) => {
    if (selectedInvoices.length > 0) {
      onStatusChange(status, selectedInvoices);
    }
    setIsOpen(false);
  };
  useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        className={`inline-flex items-center justify-between px-4 py-2.5 w-46 bg-white border ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
        } rounded-lg shadow-sm transition-all duration-150 ${
          selectedInvoices.length === 0 ? 'opacity-80 cursor-not-allowed' : 'border-blue-500 ring-2 ring-blue-500'
        }`}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={selectedInvoices.length === 0}
      >
        <div className="flex items-center">
          <Circle size={16} className="mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {selectedInvoices.length > 0 ? 'Mark Selected' : 'Select invoices'}
          </span>
        </div>
        <ChevronDown 
          size={16}
          className={`ml-2 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-46 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className="flex items-center w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
                onClick={() => handleStatusSelect(option.value)}
              >
                {option.icon}
                <span className="flex-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAs;