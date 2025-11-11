'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Box, Wrench, CheckCircle, XCircle } from 'lucide-react';

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const StockFilterDropdown = ({ selectedFilter, setSelectedFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const filters = [
    { value: 'all', label: 'All Items', icon: <Box className="w-4 h-4 mr-2" /> },
    { value: 'services', label: 'Services', icon: <Wrench className="w-4 h-4 mr-2" /> },
    { value: 'products', label: 'Products', icon: <Box className="w-4 h-4 mr-2" /> },
    { value: 'in_stock', label: 'In Stock', icon: <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> },
    { value: 'out_of_stock', label: 'Out of Stock', icon: <XCircle className="w-4 h-4 mr-2 text-red-500" /> }
  ];

  const selectedFilterObj = filters.find(f => f.value === selectedFilter) || filters[0];

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
    {/* Custom dropdown trigger */}
    <div 
      className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center">
        {filters.find(f => f.value === selectedFilter)?.icon}
        <span className="text-gray-900 dark:text-gray-100">
          {filters.find(f => f.value === selectedFilter)?.label}
        </span>
      </div>
      <ChevronDown className={`w-4 h-4 ml-2 transition-transform text-gray-600 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
    </div>
  
    {/* Custom dropdown menu */}
    {isOpen && (
      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50">
        {filters.map((filter) => (
          <div 
            key={filter.value}
            className="flex items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
            onClick={() => {
              setSelectedFilter(filter.value);
              setIsOpen(false);
            }}
          >
            {filter.icon}
            <span className="text-gray-900 dark:text-gray-100">{filter.label}</span>
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

export default StockFilterDropdown;