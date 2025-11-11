import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Funnel, TrendingUp, TrendingDown, Check } from 'lucide-react';

const CustomerSortDropdown = ({ onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('amount-high');
  const dropdownRef = useRef(null);

  const options = [
    { value: 'amount-high', label: 'amount-high' },
    { value: 'amount-low', label: 'amount-low' }
  ];

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

  const handleOptionClick = (option) => {
    setSelectedOption(option.label);
    setIsOpen(false);
    onSortChange(option.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
  <button
    onClick={() => setIsOpen(!isOpen)}
    className={`flex items-center justify-between px-4 py-2.5 w-48 bg-white border ${
      isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
    } rounded-lg shadow-sm transition-all duration-150`}
  >
    <div className="flex items-center">
      <Funnel size={16} className="text-gray-500 mr-2" />
      <span className="text-sm font-medium text-gray-700">Sort By</span>
    </div>
    <ChevronDown 
      size={18}
      className={`text-gray-500 ml-2 transition-transform duration-200 ${
        isOpen ? 'transform rotate-180' : ''
      }`}
    />
  </button>

  {isOpen && (
    <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <div className="py-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionClick(option)}
            className={`flex items-center w-full px-4 py-2.5 text-left text-sm ${
              selectedOption === option.label
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            } transition-colors duration-100`}
          >
            {option.value === 'amount-high' && <TrendingUp size={16} className="mr-2" />}
            {option.value === 'amount-low' && <TrendingDown size={16} className="mr-2" />}
            <span>{option.label}</span>
            {selectedOption === option.label && (
              <Check size={16} className="ml-auto text-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
  );
};

export default CustomerSortDropdown; 