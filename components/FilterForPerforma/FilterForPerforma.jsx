'use client';
import { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, Check, List, CheckCircle, Clock, AlertTriangle, DollarSign, XCircle } from 'lucide-react';

function FilterDropdown({ selectedStatus, setSelectedStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'Pending Approval', label: 'Pending Approval' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Converted to Sales', label: 'Converted to Sales' },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterSelect = (filter) => {
    setSelectedStatus(filter.value); // Update the parent state
    setIsOpen(false);
  };

   useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className={`flex items-center justify-between px-4 py-2.5 w-64 bg-white dark:bg-gray-800 border ${
          isOpen 
            ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } rounded-lg shadow-sm transition-all duration-150`}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center">
          <Filter size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {filters.find((f) => f.value === selectedStatus)?.label || 'All Statuses'}
          </span>
        </div>
        <ChevronDown 
          size={18}
          className={`text-gray-500 dark:text-gray-400 ml-2 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`flex items-center w-full px-4 py-2.5 text-left text-sm ${
                  selectedStatus === filter.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors duration-100`}
                onClick={() => handleFilterSelect(filter)}
              >
                {filter.value === 'all' && <List size={16} className="mr-2 text-gray-500 dark:text-gray-400" />}
                {filter.value === 'Pending Approval' && <Clock size={16} className="mr-2 text-amber-500" />}
                {filter.value === 'Cancelled' && <XCircle size={16} className="mr-2 text-red-500" />}
                {filter.value === 'Approved' && <CheckCircle size={16} className="mr-2 text-green-500" />}
                {filter.value === 'Converted to Sales' && <DollarSign size={16} className="mr-2 text-blue-500" />}
                <span>{filter.label}</span>
                {selectedStatus === filter.value && (
                  <Check size={16} className="ml-auto text-blue-500 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
