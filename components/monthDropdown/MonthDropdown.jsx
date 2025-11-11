'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const MonthDropdown = ({ 
  selectedMonth, 
  onMonthChange, 
  dark = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const months = [
    { value: '', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  const selectedMonthLabel = months.find(month => month.value === selectedMonth)?.label || 'All Months';

  // Close dropdown when clicking outside
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

  const handleMonthSelect = (monthValue) => {
    onMonthChange(monthValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-46 inline-block text-left ${className}`}>
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          dark 
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
        }`}
      >
        <span className="text-xs sm:text-sm truncate">{selectedMonthLabel}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`absolute right-0 z-50 mt-1 w-full rounded-lg shadow-lg border transition-all duration-200 max-h-60 sm:max-h-100 overflow-y-auto hide-scrollbar ${
          dark 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="py-1">
            {months.map((month) => (
              <button
                key={month.value}
                onClick={() => handleMonthSelect(month.value)}
                className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition-colors duration-200 ${
                  selectedMonth === month.value
                    ? dark
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-500 text-white'
                    : dark
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-100'
                } ${month.value === '' ? 'border-b border-gray-500' : ''}`}
              >
                {month.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthDropdown;