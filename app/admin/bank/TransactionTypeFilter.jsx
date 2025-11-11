// components/TransactionTypeFilter.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Funnel, Upload, ChevronDown } from 'lucide-react';

// Custom hook to detect clicks outside the component
function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

export default function TransactionTypeFilter({ selectedType, setSelectedType }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Use the custom hook
  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  const options = [
    { value: 'all', label: 'All Transactions' },
    { value: 'debit', label: 'Debit' },
    { value: 'credit', label: 'Credit' }
  ];

  return (
    <div className="w-56 relative" ref={dropdownRef}>
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-56 flex justify-between items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className='flex gap-2'>
        <Funnel className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span>{options.find(opt => opt.value === selectedType)?.label || 'Filter'}</span>
      </div>
      <svg
        className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>        
    </button>
  
    {isOpen && (
      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-600">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setSelectedType(option.value);
              setIsOpen(false);
            }}
            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
              selectedType === option.value
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    )}
  </div>
  );
}