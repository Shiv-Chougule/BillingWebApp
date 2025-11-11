'use client';
import { useState } from 'react';

function FilterDropdown({ selectedStatus, setSelectedStatus }) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { value: 'all', label: 'all' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFilterSelect = (filter) => {
    setSelectedStatus(filter.value); // Update the parent state
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {filters.find((f) => f.value === selectedStatus)?.label || 'all'}
        <svg
          className={`-mr-1 ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`${
                  selectedStatus === filter.value 
                    ? 'bg-gray-50 text-gray-900' 
                    : 'text-gray-700'
                } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                role="menuitem"
                onClick={() => handleFilterSelect(filter)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
